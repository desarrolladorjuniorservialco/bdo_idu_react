'use client';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('recharts').then((m) => ({ default: m.BarChart })), {
  ssr: false,
});
const Bar = dynamic(() => import('recharts').then((m) => ({ default: m.Bar })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => ({ default: m.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => ({ default: m.YAxis })), { ssr: false });
const CartesianGrid = dynamic(
  () => import('recharts').then((m) => ({ default: m.CartesianGrid })),
  { ssr: false },
);
const Tooltip = dynamic(() => import('recharts').then((m) => ({ default: m.Tooltip })), {
  ssr: false,
});
const Legend = dynamic(() => import('recharts').then((m) => ({ default: m.Legend })), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => ({ default: m.ResponsiveContainer })),
  {
    ssr: false,
  },
);

interface DataPoint {
  name: string;
  valor: number;
  ejecutado: number;
}

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

export function StatusBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis
          tickFormatter={(v: string | number) => `$${(toNumber(v) / 1_000_000).toFixed(0)}M`}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          formatter={(v: string | number) => [`$${(toNumber(v) / 1_000_000).toFixed(1)} M`]}
        />
        <Legend />
        <Bar dataKey="valor" name="Presupuesto" fill="var(--idu-blue)" radius={[4, 4, 0, 0]} />
        <Bar
          dataKey="ejecutado"
          name="Ejecutado"
          fill="var(--accent-green)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
