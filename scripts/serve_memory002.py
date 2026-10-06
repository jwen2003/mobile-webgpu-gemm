"""Serve existing project plus private control ledger, exclusively on loopback."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from urllib.parse import urlparse,parse_qs
import json
from memory002_protocol import Protocol

def handler(protocol):
 class Handler(SimpleHTTPRequestHandler):
  def log_message(self,*args):pass # no unrelated URL log
  def do_POST(self):
   if not self.path.startswith('/__memory002/'):self.send_error(404);return
   try:
    length=int(self.headers.get('Content-Length','0'))
    if not 0<length<=32768:raise ValueError('Invalid body size')
    data=json.loads(self.rfile.read(length));result=protocol.handle(self.path.split('/')[-1],data)
    payload=json.dumps(result).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
   except (ValueError,KeyError,StopIteration) as e:self.send_error(409,str(e))
  def do_GET(self):
   if self.path.startswith('/__memory002/state?'):
    try:
     session=parse_qs(urlparse(self.path).query)['sessionId'][0];payload=json.dumps(protocol.handle('state',{'sessionId':session})).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(payload)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(payload)
    except (ValueError,KeyError) as e:self.send_error(409,str(e))
   else:super().do_GET()
 return Handler

if __name__=='__main__':
 server=ThreadingHTTPServer(('127.0.0.1',8000),handler(Protocol('results/local/adb_memory/protocol_v2')))
 print('MEMORY002 v2 loopback server http://localhost:8000 (stop prior port8000 server first); no model starts automatically',flush=True)
 try:server.serve_forever()
 except KeyboardInterrupt:pass
 finally:server.server_close()
