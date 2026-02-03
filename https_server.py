# https_server.py
# HTTPS local dev server that prints browser logs to PowerShell.
# ✅ Works on Python 3.12+ and serves JS modules correctly.

import ssl
from http.server import SimpleHTTPRequestHandler, HTTPServer

class LoggingHandler(SimpleHTTPRequestHandler):
    # Ensure .js files are served with correct MIME type for ES modules
    def end_headers(self):
        if self.path.endswith(".js"):
            self.send_header("Content-Type", "application/javascript")
        super().end_headers()

    # Handle client logs posted to /log
    def do_POST(self):
        if self.path == "/log":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            msg = body.decode(errors="ignore")
            print(f"\n📋 [Client Log] {msg}\n")
            self.send_response(200)
            self.end_headers()
        else:
            super().do_POST()

# Server setup
server_address = ("0.0.0.0", 5500)
httpd = HTTPServer(server_address, LoggingHandler)

# Modern SSL setup for Python 3.12+
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")

httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print("✅ Serving HTTPS on https://0.0.0.0:5500")
print("💡 Open https://<your-local-ip>:5500 on your phone (e.g. https://10.0.0.51:5500)")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\n🛑 Server stopped.")
