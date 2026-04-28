'use client';
import { RecordCard } from './RecordCard';

interface RecordListProps<T extends { id: string }> {
  items: T[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  renderHeader: (item: T) => React.ReactNode;
  renderDetail: (item: T) => React.ReactNode;
}

export function RecordList<T extends { id: string }>({
  items,
  selected,
  onSelect,
  renderHeader,
  renderDetail,
}: RecordListProps<T>) {
  if (!items.length) {
    return (
      <div
        className="rounded-lg p-8 text-center text-sm"
        style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        No hay registros para mostrar.
      </div>
    );
  }

  return (
    <div
      className="rounded-lg divide-y overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {items.map((item) => (
        <RecordCard
          key={item.id}
          isOpen={selected === item.id}
          onToggle={() => onSelect(selected === item.id ? null : item.id)}
          header={renderHeader(item)}
          detail={renderDetail(item)}
        />
      ))}
    </div>
  );
}
