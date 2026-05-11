// BDO_React/src/app/(dashboard)/estado-actual/estado-actual.utils.ts
const MS_POR_DIA = 1000 * 60 * 60 * 24;

function parseDateUTC(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export interface PlazosCalc {
  plazoOriginal: number;
  plazoTotal: number;
  diasTranscurridos: number;
  diasRestantes: number;
  pctTiempo: number;
  diasExtension: number;
}

export function calcularPlazos(
  fechaInicio: string,
  fechaFin: string,
  plazoActual: string | null,
  today?: Date,
): PlazosCalc {
  const _today = today ?? new Date();
  const todayUTC = new Date(
    Date.UTC(_today.getUTCFullYear(), _today.getUTCMonth(), _today.getUTCDate()),
  );

  const inicio = parseDateUTC(fechaInicio);
  const finOrig = parseDateUTC(fechaFin);
  const finVig = parseDateUTC(plazoActual ?? fechaFin);

  const plazoOriginal = Math.floor((finOrig.getTime() - inicio.getTime()) / MS_POR_DIA);
  const plazoTotal = Math.max(
    Math.floor((finVig.getTime() - inicio.getTime()) / MS_POR_DIA),
    1,
  );
  const diasTranscurridos = Math.max(
    Math.floor((todayUTC.getTime() - inicio.getTime()) / MS_POR_DIA),
    0,
  );
  const diasRestantes = Math.max(plazoTotal - diasTranscurridos, 0);
  const pctTiempo = Math.min((diasTranscurridos / plazoTotal) * 100, 100);
  const diasExtension = Math.floor((finVig.getTime() - finOrig.getTime()) / MS_POR_DIA);

  return { plazoOriginal, plazoTotal, diasTranscurridos, diasRestantes, pctTiempo, diasExtension };
}
