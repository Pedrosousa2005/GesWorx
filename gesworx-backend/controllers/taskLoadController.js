import { PrismaClient } from '@prisma/client';
import { createTaskLoadSchema, addMaterialSchema } from '../validations/taskLoadValidation.js';

const prisma = new PrismaClient();

export const createTaskLoad = async (req, res) => {
    try {
        if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Only superadmin or admin can create task loads' });
        }

        const data = createTaskLoadSchema.parse(req.body); // validando userIds como array de ints

        // Criar o TaskLoad sem os usuários
        const taskLoad = await prisma.taskLoad.create({
            data: {
                task: { connect: { id: data.taskId } },
                van: { connect: { id: data.vanId } },

            },
            include: {
                task: true,
                van: true,
            },
        });

        // Agora criar as relações na tabela TaskLoadUser
        if (data.userIds && data.userIds.length > 0) {
            await Promise.all(
                data.userIds.map((userId) =>
                    prisma.taskLoadUser.create({
                        data: {
                            taskLoadId: taskLoad.id,
                            userId: userId,
                        },
                    })
                )
            );
        }

        // Recarregar o TaskLoad para incluir os usuários relacionados
        const taskLoadWithUsers = await prisma.taskLoad.findUnique({
            where: { id: taskLoad.id },
            include: {
                users: {
                    include: { user: true },
                },
                task: true,
                van: true,
            },
        });

        res.status(201).json(taskLoadWithUsers);

    } catch (err) {
        if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
        console.error(err);
        res.status(500).json({ error: err.message || 'Erro ao criar taskLoad' });
    }
};



export const addMaterialToTaskLoad = async (req, res) => {
    try {
        const { taskLoadId } = req.params;

        const existingTaskLoad = await prisma.taskLoad.findUnique({
            where: { id: Number(taskLoadId) },
        });

        if (!existingTaskLoad) {
            return res.status(404).json({ error: 'TaskLoad não encontrada' });
        }

        const taskLoadUsers = await prisma.taskLoadUser.findMany({
            where: { taskLoadId: Number(taskLoadId) },
            select: { userId: true }
        });

        const userIds = taskLoadUsers.map(tlu => tlu.userId);

        if (req.user.role !== 'superadmin' && !userIds.includes(req.user.id)) {
            return res.status(403).json({ error: 'Forbidden: You cannot add material to this taskLoad' });
        }

        const data = addMaterialSchema.parse(req.body);

        const material = await prisma.taskLoadMaterial.create({
            data: {
                taskLoadId: Number(taskLoadId),
                materialId: data.materialId,
                quantity: data.quantity || 1,
            },
        });

        res.status(201).json(material);
    } catch (err) {
        if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
        console.error(err);
        res.status(500).json({ error: err.message || 'Erro ao adicionar material à taskLoad' });
    }
};


// 1. Get all materials for a taskLoad
export const getMaterialsByTaskLoad = async (req, res) => {
    try {
        const { taskLoadId } = req.params;

        const materials = await prisma.taskLoadMaterial.findMany({
            where: { taskLoadId: Number(taskLoadId) },
            include: { material: true }, // para trazer detalhes do material se quiser
        });

        res.json(materials);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Erro ao buscar materiais da taskLoad' });
    }
};

export const getUsersByTaskLoad = async (req, res) => {
    try {
        const { taskLoadId } = req.params;

        const taskLoad = await prisma.taskLoad.findUnique({
            where: { id: Number(taskLoadId) },
            include: {
                users: {
                    include: {
                        user: true,  // inclui os dados completos do user
                    },
                },
            },
        });

        if (!taskLoad) {
            return res.status(404).json({ error: 'TaskLoad não encontrada' });
        }

        const users = taskLoad.users.map(tlu => tlu.user);

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Erro ao buscar usuários da taskLoad' });
    }
};


export const getTaskLoadDetails = async (req, res) => {
    try {
        const { taskLoadId } = req.params;

        const taskLoad = await prisma.taskLoad.findUnique({
            where: { id: Number(taskLoadId) },
            include: {
                task: true,
                users: {
                    include: { user: true },
                },
                van: true,
                materialInstances: {           // <--- nome correto do campo
                    include: { material: true },
                },
            },
        });

        if (!taskLoad) {
            return res.status(404).json({ error: 'TaskLoad não encontrada' });
        }

        if (req.user.role !== 'superadmin' && !taskLoad.users.some(tlu => tlu.userId === req.user.id)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(taskLoad);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Erro ao buscar detalhes da taskLoad' });
    }
};

