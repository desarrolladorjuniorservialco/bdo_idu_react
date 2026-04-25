'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { correspondenciaSchema, type CorrespondenciaInput } from '@/lib/validators/correspondencia.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COMPONENTES = ['Ambiental - SST','Social','PMT','Técnico','Jurídico','Financiero','General'];
const ESTADOS = ['PENDIENTE','RESPONDIDO','NO APLICA RESPUESTA'] as const;

interface Props {
  defaultValues?: Partial<CorrespondenciaInput>;
  onSubmit:       (data: CorrespondenciaInput) => Promise<void>;
  onCancel:       () => void;
  loading?:       boolean;
}

export function CorrespondenciaForm({ defaultValues, onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<CorrespondenciaInput>({
      resolver: zodResolver(correspondenciaSchema),
      defaultValues: { estado: 'PENDIENTE', ...defaultValues },
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Emisor *</Label>
          <Input {...register('emisor')} placeholder="Entidad emisora" />
          {errors.emisor && <p className="text-xs text-red-600 mt-0.5">{errors.emisor.message}</p>}
        </div>
        <div>
          <Label>Receptor *</Label>
          <Input {...register('receptor')} placeholder="Entidad receptora" />
          {errors.receptor && <p className="text-xs text-red-600 mt-0.5">{errors.receptor.message}</p>}
        </div>
        <div>
          <Label>No. Consecutivo *</Label>
          <Input {...register('consecutivo')} placeholder="IDU-XXX-2026" />
          {errors.consecutivo && <p className="text-xs text-red-600 mt-0.5">{errors.consecutivo.message}</p>}
        </div>
        <div>
          <Label>Fecha *</Label>
          <Input type="date" {...register('fecha')} />
        </div>
        <div>
          <Label>Componente</Label>
          <Select onValueChange={v => setValue('componente', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {COMPONENTES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Estado *</Label>
          <Select
            defaultValue={defaultValues?.estado ?? 'PENDIENTE'}
            onValueChange={v => setValue('estado', v as any)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Asunto *</Label>
        <Input {...register('asunto')} placeholder="Descripción breve" />
        {errors.asunto && <p className="text-xs text-red-600 mt-0.5">{errors.asunto.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Plazo respuesta</Label>
          <Input type="date" {...register('plazo_respuesta')} />
        </div>
        <div>
          <Label>Consecutivo respuesta</Label>
          <Input {...register('consecutivo_respuesta')} />
        </div>
        <div>
          <Label>Fecha respuesta</Label>
          <Input type="date" {...register('fecha_respuesta')} />
        </div>
        <div>
          <Label>Link (URL)</Label>
          <Input {...register('link')} placeholder="https://…" />
          {errors.link && <p className="text-xs text-red-600 mt-0.5">{errors.link.message}</p>}
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
