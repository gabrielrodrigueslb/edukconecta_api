import jwt from 'jsonwebtoken';
import { validateUser } from '../services/authService.js';

function buildCookieOptions(isProduction) {
  const cookieDomain = process.env.COOKIE_DOMAIN || '';
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  };

  if (cookieDomain) {
    options.domain = cookieDomain;
  }

  return options;
}

function clearAuthCookies(res, isProduction) {
  const baseOptions = buildCookieOptions(isProduction);
  res.clearCookie('authToken', baseOptions);
  if (baseOptions.domain) {
    const { domain, ...rest } = baseOptions;
    res.clearCookie('authToken', rest);
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const tenantId = req.tenant?.id;
    const user = await validateUser({ tenantId, email, password });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
    );

    const isProduction = process.env.NODE_ENV === 'production';
    clearAuthCookies(res, isProduction);
    res.cookie('authToken', token, buildCookieOptions(isProduction));

    res.json({
      user: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export function logout(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  clearAuthCookies(res, isProduction);
  res.json({ message: 'Logout realizado' });
}
