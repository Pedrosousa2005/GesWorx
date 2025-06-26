import { z } from 'zod';

export const vanSchema = z.object({
  licensePlate: z.string().min(1),
  // Pode adicionar mais campos, ex: model, capacity, etc.
});
