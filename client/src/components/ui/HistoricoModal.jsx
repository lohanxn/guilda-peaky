import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../services/api';
import Modal from './Modal';
import './HistoricoModal.css';

const OP_LABEL = {
  ADD: '➕ Adicionado',
  REMOVE: '➖ Removido',
  SET: '✏️ Definido',
  DEPOSITO: '🏦 Depósito',
  SAQUE: '💸 Saque',
};

const OP_BADGE = {
  ADD: 'badge-green',
  DEPOSITO: 'badge-green',
  REMOVE: 'badge-red',
  SAQUE: 'badge-red',
  SET: 'badge-gold',
};

export default function HistoricoModal({ open, membro, onClose }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && membro) {
      setLoading(true);
      api.get(`/historico/membro/${membro.id}`)
        .then(res => setHistorico(res.data))
        .catch(() => setHistorico([]))
        .finally(() => setLoading(false));
    }
  }, [open, membro]);

  const formatOuro = n => new Intl.NumberFormat('pt-BR').format(n || 0);
  const formatDate = d => format(new Date(d), 'dd/MM/yy HH:mm', { locale: ptBR });

  return (
    <Modal open={open} title={`Histórico: ${membro?.nomeRP}`} onClose={onClose} size="lg">
      {loading ? (
        <div className="hm-loading">
          <div className="loading-spinner" />
        </div>
      ) : historico.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <h3>Sem movimentações registradas</h3>
        </div>
      ) : (
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Operação</th>
                <th>Qtd</th>
                <th>Saldo Ant.</th>
                <th>Saldo Novo</th>
                <th>Motivo</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {historico.map(h => (
                <tr key={h.id}>
                  <td className="hm-date">{formatDate(h.createdAt)}</td>
                  <td>
                    <span className={`badge ${OP_BADGE[h.operacao] || 'badge-gold'}`}>
                      {OP_LABEL[h.operacao] || h.operacao}
                    </span>
                  </td>
                  <td className="hm-gold">{formatOuro(h.quantidade)}</td>
                  <td className="hm-ant">{formatOuro(h.saldoAnterior)}</td>
                  <td className="hm-gold">{formatOuro(h.saldoNovo)}</td>
                  <td className="hm-motivo">{h.motivo}</td>
                  <td className="hm-admin">{h.admin?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
      </div>
    </Modal>
  );
}
