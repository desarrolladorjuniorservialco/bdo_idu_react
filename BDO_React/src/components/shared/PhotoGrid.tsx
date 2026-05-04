import Image from 'next/image';

interface Foto {
  url: string;
  descripcion?: string;
}

export function PhotoGrid({ fotos }: { fotos: Foto[] }) {
  if (!fotos.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        Registro fotogrÃ¡fico ({fotos.length})
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {fotos.map((f, i) => (
          <a
            key={f.url ?? `foto-${i}`}
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="relative aspect-square rounded-md overflow-hidden bg-[var(--muted)]">
              <Image
                src={f.url}
                alt={f.descripcion ?? `Foto ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            {f.descripcion && (
              <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {f.descripcion}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
