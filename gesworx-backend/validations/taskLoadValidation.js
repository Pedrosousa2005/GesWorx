import { z } from 'zod';

export const createTaskLoadSchema = z.object({
  taskId: z.number(),
  vanId: z.number(),
  userIds: z.array(z.number().int()),
});


export const addMaterialSchema = z.object({
  materialId: z.number({ required_error: "materialId é obrigatório" }),
  quantity: z.number().min(1).default(1).optional(),
});
