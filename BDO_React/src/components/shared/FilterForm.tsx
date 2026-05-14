'use client';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Filters {
  desde?:  string;
  hasta?:  string;
  estado?: string;
  buscar?: string;
}

interface FilterFormProps {
  filters:    Filters;
  estadoOpts: string[];
  onChange:   (payload: Partial<Filters>) => void;
}

export function FilterForm({ filters, estadoOpts, onChange }: FilterFormProps) {
  return (
    <div
      className="rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {'desde' in filters && (
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--text-muted)' }}>Desde</Label>
          <Input
            type="date"
            value={filters.desde ?? ''}
            onChange={(e) => onChange({ desde: e.target.value })}
          />
        </div>
      )}
      {'hasta' in filters && (
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--text-muted)' }}>Hasta</Label>
          <Input
            type="date"
            value={filters.hasta ?? ''}
            onChange={(e) => onChange({ hasta: e.target.value })}
          />
        </div>
      )}
      {estadoOpts.length > 0 && (
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--text-muted)' }}>Estado</Label>
          <Select value={filters.estado ?? 'Todos'} onValueChange={(v) => onChange({ estado: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {estadoOpts.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {'buscar' in filters && (
        <div className={cn('space-y-1.5', estadoOpts.length === 0 ? 'col-span-2 md:col-span-4' : '')}>
          <Label style={{ color: 'var(--text-muted)' }}>Buscar</Label>
          <Input
            placeholder="Folio, actividad, tramo…"
            value={filters.buscar ?? ''}
            onChange={(e) => onChange({ buscar: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
