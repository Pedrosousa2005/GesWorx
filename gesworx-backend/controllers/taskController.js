import { PrismaClient } from '@prisma/client';
import { taskSchema } from '../validations/taskValidation.js';

const prisma = new PrismaClient();

export const createTask = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden: Only superadmin can create tasks' });
    }

    const data = taskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        userId: data.userId,
        vanId: data.vanId,
        date: new Date(), // data de criação
        scheduledAt: data.scheduledAt ?? null,  // string ou null
      },
    });

    res.status(201).json(task);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: err.message });
  }
};





export const getTasks = async (req, res) => {
  try {
    // Se for superadmin: todos, se for user, só os dele
    const { role, id: userId } = req.user;

    let tasks;
    if (role === 'superadmin') {
      tasks = await prisma.task.findMany();
    } else {
      tasks = await prisma.task.findMany({ where: { userId } });
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Autorização: user só vê suas tasks, superadmin vê tudo
    if (req.user.role !== 'superadmin' && task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    let data = taskSchema.partial().parse(req.body);

    const task = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'superadmin' && task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data,
    });

    res.json(updatedTask);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: err.message });
  }
};



export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'superadmin' && task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.task.delete({ where: { id: Number(id) } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
