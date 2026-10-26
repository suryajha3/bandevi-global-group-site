"""Loopback-only browser fixture; temporary records, no email worker."""
import mimetypes
from pathlib import Path
import secrets
import time
from urllib.parse import urlsplit
import test_dashboard as fixture

root=Path(__file__).resolve().parent.parent
class Preview(fixture.enquiries.Handler):
    def handle(self):
        try:return super().handle()
        except (BrokenPipeError,ConnectionAbortedError,ConnectionResetError):return

    def do_GET(self):
        route=urlsplit(self.path).path
        if route.startswith(('/api/','/team-inbox/')) or route=='/health':
            try:return super().do_GET()
            except (BrokenPipeError,ConnectionAbortedError,ConnectionResetError):return
        path=(root/route.lstrip('/')).resolve()
        if path.is_dir():path=path/'index.html'
        if not path.is_relative_to(root) or not path.is_file():return self.send_error(404)
        data=path.read_bytes()
        if path.suffix=='.html' and 'source=1' in self.path:
            import re
            data=re.sub(r'<body([^>]*)>[\s\S]*?</body>',r'<body\1><div id="site"></div><script src="/assets/site.js" defer></script></body>',data.decode()).encode()
        self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(path)[0] or 'application/octet-stream');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)

fixture.server.RequestHandlerClass=Preview
fixture.enquiries.ORIGINS.add(fixture.base)
with fixture.enquiries.connect() as db:
    for i in range(30):db.execute('INSERT INTO demo_slots VALUES(?,?,?,?,1)',(secrets.token_hex(12),int(time.time())+86400+i*3600,30,'synthetic@example.test'))
print(fixture.server.server_port,flush=True)
try:
    import threading
    threading.Event().wait()
finally:fixture.server.shutdown();fixture.server.server_close();fixture.temporary.cleanup()
