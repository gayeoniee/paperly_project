import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  FileText,
  MessageCircle,
  Package,
  HeartHandshake,
  LogOut,
  Bell
} from 'lucide-react';
import styles from './DesignerLayout.module.css';

const navItems = [
  { to: '/designer/home', icon: Home, label: '홈' },
  { to: '/designer/ai-chat', icon: MessageSquare, label: 'AI 종이 추천' },
  { to: '/designer/quotes', icon: FileText, label: '견적 확인' },
  { to: '/designer/outsourcing', icon: HeartHandshake, label: '나의 의뢰' },
  { to: '/designer/chat', icon: MessageCircle, label: '채팅' },
  { to: '/designer/orders', icon: Package, label: '주문 현황' },
];

export default function DesignerLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar (Desktop) */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>Paperly</h1>
          <p className={styles.logoSub}>사용자</p>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.sidebarItem} ${isActive ? styles.active : ''}`
              }
            >
              <item.icon size={20} strokeWidth={1.5} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} strokeWidth={1.5} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className={styles.mainArea}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.headerLogo}>Paperly</h1>
          <div className={styles.headerActions}>
            <button className={styles.headerBtn}>
              <Bell size={22} strokeWidth={1.5} />
              <span className={styles.badge}>2</span>
            </button>
            <button className={styles.headerBtn} onClick={handleLogout}>
              <LogOut size={22} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <nav className={styles.bottomNav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={22} strokeWidth={1.5} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
