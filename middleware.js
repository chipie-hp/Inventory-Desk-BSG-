/**
 * Middleware for Vercel - Tenant Routing
 * This file handles:
 * 1. Redirecting root (no tenant) to /drim_admin.html
 * 2. Tenant subdomain/param detection
 * 3. CORS headers
 */

export default async function handler(req, res) {
  const { pathname, search } = new URL(req.url, `http://${req.headers.host}`);
  
  // Get tenant from query param or subdomain
  const params = new URLSearchParams(search);
  let tenant = params.get('tenant') || params.get('t');
  
  if (!tenant) {
    // Try to detect from subdomain
    const host = req.headers.host || '';
    const parts = host.split('.');
    if (parts.length >= 3 && parts[0] !== 'www' && !['bsginventory', 'inventory-desk'].includes(parts[0])) {
      tenant = parts[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    }
  }

  // Root path without tenant → redirect to admin
  if (pathname === '/' && !tenant) {
    return res.redirect(302, '/drim_admin.html');
  }

  // Serve normally
  return res.status(200).end();
}
