// Prisma em memória: permite correr os testes de integração sem PostgreSQL
type Row = Record<string, any>;
const tables: Record<string, Row[]> = {};
const ids: Record<string, number> = {};
function t(name: string) { return (tables[name] ||= []); }
function match(row: Row, where: any = {}): boolean {
  return Object.entries(where).every(([k, v]: [string, any]) => {
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      if ('in' in v) return v.in.includes(row[k]);
      if ('some' in v) return true;
      if (k.includes('_') && !(k in row)) return match(row, v); // chave composta
      return true;
    }
    return row[k] === v;
  });
}
function model(name: string) {
  return {
    findUnique: async ({ where }: any) => t(name).find(r => match(r, where)) ?? null,
    findFirst: async ({ where }: any = {}) => t(name).find(r => match(r, where)) ?? null,
    findMany: async ({ where }: any = {}) => t(name).filter(r => match(r, where)),
    create: async ({ data }: any) => {
      const { membros, ...rest } = data;
      const row = { id: (ids[name] = (ids[name] || 0) + 1), criado_em: new Date(), ...rest };
      t(name).push(row);
      if (membros?.create) await model('threadMember').create({ data: { ...membros.create, id_thread: row.id } });
      return row;
    },
    update: async ({ where, data }: any) => {
      const row = t(name).find(r => match(r, where)); if (!row) throw new Error('not found');
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined) row[k] = v; }); return row;
    },
    delete: async ({ where }: any) => { const i = t(name).findIndex(r => match(r, where)); return t(name).splice(i, 1)[0]; },
    deleteMany: async ({ where }: any = {}) => { const before = t(name).length; tables[name] = t(name).filter(r => !match(r, where)); return { count: before - t(name).length }; },
    count: async ({ where }: any = {}) => t(name).filter(r => match(r, where)).length,
  };
}
const prisma: any = new Proxy({}, { get: (_, k: string) => k.startsWith('$') ? async () => {} : model(k) });
export default prisma;
