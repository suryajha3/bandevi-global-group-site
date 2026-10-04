"""No provider connection or production credentials; mocked setup flow only."""
import contextlib
import importlib.util
import io
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch, MagicMock

spec=importlib.util.spec_from_file_location('mail_setup',Path(__file__).with_name('setup-professional-email.py'))
setup=importlib.util.module_from_spec(spec);spec.loader.exec_module(setup)

class MailSetupTests(unittest.TestCase):
    def run_setup(self, answers, login_error=None, restart_error=None):
        with tempfile.TemporaryDirectory() as folder:
            config=Path(folder)/'settings.env';original='ENQUIRY_DB=/tmp/test-inbox\nRATE_LIMIT_SALT=synthetic\n';config.write_text(original)
            smtp=MagicMock();smtp.__enter__.return_value=smtp
            if login_error:smtp.login.side_effect=login_error
            output=io.StringIO()
            runner=MagicMock()
            if restart_error:runner.side_effect=[subprocess.CalledProcessError(1,['systemctl']),None]
            with patch.object(setup.os,'geteuid',return_value=0,create=True),patch.object(setup,'Path',side_effect=lambda value:config if str(value)=='/etc/bandevi-enquiries.env' else Path(value)),patch('builtins.input',side_effect=answers),patch.object(setup.getpass,'getpass',return_value='synthetic"mail\\password$'),patch.object(setup.smtplib,'SMTP_SSL',return_value=smtp) as connect,patch.object(setup.subprocess,'run',runner),patch.object(setup.time,'sleep'),contextlib.redirect_stdout(output):
                try:setup.main();failure=None
                except (SystemExit,subprocess.CalledProcessError) as exc:failure=exc
            content=config.read_text()
            self.assertNotIn('synthetic"mail\\password$',output.getvalue())
            return original,content,failure,smtp,connect,runner

    def test_refused_product_never_authenticates(self):
        original,content,error,smtp,connect,run=self.run_setup(['MICROSOFT365'])
        self.assertEqual(content,original);self.assertIsInstance(error,SystemExit);connect.assert_not_called();run.assert_not_called()

    def test_bad_authentication_keeps_settings(self):
        original,content,error,smtp,connect,run=self.run_setup(['PROFESSIONAL','CONNECT'],login_error=RuntimeError('mock auth failure'))
        self.assertEqual(content,original);self.assertIsInstance(error,SystemExit);smtp.send_message.assert_not_called();run.assert_not_called()

    def test_receipt_confirmation_required(self):
        original,content,error,smtp,connect,run=self.run_setup(['PROFESSIONAL','CONNECT','NOT RECEIVED'])
        self.assertEqual(content,original);self.assertIsInstance(error,SystemExit);smtp.send_message.assert_called_once();run.assert_not_called()

    def test_confirmed_test_saves_private_sender_settings(self):
        original,content,error,smtp,connect,run=self.run_setup(['PROFESSIONAL','CONNECT','RECEIVED'])
        self.assertIsNone(error);self.assertIn('SMTP_TLS=ssl',content);self.assertIn('SMTP_PASSWORD='+setup.env_quote('synthetic"mail\\password$'),content)
        message=smtp.send_message.call_args.args[0]
        self.assertEqual(message['To'],setup.MAILBOX);self.assertEqual(message['From'],setup.MAILBOX)
        self.assertNotIn('customer details',message.get_content())
        self.assertEqual(connect.call_args.args,('smtpout.secureserver.net',465))
        self.assertTrue(connect.call_args.kwargs['context'].check_hostname)

    def test_restart_failure_restores_old_settings(self):
        original,content,error,smtp,connect,run=self.run_setup(['PROFESSIONAL','CONNECT','RECEIVED'],restart_error=True)
        self.assertEqual(content,original);self.assertIsInstance(error,subprocess.CalledProcessError)
        self.assertEqual(run.call_count,2)

    def test_control_characters_rejected(self):
        for value in ['bad\npassword','bad\rpassword','bad\x00password']:
            with self.assertRaises(ValueError):setup.env_quote(value)

if __name__=='__main__':unittest.main()
