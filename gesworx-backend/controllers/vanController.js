import { PrismaClient } from '@prisma/client';
import { vanSchema } from '../validations/vanValidation.js';

const prisma = new PrismaClient();

export const createVan = async (req, res) => {
  try {
    const data = vanSchema.parse(req.body);

    const existingVan = await prisma.van.findUnique({
      where: { licensePlate: data.licensePlate },
    });
    if (existingVan) return res.status(400).json({ error: 'Van already exists' });

    const van = await prisma.van.create({ data });
    res.status(201).json(van);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: err.message });
  }
};

export const getVans = async (req, res) => {
  try {
    const vans = await prisma.van.findMany();
    res.json(vans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVanById = async (req, res) => {
  try {
    const { id } = req.params;
    const van = await prisma.van.findUnique({ where: { id: Number(id) } });
    if (!van) return res.status(404).json({ error: 'Van not found' });
    res.json(van);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateVan = async (req, res) => {
  try {
    const { id } = req.params;
    const data = vanSchema.partial().parse(req.body);

    const van = await prisma.van.update({
      where: { id: Number(id) },
      data,
    });
    res.json(van);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: err.message });
  }
};

export const deleteVan = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.van.delete({ where: { id: Number(id) } });
    res.json({ message: 'Van deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
