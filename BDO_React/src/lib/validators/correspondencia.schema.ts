import { z } from 'zod';

export const correspondenciaSchema = z.object({
  emisor:                z.string().min(1, 'Requerido').max(200),
  receptor:              z.string().min(1, 'Requerido').max(200),
  consecutivo:           z.string().min(1, 'Requerido').max(50),
  fecha:                 z.string().min(1, 'Requerido'),
  componente:            z.string().optional(),
  asunto:                z.string().min(1, 'Requerido').max(500),
  plazo_respuesta:       z.string().optional(),
  estado:                z.enum(['PENDIENTE', 'RESPONDIDO', 'NO APLICA RESPUESTA']),
  consecutivo_respuesta: z.string().optional(),
  fecha_respuesta:       z.string().optional(),
  link:                  z.string().url('URL inválida').optional().or(z.literal('')),
});

export type CorrespondenciaInput = z.infer<typeof correspondenciaSchema>;
