import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import './EstatisticasPage.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#9a8a6a', font: { family: 'Inter', size: 12 } }
    },
    tooltip: {
      backgroundColor: '#16130e',
      borderColor: 'rgba(201,168,76,0.3)',
      borderWidth: 1,
      titleColor: '#c9a84c',
      bodyColor: '#e8dfc8',
    }
  },
  scales: {
    x: {
      ticks: { color: '#5a4e38' },
      grid: { color: 'rgba(201,168,76,0.06)' }
    },
    y: {
      ticks: { color: '#5a4e38' },
      grid: { color: 'rgba(201,168,76,0.06)' }
    }
  }
};

export default function EstatisticasPage() {
  const [data, setData] = useState(null);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/estatisticas'),
      api.get('/membros'),
    ]).then(([estRes, membRes]) => {
      setData(estRes.data);
      setMembros(membRes.data);
    }).catch(() => toast.error('Erro ao carregar estatísticas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="loading-spinner" />
    </div>
  );

  const meses = data?.movimentacoesMes || [];

  const movimentacoesData = {
    labels: meses.map(m => {
      const [y, mo] = m.mes.split('-');
      const date = new Date(Number(y), Number(mo) - 1);
      return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Entradas 🪙',
        data: meses.map(m => m.entradas),
        backgroundColor: 'rgba(201,168,76,0.6)',
        borderColor: '#c9a84c',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Saídas 🪙',
        data: meses.map(m => m.saidas),
        backgroundColor: 'rgba(192,57,43,0.4)',
        borderColor: '#c0392b',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const rankingData = {
    labels: membros.slice(0, 8).map(m => m.nomeRP),
    datasets: [{
      label: 'Ouro 🪙',
      data: membros.slice(0, 8).map(m => m.ouro),
      backgroundColor: membros.slice(0, 8).map((_, i) =>
        i === 0 ? 'rgba(201,168,76,0.9)' :
        i === 1 ? 'rgba(201,168,76,0.65)' :
        i === 2 ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.25)'
      ),
      borderColor: '#c9a84c',
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  const formatOuro = n => new Intl.NumberFormat('pt-BR').format(n || 0);
  const ouroTotal = data?.ouroTotal || 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Estatísticas</h1>
        <p className="page-subtitle">Análise da economia da guilda</p>
      </div>

      <div className="grid grid-3 mb-20">
        <div className="card text-center">
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🪙</div>
          <div className="stat-label">Ouro Total em Circulação</div>
          <div className="gold-amount" style={{ fontSize: '1.5rem', marginTop: 6 }}>
            {formatOuro(ouroTotal)}
          </div>
        </div>
        <div className="card text-center">
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>👥</div>
          <div className="stat-label">Total de Membros</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-bright)', marginTop: 6 }}>
            {membros.length}
          </div>
        </div>
        <div className="card text-center">
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
          <div className="stat-label">Média por Membro</div>
          <div className="gold-amount" style={{ fontSize: '1.5rem', marginTop: 6 }}>
            {membros.length > 0 ? formatOuro(Math.round(ouroTotal / membros.length)) : 0}
          </div>
        </div>
      </div>

      <div className="grid grid-2 mb-20">
        <div className="card">
          <h2 className="section-title mb-16">📈 Movimentações por Mês</h2>
          {meses.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <p>Sem dados de movimentações</p>
            </div>
          ) : (
            <div style={{ height: 260 }}>
              <Bar data={movimentacoesData} options={chartOptions} />
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title mb-16">🏆 Ranking de Ouro</h2>
          {membros.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <p>Sem membros cadastrados</p>
            </div>
          ) : (
            <div style={{ height: 260 }}>
              <Bar
                data={rankingData}
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  scales: {
                    ...chartOptions.scales,
                    x: { ...chartOptions.scales.x, ticks: { color: '#5a4e38' } },
                    y: { ...chartOptions.scales.y, ticks: { color: '#9a8a6a', font: { size: 11 } } }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-16">💰 Distribuição de Riqueza</h2>
        <div className="wealth-table">
          {membros.map((m, i) => {
            const pct = ouroTotal > 0 ? (m.ouro / ouroTotal * 100).toFixed(1) : 0;
            return (
              <div key={m.id} className="wealth-row">
                <span className="wealth-rank text-muted fs-sm">#{i + 1}</span>
                <span className="wealth-name">{m.nomeRP}</span>
                <div className="wealth-bar-track">
                  <div className="wealth-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="wealth-pct text-muted fs-sm">{pct}%</span>
                <span className="gold-amount fs-sm">{formatOuro(m.ouro)} 🪙</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
