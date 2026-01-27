import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Package,
  MessageCircle,
  FolderOpen,
  HeartHandshake,
  LogOut,
  Bell,
  User
} from 'lucide-react';
import styles from './MakerLayout.module.css';

const navItems = [
  { to: '/maker/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { to: '/maker/quote/new', icon: FileText, label: '견적서 작성' },
  { to: '/maker/orders', icon: Package, label: '주문 관리' },
  { to: '/maker/outsourcing', icon: HeartHandshake, label: '의뢰 및 협업' },
  { to: '/maker/chat', icon: MessageCircle, label: '채팅' },
  { to: '/maker/files', icon: FolderOpen, label: '파일 관리' },
];

export default function MakerLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>Paperly</h1>
          <span className={styles.roleTag}>장인</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <item.icon size={20} strokeWidth={1.5} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={20} strokeWidth={1.5} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.welcomeText}>안녕하세요, 김장인 사장님</h2>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.headerButton}>
              <Bell size={20} strokeWidth={1.5} />
              <span className={styles.badge}>3</span>
            </button>
            <button className={styles.headerButton}>
              <User size={20} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
