// lib/zoomToken.js
let cached = { token: '', exp: 0 };

export async function zoomToken() {
  if (cached.exp > Date.now()) return cached.token;

  const creds = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  const resp = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    { method: 'POST', headers: { Authorization: `Basic ${creds}` } }
  );

  const { access_token, expires_in } = await resp.json();
  cached = { token: access_token, exp: Date.now() + (expires_in - 60) * 1000 };
  return access_token;
}
