import { useNavigate } from 'react-router-dom';
import {
  Package,
  FileText,
  TrendingUp,
  MessageCircle,
  ArrowRight,
  Clock
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { stats, orders, chats } from '../../data/mockData';
import styles from './Dashboard.module.css';

function StatCard({ icon: Icon, label, value, trend, color }) {
  return (
    <Card variant="paper" padding="medium" className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: color }}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div className={styles.statContent}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        {trend && <span className={styles.statTrend}>{trend}</span>}
      </div>
    </Card>
  );
}

function OrderRow({ order }) {
  const statusColors = {
    pending: '#D4A76A',
    in_progress: '#7BA876',
    quote_sent: '#8B7355',
    completed: '#A8B5A0'
  };

  return (
    <div className={styles.orderRow}>
      <div className={styles.orderInfo}>
        <span className={styles.orderNumber}>{order.orderNumber}</span>
        <span className={styles.orderClient}>{order.designerName}</span>
      </div>
      <div className={styles.orderDetail}>
        <span>{order.paperName}</span>
        <span className={styles.orderQty}>{order.quantity}부</span>
      </div>
      <div
        className={styles.orderStatus}
        style={{ background: statusColors[order.status] }}
      >
        {order.statusText}
      </div>
    </div>
  );
}

function ChatPreview({ chat }) {
  return (
    <div className={styles.chatRow}>
      <div className={styles.chatAvatar}>
        {chat.partnerName.charAt(0)}
      </div>
      <div className={styles.chatContent}>
        <div className={styles.chatHeader}>
          <span className={styles.chatName}>{chat.partnerName}</span>
          <span className={styles.chatTime}>{chat.lastMessageTime}</span>
        </div>
        <p className={styles.chatMessage}>{chat.lastMessage}</p>
      </div>
      {chat.unreadCount > 0 && (
        <span className={styles.chatBadge}>{chat.unreadCount}</span>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const designerChats = chats.filter(c => c.partnerRole === 'designer');

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>대시보드</h1>
          <p className={styles.subtitle}>오늘의 업무 현황을 확인하세요</p>
        </div>
        <Button icon={FileText} onClick={() => navigate('/maker/quote/new')}>
          새 견적서 작성
        </Button>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={Package}
          label="오늘 주문"
          value={`${stats.todayOrders}건`}
          color="var(--color-accent-warm)"
        />
        <StatCard
          icon={Clock}
          label="대기 중 견적"
          value={`${stats.pendingQuotes}건`}
          color="var(--color-secondary)"
        />
        <StatCard
          icon={TrendingUp}
          label="이달 매출"
          value={`${(stats.monthlyRevenue / 10000).toLocaleString()}만원`}
          trend="+12%"
          color="var(--color-accent-green)"
        />
        <StatCard
          icon={MessageCircle}
          label="읽지 않은 메시지"
          value={`${stats.unreadMessages}개`}
          color="var(--color-accent)"
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Recent Orders */}
        <Card variant="paper" padding="none" className={styles.ordersCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>최근 주문</h2>
            <button
              className={styles.viewAll}
              onClick={() => navigate('/maker/orders')}
            >
              전체보기 <ArrowRight size={16} />
            </button>
          </div>
          <div className={styles.ordersList}>
            {orders.slice(0, 4).map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        </Card>

        {/* Recent Chats */}
        <Card variant="paper" padding="none" className={styles.chatsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>최근 채팅</h2>
            <button
              className={styles.viewAll}
              onClick={() => navigate('/maker/chat')}
            >
              전체보기 <ArrowRight size={16} />
            </button>
          </div>
          <div className={styles.chatsList}>
            {designerChats.slice(0, 3).map((chat) => (
              <ChatPreview key={chat.id} chat={chat} />
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2 className={styles.cardTitle}>빠른 작업</h2>
        <div className={styles.actionsGrid}>
          <Card
            variant="outlined"
            padding="medium"
            hover
            onClick={() => navigate('/maker/quote/new')}
            className={styles.actionCard}
          >
            <FileText size={24} strokeWidth={1.5} />
            <span>견적서 작성</span>
          </Card>
          <Card
            variant="outlined"
            padding="medium"
            hover
            onClick={() => navigate('/maker/orders')}
            className={styles.actionCard}
          >
            <Package size={24} strokeWidth={1.5} />
            <span>주문 관리</span>
          </Card>
          <Card
            variant="outlined"
            padding="medium"
            hover
            onClick={() => navigate('/maker/chat')}
            className={styles.actionCard}
          >
            <MessageCircle size={24} strokeWidth={1.5} />
            <span>채팅</span>
          </Card>
        </div>
      </div>
    </div>
  );
}
