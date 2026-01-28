import { useState } from 'react';
import { Search, Filter, Eye, MoreVertical } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { orders } from '../../data/mockData';
import styles from './Orders.module.css';

const statusFilters = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'quote_sent', label: '견적발송' },
  { value: 'in_progress', label: '진행중' },
  { value: 'completed', label: '완료' }
];

const statusColors = {
  pending: { bg: '#FEF3E2', color: '#D4A76A' },
  quote_sent: { bg: '#F5F1EB', color: '#8B7355' },
  in_progress: { bg: '#E8F5E9', color: '#7BA876' },
  completed: { bg: '#E8F0E8', color: '#6B8E6B' }
};

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.designerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>주문 관리</h1>
          <p className={styles.subtitle}>모든 주문을 한눈에 확인하고 관리하세요</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="주문번호 또는 고객명 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.statusFilters}>
          {statusFilters.map(filter => (
            <button
              key={filter.value}
              className={`${styles.filterBtn} ${statusFilter === filter.value ? styles.active : ''}`}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <Card variant="paper" padding="none" className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>주문번호</th>
                <th>고객</th>
                <th>품목</th>
                <th>수량</th>
                <th>금액</th>
                <th>상태</th>
                <th>진행률</th>
                <th>납기일</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className={styles.orderNumber}>{order.orderNumber}</td>
                  <td>
                    <div className={styles.clientInfo}>
                      <span className={styles.clientName}>{order.designerName}</span>
                      <span className={styles.clientCompany}>{order.designerCompany}</span>
                    </div>
                  </td>
                  <td>{order.paperName}</td>
                  <td>{order.quantity.toLocaleString()}부</td>
                  <td>
                    {order.totalPrice > 0
                      ? `${order.totalPrice.toLocaleString()}원`
                      : '-'}
                  </td>
                  <td>
                    <span
                      className={styles.status}
                      style={{
                        background: statusColors[order.status]?.bg,
                        color: statusColors[order.status]?.color
                      }}
                    >
                      {order.statusText}
                    </span>
                  </td>
                  <td>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${order.progress}%` }}
                      />
                      <span className={styles.progressText}>{order.progress}%</span>
                    </div>
                  </td>
                  <td className={styles.dueDate}>
                    {order.dueDate || '-'}
                  </td>
                  <td>
                    <button className={styles.actionBtn}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredOrders.length === 0 && (
        <div className={styles.empty}>
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
