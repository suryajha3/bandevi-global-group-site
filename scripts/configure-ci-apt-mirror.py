"""Avoid the intermittent Azure Ubuntu mirror stall on ephemeral CI workers only."""
import os
import pathlib
import re
import subprocess

if os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_OS') != 'Linux':
    raise SystemExit('This helper is only for Linux GitHub Actions workers.')

apt = pathlib.Path('/etc/apt')
sources = [apt / 'apt-mirrors.txt', apt / 'apt-security-mirrors.txt', apt / 'sources.list']
sources += sorted((apt / 'sources.list.d').glob('*.list'))
sources += sorted((apt / 'sources.list.d').glob('*.sources'))
changed = 0
for source in sources:
    if not source.is_file():
        continue
    original = source.read_text()
    updated = re.sub(r'https?://azure\.archive\.ubuntu\.com/ubuntu/?',
                     'https://archive.ubuntu.com/ubuntu/', original)
    if updated != original:
        subprocess.run(['sudo', 'tee', str(source)], input=updated, text=True,
                       stdout=subprocess.DEVNULL, check=True)
        changed += 1

# Package signatures and every install/test failure remain authoritative.
limits = 'Acquire::Retries "1";\nAcquire::http::Timeout "30";\nAcquire::https::Timeout "30";\n'
subprocess.run(['sudo', 'tee', str(apt / 'apt.conf.d/80-bandevi-ci-network')],
               input=limits, text=True, stdout=subprocess.DEVNULL, check=True)
print(f'CI Ubuntu mirror configuration ready; {changed} source files updated.')
