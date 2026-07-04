import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import HistoricoModal from '../components/ui/HistoricoModal';
import ExportButtons from '../components/ui/ExportButtons';
import './MembrosPage.css';

const OPERACOES = [
  { value: 'ADD', label: '➕ Adicionar Ouro' },
  { value: 'REMOVE', label: '➖ Remover Ouro' },
  { value: 'SET', label: '✏️ Definir Saldo' },
];

export default function MembrosPage() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showOuro, setShowOuro] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  // Forms
  const [addForm, setAddForm] = useState({ nomeRP: '', ouro: '', observacoes: '' });
  const [editForm, setEditForm] = useState({ nomeRP: '', observacoes: '' });
  const [ouroForm, setOuroForm] = useState({ operacao: 'ADD', quantidade: '', motivo: '' });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchMembros = useCallback(async () => {
    try {
      const res = await api.get('/membros', { params: { search: search || undefined } });
      setMembros(res.data);
    } catch {
      toast.error('Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchMembros, 300);
    return () => clearTimeout(t);
  }, [fetchMembros]);

  const formatOuro = n => new Intl.NumberFormat('pt-BR').format(n || 0);
  const formatDate = d => format(new Date(d), 'dd/MM/yy HH:mm', { locale: ptBR });

  const handleAdd = async () => {
    if (!addForm.nomeRP.trim()) { toast.error('Nome RP é obrigatório'); return; }
    setSubmitting(true);
    try {
      await api.post('/membros', addForm);
      toast.success('Membro adicionado com sucesso!');
      setShowAdd(false);
      setAddForm({ nomeRP: '', ouro: '', observacoes: '' });
      fetchMembros();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao adicionar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editForm.nomeRP.trim()) { toast.error('Nome RP é obrigatório'); return; }
    setSubmitting(true);
    try {
      await api.put(`/membros/${selected.id}`, editForm);
      toast.success('Membro atualizado!');
      setShowEdit(false);
      fetchMembros();
    } catch {
      toast.error('Erro ao atualizar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOuro = async () => {
    if (!ouroForm.quantidade || !ouroForm.motivo) {
      toast.error('Preencha quantidade e motivo');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/membros/${selected.id}/ouro`, ouroForm);
      const labels = { ADD: 'adicionado', REMOVE: 'removido', SET: 'definido' };
      toast.success(`Ouro ${labels[ouroForm.operacao]} com sucesso!`);
      setShowOuro(false);
      setOuroForm({ operacao: 'ADD', quantidade: '', motivo: '' });
      fetchMembros();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro na operação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/membros/${selected.id}`);
      toast.success('Membro removido');
      setShowDelete(false);
      fetchMembros();
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const openEdit = (m) => { setSelected(m); setEditForm({ nomeRP: m.nomeRP, observacoes: m.observacoes || '' }); setShowEdit(true); };
  const openOuro = (m) => { setSelected(m); setShowOuro(true); };
  const openHistorico = (m) => { setSelected(m); setShowHistorico(true); };
  const openDelete = (m) => { setSelected(m); setShowDelete(true); };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Membros</h1>
        <p className="page-subtitle">Gerencie os membros e o ouro da guilda</p>
      </div>

      <div className="action-row">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Pesquisar membro..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-8">
          <ExportButtons data={membros} filename="membros" />
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            ＋ Adicionar Membro
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="loading-spinner" />
          </div>
        ) : membros.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>Nenhum membro encontrado</h3>
            <p>Adicione o primeiro membro da guilda</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome RP</th>
                  <th>Ouro</th>
                  <th>Cadastro</th>
                  <th>Atualizado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {membros.map((m, i) => (
                  <tr key={m.id}>
                    <td className="text-muted fs-sm">#{i + 1}</td>
                    <td>
                      <span className="membro-name">{m.nomeRP}</span>
                      {m.observacoes && <span className="membro-obs">{m.observacoes}</span>}
                    </td>
                    <td><span className="gold-amount">{formatOuro(m.ouro)} 🪙</span></td>
                    <td className="text-muted fs-sm">{formatDate(m.createdAt)}</td>
                    <td className="text-muted fs-sm">{formatDate(m.updatedAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => openOuro(m)} title="Gerenciar Ouro">🪙</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => openHistorico(m)} title="Histórico">📜</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(m)} title="Editar">✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => openDelete(m)} title="Excluir">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={showAdd} title="Adicionar Membro" onClose={() => setShowAdd(false)}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Nome RP *</label>
            <input className="form-input" placeholder="Ex: Arthur Shelby" value={addForm.nomeRP} onChange={e => setAddForm(f => ({ ...f, nomeRP: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Ouro Inicial</label>
            <input type="number" className="form-input" placeholder="0" min="0" value={addForm.ouro} onChange={e => setAddForm(f => ({ ...f, ouro: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Observações</label>
            <textarea className="form-input" placeholder="Opcional..." value={addForm.observacoes} onChange={e => setAddForm(f => ({ ...f, observacoes: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={submitting}>
            {submitting ? 'Salvando...' : '✓ Adicionar'}
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={showEdit} title={`Editar: ${selected?.nomeRP}`} onClose={() => setShowEdit(false)}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Nome RP *</label>
            <input className="form-input" value={editForm.nomeRP} onChange={e => setEditForm(f => ({ ...f, nomeRP: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Observações</label>
            <textarea className="form-input" value={editForm.observacoes} onChange={e => setEditForm(f => ({ ...f, observacoes: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setShowEdit(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleEdit} disabled={submitting}>
            {submitting ? 'Salvando...' : '✓ Salvar'}
          </button>
        </div>
      </Modal>

      {/* Ouro Modal */}
      <Modal open={showOuro} title={`Ouro: ${selected?.nomeRP}`} onClose={() => setShowOuro(false)}>
        <div className="ouro-saldo-atual">
          <span>Saldo atual:</span>
          <span className="gold-amount fs-lg">{formatOuro(selected?.ouro)} 🪙</span>
        </div>
        <div className="modal-body mt-16">
          <div className="form-group">
            <label className="form-label">Operação *</label>
            <select className="form-input" value={ouroForm.operacao} onChange={e => setOuroForm(f => ({ ...f, operacao: e.target.value }))}>
              {OPERACOES.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantidade *</label>
            <input type="number" className="form-input" placeholder="0" min="0" value={ouroForm.quantidade} onChange={e => setOuroForm(f => ({ ...f, quantidade: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Motivo *</label>
            <input className="form-input" placeholder="Descreva o motivo da alteração" value={ouroForm.motivo} onChange={e => setOuroForm(f => ({ ...f, motivo: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setShowOuro(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleOuro} disabled={submitting}>
            {submitting ? 'Processando...' : '✓ Confirmar'}
          </button>
        </div>
      </Modal>

      {/* Historico Modal */}
      <HistoricoModal open={showHistorico} membro={selected} onClose={() => setShowHistorico(false)} />

      {/* Delete Confirm */}
      <ConfirmModal
        open={showDelete}
        title="Excluir Membro"
        message={`Tem certeza que deseja remover "${selected?.nomeRP}" da guilda?`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
