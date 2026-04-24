import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Faltan variables de entorno REACT_APP_SUPABASE_URL o REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url, anonKey);

export function paginateQuery(query, pageSize = 1499) {
  return new Promise(async (resolve, reject) => {
    let rows = [];
    let offset = 0;
    try {
      while (true) {
        const { data, error } = await query.range(offset, offset + pageSize - 1);
        if (error) throw error;
        rows = rows.concat(data || []);
        if (!data || data.length < pageSize) break;
        offset += pageSize;
      }
      resolve(rows);
    } catch (err) {
      reject(err);
    }
  });
}
