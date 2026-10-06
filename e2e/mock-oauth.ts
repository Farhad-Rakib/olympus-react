import { createServer, Server } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';

/**
 * Minimal OAuth 2.0 / OIDC provider for browser tests (same protocol as
 * olympus-core/tests/e2e/mock_oauth.py). /authorize redirects straight back with a code
 * for the current identity; /token checks client credentials and PKCE.
 */
export const MOCK_CLIENT_ID = 'e2e-client';
export const MOCK_CLIENT_SECRET = 'e2e-secret';

export interface MockIdentity { sub: string; email: string; email_verified: boolean; name: string }

export function startMockOAuth(port: number) {
  let identity: MockIdentity | null = null;
  const codes = new Map<string, { challenge: string; redirectUri: string; identity: MockIdentity }>();
  const tokens = new Map<string, MockIdentity>();
  const token = () => randomBytes(16).toString('base64url');

  const server: Server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
    const json = (status: number, body: unknown) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    };

    if (req.method === 'GET' && url.pathname === '/authorize') {
      const q = url.searchParams;
      if (q.get('client_id') !== MOCK_CLIENT_ID || !identity) return json(400, { error: 'invalid_request' });
      const code = token();
      codes.set(code, { challenge: q.get('code_challenge') ?? '', redirectUri: q.get('redirect_uri') ?? '', identity });
      const target = new URL(q.get('redirect_uri') ?? '');
      target.searchParams.set('code', code);
      target.searchParams.set('state', q.get('state') ?? '');
      res.writeHead(302, { Location: target.toString() });
      return res.end();
    }

    if (req.method === 'POST' && url.pathname === '/token') {
      let raw = '';
      req.on('data', (chunk) => { raw += chunk; });
      req.on('end', () => {
        const body = new URLSearchParams(raw);
        const grant = codes.get(body.get('code') ?? '');
        codes.delete(body.get('code') ?? '');
        const verifierHash = createHash('sha256').update(body.get('code_verifier') ?? '').digest('base64url');
        if (!grant || body.get('client_secret') !== MOCK_CLIENT_SECRET || verifierHash !== grant.challenge
          || body.get('redirect_uri') !== grant.redirectUri) {
          return json(400, { error: 'invalid_grant' });
        }
        const accessToken = token();
        tokens.set(accessToken, grant.identity);
        json(200, { access_token: accessToken, token_type: 'Bearer' });
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/userinfo') {
      const found = tokens.get((req.headers.authorization ?? '').replace('Bearer ', ''));
      return found ? json(200, found) : json(401, { error: 'invalid_token' });
    }

    json(404, {});
  });

  return new Promise<{ setIdentity: (i: MockIdentity) => void; close: () => Promise<void> }>((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve({
      setIdentity: (i) => { identity = i; },
      close: () => new Promise((done) => server.close(() => done())),
    }));
  });
}
