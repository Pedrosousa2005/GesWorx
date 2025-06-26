import { PrismaClient } from '@prisma/client';
import { materialSchema } from '../validations/materialValidation.js';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

const generateQRCode = async (text) => {
  try {
    return await QRCode.toDataURL(text);
  } catch {
    throw new Error('QR code generation failed');
  }
};

export const createMaterial = async (req, res) => {
  try {
    const data = materialSchema.parse(req.body);

    // Preparar dados para criação do material
    const materialData = {
      name: data.name,
      category: data.category,
      subcategory: data.subcategory ?? "",
      qrCode: 'pending',
    };

    // Se houver parentId, conectar o material pai
    if (data.parentId) {
      materialData.parent = {
        connect: { id: data.parentId },
      };
    }

    // Criar material com qrCode provisório
    const material = await prisma.material.create({
      data: materialData,
    });

    // Gerar QR code baseado no ID do material
    const qrCodeDataURL = await generateQRCode(`material:${material.id}`);

    // Atualizar material com qrCode correto
    const updatedMaterial = await prisma.material.update({
      where: { id: material.id },
      data: { qrCode: qrCodeDataURL },
    });

    res.status(201).json(updatedMaterial);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: err.message });
  }
};



export const getMaterials = async (req, res) => {
  try {
    const materials = await prisma.material.findMany();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await prisma.material.findUnique({ where: { id: Number(id) } });
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const data = materialSchema.partial().parse(req.body);

    const material = await prisma.material.update({
      where: { id: Number(id) },
      data,
    });
    res.json(material);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: err.message });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.material.delete({ where: { id: Number(id) } });
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.material.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });


    const categoryNames = categories.map(c => c.category);

    res.json(categoryNames);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
