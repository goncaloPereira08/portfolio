// src/auth.js
import createAuth0Client from '@auth0/auth0-spa-js';

let auth0Client;

export async function initAuth() {
  auth0Client = await createAuth0Client({
    domain: import.meta.env.VUE_APP_AUTH0_DOMAIN,
    clientId: import.meta.env.VUE_APP_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: import.meta.env.VUE_APP_AUTH0_AUDIENCE
    }
  });
}

export async function login() {
  await auth0Client.loginWithRedirect();
}

export async function handleRedirect() {
  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    await auth0Client.handleRedirectCallback();
    window.history.replaceState({}, document.title, '/');
  }
}

export async function isAuthenticated() {
  return await auth0Client.isAuthenticated();
}

export async function getUser() {
  return await auth0Client.getUser();
}

export async function getToken() {
  return await auth0Client.getTokenSilently();
}


const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token inválido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { id, nome, role }
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = authMiddleware;
