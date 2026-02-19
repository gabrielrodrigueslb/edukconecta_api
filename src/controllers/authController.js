import jwt from 'jsonwebtoken';
import { validateUser } from '../services/authService.js';

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

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProduction, // ✅ localhost = false
      sameSite: isProduction ? 'none' : 'lax', // ✅ OBRIGATÓRIO para localhost
      maxAge: 24 * 60 * 60 * 1000,
    });

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
  res.clearCookie('authToken', {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
});


  res.json({ message: 'Logout realizado' });
}
