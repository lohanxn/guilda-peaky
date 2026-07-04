import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ExportButtons from '../components/ui/ExportButtons';
import './HistoricoPage.css';

const OPERACOES_OPTS = [
  { value: '', label: 'Todas' },
  { value: 'ADD', label: '➕ Adicionar' },
  { value: 'REMOVE', label: '➖ Remover' },
  { value: 'SET', label: '✏️ Definir' },
  { value: 'DEPOSITO', label: '🏦 Depósito' },
  { value: 'SAQUE', label: '💸 Saque' },
];

const OP_BADGE = {
  ADD: 'badge-green',
  DEPOSITO: 'badge-green',
  REMOVE: 'badge-red',
  SAQUE: 'badge-red',
  SET: 'badge-gold',
};

const OP_LABEL = {
  ADD: '➕ Adicionado',
  REMOVE: '➖ Removido',
  SET: '✏️ Definido',
  DEPOSITO: '🏦 Depósito',
  SAQUE: '💸 Saque',
};

export default function HistoricoPage() {
  const [historico, setHistorico] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [membros, setMembros] = useState([]);

  const [filters, setFilters] = useState({
    membroId: '',
    operacao: '',
    dataInicio: '',
    dataFim: '',
  });

  const toast = useToast();
  const LIMIT = 20;

  const fetchHistorico = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.membroId) params.membroId = filters.membroId;
      if (filters.operacao) params.operacao = filters.operacao;
      if (filters.dataInicio) params.dataInicio = filters.dataInicio;
      if (filters.dataFim) params.dataFim = filters.dataFim;

      const res = await api.get('/historico', { params });
      setHistorico(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchHistorico(); }, [fetchHistorico]);

  useEffect(() => {
    api.get('/membros').then(res => setMembros(res.data));
  }, []);

  const formatOuro = n => new Intl.NumberFormat('pt-BR').format(n || 0);
  const formatDate = d => format(new Date(d), 'dd/MM/yy HH:mm', { locale: ptBR });
  const totalPages = Math.ceil(total / LIMIT);

  const handleFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ membroId: '', operacao: '', dataInicio: '', dataFim: '' });
    setPage(1);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Histórico</h1>
        <p className="page-subtitle">Registro completo de movimentações</p>
      </div>

      {/* Filters */}
      <div className="card mb-20">
        <div className="historico-filters">
          <div className="form-group">
            <label className="form-label">Membro</label>
            <select className="form-input" value={filters.membroId} onChange={e => handleFilter('membroId', e.target.value)}>
              <option value="">Todos</option>
              {membros.map(m => <option key={m.id} value={m.id}>{m.nomeRP}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Operação</label>
            <select className="form-input" value={filters.operacao} onChange={e => handleFilter('operacao', e.target.value)}>
              {OPERACOES_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Data Início</label>
            <input type="date" className="form-input" value={filters.dataInicio} onChange={e => handleFilter('dataInicio', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Data Fim</label>
            <input type="date" className="form-input" value={filters.dataFim} onChange={e => handleFilter('dataFim', e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Limpar</button>
          </div>
        </div>
      </div>

      <div className="action-row mb-20">
        <span className="text-muted fs-sm">{total} registro(s) encontrado(s)</span>
        <ExportButtons data={historico} filename="historico" />
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="loading-spinner" />
          </div>
        ) : historico.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📜</div>
            <h3>Nenhum registro encontrado</h3>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Membro</th>
                  <th>Operação</th>
                  <th>Quantidade</th>
                  <th>Anterior</th>
                  <th>Novo</th>
                  <th>Admin</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {historico.map(h => (
                  <tr key={h.id}>
                    <td className="text-muted fs-sm">{formatDate(h.createdAt)}</td>
                    <td>{h.membro?.nomeRP || <span className="text-muted">Banco</span>}</td>
                    <td>
                      <span className={`badge ${OP_BADGE[h.operacao] || 'badge-gold'}`}>
                        {OP_LABEL[h.operacao] || h.operacao}
                      </span>
                    </td>
                    <td className="gold-amount">{formatOuro(h.quantidade)} 🪙</td>
                    <td className="text-secondary fs-sm">{formatOuro(h.saldoAnterior)}</td>
                    <td className="gold-amount fs-sm">{formatOuro(h.saldoNovo)}</td>
                    <td className="text-muted fs-sm">{h.admin?.name}</td>
                    <td className="text-muted fs-sm" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="historico-pagination">
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Anterior</button>
            <span className="text-muted fs-sm">Página {page} de {totalPages}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próxima →</button>
          </div>
        )}
      </div>
    </div>
  );
}
