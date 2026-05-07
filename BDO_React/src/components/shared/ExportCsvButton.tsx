'use client';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportCsvButtonProps {
  data:     object[];
  filename: string;
}

export function ExportCsvButton({ data, filename }: ExportCsvButtonProps) {
  function handleExport() {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const rows = [
      keys.join(','),
      ...data.map((row: any) =>
        keys.map((k) => {
          const v = String(row[k] ?? '');
          return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
        }).join(',')
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={!data.length}>
      <Download className="h-3.5 w-3.5 mr-1" />
      Exportar CSV
    </Button>
  );
}
