// Modelo Mongoose em memória (apenas para testes, sem MongoDB)
const crypto = require('crypto');
function criarModelo() {
  const docs = [];
  const match = (d, q = {}) => Object.entries(q).every(([k, v]) => {
    if (k === '$or') return v.some(sub => match(d, sub));
    return String(d[k]) === String(v);
  });
  const semSenha = d => { if (!d) return d; const { senha, ...r } = d; return r; };
  const q = (val) => { const p = Promise.resolve(val); p.select = (s) => Promise.resolve(s === '-senha' ? (Array.isArray(val) ? val.map(semSenha) : semSenha(val)) : val); return p; };
  class Model {
    constructor(data) { Object.assign(this, data); this._id = crypto.randomBytes(12).toString('hex'); }
    async save() { if (!this.role) this.role = 'cliente'; docs.push({ ...this }); return this; }
    static findOne(query) { return q(docs.find(d => match(d, query)) || null); }
    static find(query) { return q(docs.filter(d => match(d, query))); }
    static findById(id) { return q(docs.find(d => d._id === String(id)) || null); }
    static findByIdAndUpdate(id, data) { const d = docs.find(x => x._id === String(id)); if (d) Object.assign(d, data); return q(d || null); }
    static findByIdAndDelete(id) { const i = docs.findIndex(x => x._id === String(id)); return q(i >= 0 ? docs.splice(i, 1)[0] : null); }
    static _docs() { return docs; }
  }
  return Model;
}
module.exports = { criarModelo };
