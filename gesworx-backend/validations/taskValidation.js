import { z } from 'zod';

function parseDateTimeFromCustomFormat(value) {
  if (typeof value !== 'string') return undefined;

  const [datePart, timePart] = value.split(',');
  if (!datePart || !timePart) return undefined;

  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  if (
    !day || !month || !year ||
    hour === undefined || minute === undefined
  ) return undefined;

  const jsDate = new Date(year, month - 1, day, hour, minute);
  return jsDate;
}
export const taskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  userId: z.number(),
  vanId: z.number().optional(),
  scheduledAt: z.string().optional(),
});

