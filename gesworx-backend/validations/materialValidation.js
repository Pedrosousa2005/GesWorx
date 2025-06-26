import { z } from 'zod';

export const materialSchema = z.object({
  name: z.string(),
  category: z.string(),
  subcategory: z.union([z.string(), z.null()]).transform(val => val ?? ""),  
  parentId: z.number().nullable().optional(),
  vanId: z.number().nullable().optional(),

});
