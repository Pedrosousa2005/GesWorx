import { PrismaClient } from '@prisma/client';
import { userSchema } from '../validations/userValidation.js';
import { hashPassword } from '../utils/auth.js';

const prisma = new PrismaClient();

export const createUser = async (req, res) => {
  try {
    const validatedData = userSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashed = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashed,
        role: validatedData.role,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    res.status(201).json(user);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
};

// List all users (only for superadmin)
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
