import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: '⚔️', label: 'Dashboard', end: true },
  { to: '/membros', icon: '👥', label: 'Membros' },
  { to: '/banco', icon: '🏦', label: 'Banco da Guilda' },
  { to: '/historico', icon: '📜', label: 'Histórico' },
  { to: '/estatisticas', icon: '📊', label: 'Estatísticas' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⚜️</div>
        <div className="logo-text">
          <span className="logo-main">PEAKY</span>
          <span className="logo-sub">BLINDERS</span>
        </div>
      </div>

      <div className="sidebar-guild">
        <span className="guild-label">Colorado RP</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-info">
          <div className="admin-avatar">{admin?.name?.[0] || 'A'}</div>
          <div className="admin-details">
            <span className="admin-name">{admin?.name}</span>
            <span className="admin-role">Administrador</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Sair">
          ↩
        </button>
      </div>
    </aside>
  );
}
