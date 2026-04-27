import { z } from 'zod';

export const anotacionSchema = z.object({
  fecha:    z.string().min(1, 'Requerido'),
  tramo:    z.string().optional(),
  civ:      z.string().optional(),
  pk:       z.string().optional(),
  anotacion: z.string().min(1, 'Requerido').max(2000),
});

export type AnotacionInput = z.infer<typeof anotacionSchema>;
