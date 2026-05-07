'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface DataPoint { name: string; valor: number; ejecutado: number }

export function StatusBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis
          tickFormatter={v => `$${(v / 1_000_000).toFixed(0)}M`}
          tick={{ fontSize: 10 }}
        />
        <Tooltip formatter={(v: number) => [`$${(v / 1_000_000).toFixed(1)} M`]} />
        <Legend />
        <Bar dataKey="valor"    name="Presupuesto" fill="var(--idu-blue)"   radius={[4,4,0,0]} />
        <Bar dataKey="ejecutado" name="Ejecutado"  fill="var(--accent-green)" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
