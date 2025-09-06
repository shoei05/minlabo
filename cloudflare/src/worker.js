/**
 * Cloudflare Worker: Stable Horde proxy
 * - Hides API key in server-side environment
 * - Adds CORS for the GitHub Pages origin
 */

const HORDE_BASE = 'https://stablehorde.net/api/v2';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(204, null, origin, env.ALLOWED_ORIGIN);
    }

    try {
      if (url.pathname === '/generate/async' && request.method === 'POST') {
        return await forwardJson(`${HORDE_BASE}/generate/async`, request, env, origin);
      }

      if (url.pathname.startsWith('/generate/status/') && request.method === 'GET') {
        const id = url.pathname.split('/').pop();
        return await forwardGet(`${HORDE_BASE}/generate/status/${id}`, env, origin);
      }

      return corsResponse(404, { error: 'Not Found' }, origin, env.ALLOWED_ORIGIN);
    } catch (err) {
      return corsResponse(500, { error: 'Proxy error', detail: String(err) }, origin, env.ALLOWED_ORIGIN);
    }
  }
}

async function forwardJson(targetUrl, request, env, origin) {
  const body = await request.text();
  const res = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'apikey': env.STABLE_HORDE_API_KEY,
      'Client-Agent': env.CLIENT_AGENT || 'MinLaboCardGame:1.0',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body
  });

  const text = await res.text();
  return corsRawResponse(res.status, text, res.headers.get('Content-Type') || 'application/json', origin, env.ALLOWED_ORIGIN);
}

async function forwardGet(targetUrl, env, origin) {
  const res = await fetch(targetUrl, {
    headers: {
      'apikey': env.STABLE_HORDE_API_KEY,
      'Client-Agent': env.CLIENT_AGENT || 'MinLaboCardGame:1.0',
      'Accept': 'application/json'
    }
  });
  const text = await res.text();
  return corsRawResponse(res.status, text, res.headers.get('Content-Type') || 'application/json', origin, env.ALLOWED_ORIGIN);
}

function corsHeaders(origin, allowed) {
  const allowOrigin = (allowed === '*' || !origin) ? '*' : (origin && origin.endsWith(allowed) ? origin : allowed);
  return {
    'Access-Control-Allow-Origin': allowOrigin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function corsResponse(status, data, origin, allowed) {
  const headers = corsHeaders(origin, allowed);
  if (data == null) return new Response(null, { status, headers });
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

function corsRawResponse(status, textBody, contentType, origin, allowed) {
  return new Response(textBody, { status, headers: { 'Content-Type': contentType, ...corsHeaders(origin, allowed) } });
}

