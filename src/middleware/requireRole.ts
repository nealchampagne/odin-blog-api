import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export const requireRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    console.log("Role check:", req.user);
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};