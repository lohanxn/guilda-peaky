import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import './BancoPage.css';

export default function BancoPage() {
  const [banco, setBanco] = useState(null);
  const [membros, setMembros] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null); // 'deposito' | 'saque'
  const [form, setForm] = useState({ membroId: '', quantidade: '', motivo: '' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchAll = async () => {
    try {
      const [bancoRes, membrosRes, histRes] = await Promise.all([
        api.get('/banco'),
        api.get('/membros'),
        api.get('/banco/historico'),
      ]);
      setBanco(bancoRes.data);
      setMembros(membrosRes.data);
      setHistorico(histRes.data);
    } catch {
      toast.error('Erro ao carregar banco');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const formatOuro = n => new Intl.NumberFormat('pt-BR').format(n || 0);
  const formatDate = d => format(new Date(d), 'dd/MM/yy HH:mm', { locale: ptBR });

  const handleTransfer = async () => {
    if (!form.membroId || !form.quantidade || !form.motivo) {
      toast.error('Preencha todos os campos');
      return;
    }
    setSubmitting(true);
    try {
      const endpoint = showModal === 'saque' ? '/banco/banco-para-membro' : '/banco/membro-para-banco';
      await api.post(endpoint, form);
      toast.success(showModal === 'saque' ? 'Ouro enviado ao membro!' : 'Ouro depositado no banco!');
      setShowModal(null);
      setForm({ membroId: '', quantidade: '', motivo: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro na transferência');
    } finally {
      setSubmitting(false);
    }
  };

  const opLabel = (op) => {
    const labels = { DEPOSITO: 'Depósito', SAQUE: 'Saque', ADD: 'Entrada', REMOVE: 'Saída' };
    return labels[op] || op;
  };

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="loading-spinner" />
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Banco da Guilda</h1>
        <p className="page-subtitle">Controle de transferências entre banco e membros</p>
      </div>

      <div className="banco-hero card mb-20">
        <div className="banco-icon">🏦</div>
        <div className="banco-info">
          <span className="banco-label">Saldo do Banco</span>
          <span className="banco-saldo">{formatOuro(banco?.saldo)} 🪙</span>
        </div>
        <div className="banco-actions">
          <button className="btn btn-primary" onClick={() => setShowModal('saque')}>
            📤 Enviar para Membro
          </button>
          <button className="btn btn-outline" onClick={() => setShowModal('deposito')}>
            📥 Receber de Membro
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-16">📜 Histórico do Banco</h2>
        {historico.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📜</div>
            <h3>Nenhuma movimentação</h3>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Operação</th>
                  <th>Membro</th>
                  <th>Quantidade</th>
                  <th>Saldo Anterior</th>
                  <th>Saldo Novo</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {historico.map(h => (
                  <tr key={h.id}>
                    <td className="text-muted fs-sm">{formatDate(h.createdAt)}</td>
                    <td>
                      <span className={`badge ${h.operacao === 'DEPOSITO' ? 'badge-green' : 'badge-red'}`}>
                        {opLabel(h.operacao)}
                      </span>
                    </td>
                    <td>{h.membro?.nomeRP || '—'}</td>
                    <td className="gold-amount">{formatOuro(h.quantidade)} 🪙</td>
                    <td className="text-secondary">{formatOuro(h.saldoAnterior)}</td>
                    <td className="gold-amount">{formatOuro(h.saldoNovo)}</td>
                    <td className="text-muted fs-sm">{h.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!showModal}
        title={showModal === 'saque' ? '📤 Enviar Ouro ao Membro' : '📥 Receber Ouro de Membro'}
        onClose={() => setShowModal(null)}
      >
        <div className="banco-transfer-info">
          <span>Saldo do banco:</span>
          <span className="gold-amount">{formatOuro(banco?.saldo)} 🪙</span>
        </div>
        <div className="modal-body mt-16">
          <div className="form-group">
            <label className="form-label">Membro *</label>
            <select className="form-input" value={form.membroId} onChange={e => setForm(f => ({ ...f, membroId: e.target.value }))}>
              <option value="">Selecione um membro</option>
              {membros.map(m => (
                <option key={m.id} value={m.id}>{m.nomeRP} ({formatOuro(m.ouro)} 🪙)</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantidade *</label>
            <input type="number" className="form-input" placeholder="0" min="1" value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Motivo *</label>
            <input className="form-input" placeholder="Motivo da transferência" value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setShowModal(null)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleTransfer} disabled={submitting}>
            {submitting ? 'Processando...' : '✓ Confirmar'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
