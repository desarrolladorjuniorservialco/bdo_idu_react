import { z } from 'zod';

export const aprobacionSchema = z.object({
  cantidad_validada: z.coerce.number().min(0, 'Debe ser ≥ 0'),
  observacion:       z.string().max(1000).optional(),
});

export const devolucionSchema = z.object({
  observacion: z.string().min(10, 'Mínimo 10 caracteres').max(1000),
});

export type AprobacionInput = z.infer<typeof aprobacionSchema>;
export type DevolucionInput  = z.infer<typeof devolucionSchema>;
