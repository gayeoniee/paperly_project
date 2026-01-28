import { useState } from 'react';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';
import Card from '../../components/common/Card';
import { orders } from '../../data/mockData';
import styles from './Orders.module.css';

const statusConfig = {
  pending: { icon: Clock, label: '대기 중', color: 'var(--color-warning)' },
  quote_sent: { icon: Package, label: '견적 발송', color: 'var(--color-primary)' },
  in_progress: { icon: Truck, label: '진행 중', color: 'var(--color-success)' },
  completed: { icon: CheckCircle, label: '완료', color: 'var(--color-secondary-dark)' }
};

function OrderCard({ order }) {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <Card variant="paper" padding="medium" className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <div className={styles.orderIcon} style={{ background: `${status.color}20` }}>
          <StatusIcon size={20} style={{ color: status.color }} />
        </div>
        <div className={styles.orderInfo}>
          <span className={styles.orderNumber}>{order.orderNumber}</span>
          <span className={styles.orderDate}>{order.createdAt}</span>
        </div>
        <span className={styles.orderStatus} style={{ color: status.color }}>
          {status.label}
        </span>
      </div>

      <div className={styles.orderDetail}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>품목</span>
          <span className={styles.detailValue}>{order.paperName}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>수량</span>
          <span className={styles.detailValue}>{order.quantity.toLocaleString()}부</span>
        </div>
        {order.totalPrice > 0 && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>금액</span>
            <span className={styles.detailValue}>{order.totalPrice.toLocaleString()}원</span>
          </div>
        )}
      </div>

      {order.progress > 0 && order.status !== 'completed' && (
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span>진행률</span>
            <span>{order.progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${order.progress}%` }}
            />
          </div>
        </div>
      )}

      {order.dueDate && (
        <div className={styles.dueDate}>
          <Clock size={14} />
          <span>납기일: {order.dueDate}</span>
        </div>
      )}
    </Card>
  );
}

export default function Orders() {
  const [filter, setFilter] = useState('all');

  const filteredOrders = orders.filter(o =>
    filter === 'all' || o.status === filter
  );

  const activeOrders = orders.filter(o => o.status === 'in_progress').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>주문 현황</h1>
        <p className={styles.subtitle}>진행 중인 주문을 확인하세요</p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{activeOrders}</span>
          <span className={styles.statLabel}>진행 중</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>{completedOrders}</span>
          <span className={styles.statLabel}>완료</span>
        </div>
      </div>

      <div className={styles.filters}>
        {[
          { value: 'all', label: '전체' },
          { value: 'in_progress', label: '진행 중' },
          { value: 'pending', label: '대기' },
          { value: 'completed', label: '완료' }
        ].map(f => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${filter === f.value ? styles.active : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.ordersList}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className={styles.empty}>
            <Package size={48} strokeWidth={1} />
            <p>주문이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
