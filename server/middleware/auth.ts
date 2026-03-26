import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    roles: string[];
    avatar?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', async (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    
    try {
      // Fetch latest roles from database to ensure they are up to date
      const [roles] = await pool.query(
        'SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?',
        [user.id]
      );
      user.roles = (roles as any[]).map(r => r.name);
      req.user = user;
      next();
    } catch (dbErr) {
      console.error('Error fetching user roles in auth middleware:', dbErr);
      // Fallback to token roles if DB fetch fails
      req.user = user;
      next();
    }
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.sendStatus(401);
    const hasRole = req.user.roles.some(role => roles.includes(role));
    if (!hasRole) return res.sendStatus(403);
    next();
  };
};
