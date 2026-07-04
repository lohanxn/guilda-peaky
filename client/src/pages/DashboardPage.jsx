import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import './DashboardPage.css';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={`stat-card card ${color || ''}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="loading-spinner" />
      </div>
    </div>
  );

  const formatOuro = (n) => new Intl.NumberFormat('pt-BR').format(n || 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral da economia da guilda</p>
      </div>

      <div className="grid grid-4 mb-20">
        <StatCard
          icon="👥"
          label="Total de Membros"
          value={data?.totalMembros || 0}
          color="stat-blue"
        />
        <StatCard
          icon="🪙"
          label="Ouro Total da Guilda"
          value={`${formatOuro(data?.ouroTotal)} 🪙`}
          color="stat-gold"
        />
        <StatCard
          icon="🏦"
          label="Banco da Guilda"
          value={`${formatOuro(data?.banceSaldo)} 🪙`}
          color="stat-green"
        />
        <StatCard
          icon="📅"
          label="Última Movimentação"
          value={data?.ultimaMovimentacao
            ? format(new Date(data.ultimaMovimentacao), 'dd/MM/yy HH:mm', { locale: ptBR })
            : '—'
          }
          color="stat-red"
        />
      </div>

      <div className="card">
        <div className="card-header-row">
          <h2 className="section-title">🏆 Ranking de Ouro</h2>
          <span className="text-muted fs-sm">Top membros por saldo</span>
        </div>
        <div className="ranking-list mt-16">
          {data?.ranking?.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>Nenhum membro encontrado</h3>
              <p>Adicione membros na página de Membros</p>
            </div>
          )}
          {data?.ranking?.map((m, i) => (
            <div key={m.id} className="ranking-item">
              <div className={`rank-badge ${i < 3 ? `rank-${i + 1}` : ''}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <div className="rank-bar-wrap">
                <div className="rank-name">{m.nomeRP}</div>
                <div className="rank-bar-track">
                  <div
                    className="rank-bar-fill"
                    style={{
                      width: `${data.ouroTotal > 0 ? (m.ouro / (data.ranking[0]?.ouro || 1)) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
              <span className="rank-amount gold-amount">
                {formatOuro(m.ouro)} 🪙
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
