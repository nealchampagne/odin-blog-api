import prisma from '../lib/prisma';
import type { Request, Response } from 'express';
import type { User as PrismaUser} from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --------------------
// Helpers
// --------------------

const getUserOrFail = async (userId: string, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return null;
  }
  return user;
};

const sanitizeUser = ({ password, ...rest}: PrismaUser) => rest;

// --------------------
// Public users route controllers
// --------------------

const registerUser = async (req: Request, res: Response) => {
  const { name, password } = req.body;

  const email = req.body.email.toLowerCase();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, name, password: hashedPassword, role: 'USER' },
    });
    res.status(201).json(sanitizeUser(newUser));
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Failed to register user' });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log("LOGIN BODY:", req.body);
  console.log("HEADERS:", req.headers);
  console.log("ROUTE HIT");


  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to login' });
  }
}

// --------------------
// Protected users route controllers
// --------------------
const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const user = await getUserOrFail(userId, res);
    if (!user) return;

    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
};

const updateCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name, password } = req.body;

  try {
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json(sanitizeUser(updatedUser));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update current user' });
  }
};

const deleteCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete current user' });
  }
};

// --------------------
// Admin-only users route controllers
// --------------------
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const sanitizedUsers = users.map(sanitizeUser);
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id!;

  try {
    const user = await getUserOrFail(userId, res);
    

    if (!user) return;

    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const updateUserById = async (req: Request, res: Response) => {
  const userId = req.params.id!;
  const { name } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });
    res.json(sanitizeUser(updatedUser));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  const userId = req.params.id!;

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};