'use client';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { RecordCard } from './RecordCard';

const VIRTUAL_THRESHOLD = 50;

interface RecordListProps<T extends { id: string }> {
  items:        T[];
  selected:     string | null;
  onSelect:     (id: string | null) => void;
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
  const parentRef = useRef<HTMLDivElement>(null);
  const useVirtual = items.length > VIRTUAL_THRESHOLD;

  const virtualizer = useVirtualizer({
    count:         useVirtual ? items.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize:  () => 56,
    overscan:      5,
  });

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

  if (useVirtual) {
    return (
      <div
        ref={parentRef}
        className="rounded-lg overflow-auto"
        style={{ height: '560px', border: '1px solid var(--border)' }}
      >
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((vItem) => {
            const item = items[vItem.index];
            return (
              <div
                key={vItem.key}
                style={{ position: 'absolute', top: vItem.start, left: 0, right: 0 }}
              >
                <RecordCard
                  isOpen={selected === item.id}
                  onToggle={() => onSelect(selected === item.id ? null : item.id)}
                  header={renderHeader(item)}
                  detail={renderDetail(item)}
                />
              </div>
            );
          })}
        </div>
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
