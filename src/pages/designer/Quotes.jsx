import { useState } from 'react';
import { FileText, Clock, Check, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { quotes } from '../../data/mockData';
import styles from './Quotes.module.css';

const statusIcons = {
  sent: Clock,
  accepted: Check,
  expired: AlertCircle
};

const statusLabels = {
  sent: '확인 대기',
  accepted: '승인됨',
  expired: '만료됨'
};

const statusColors = {
  sent: 'var(--color-warning)',
  accepted: 'var(--color-success)',
  expired: 'var(--color-error)'
};

function QuoteCard({ quote }) {
  const [expanded, setExpanded] = useState(false);
  const StatusIcon = statusIcons[quote.status];

  return (
    <Card variant="paper" padding="none" className={styles.quoteCard}>
      <div className={styles.quoteHeader} onClick={() => setExpanded(!expanded)}>
        <div className={styles.quoteIcon}>
          <FileText size={24} strokeWidth={1.5} />
        </div>
        <div className={styles.quoteInfo}>
          <h3 className={styles.quoteName}>{quote.supplier.companyName}</h3>
          <p className={styles.quoteDate}>{quote.date}</p>
        </div>
        <div className={styles.quoteStatus} style={{ color: statusColors[quote.status] }}>
          <StatusIcon size={16} />
          <span>{statusLabels[quote.status]}</span>
        </div>
      </div>

      <div className={styles.quoteSummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>품목</span>
          <span className={styles.summaryValue}>{quote.items[0].name}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>총 금액</span>
          <span className={styles.summaryValue}>{quote.total.toLocaleString()}원</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.quoteDetail}>
          <div className={styles.detailSection}>
            <h4 className={styles.detailTitle}>재질 및 규격</h4>
            {quote.items.map((item, idx) => (
              <div key={idx} className={styles.itemSpec}>
                <div className={styles.specRow}>
                  <span>품명</span>
                  <span>{item.name}</span>
                </div>
                <div className={styles.specRow}>
                  <span>재질</span>
                  <span>{item.material}</span>
                </div>
                <div className={styles.specRow}>
                  <span>규격</span>
                  <span>{item.size}</span>
                </div>
                <div className={styles.specRow}>
                  <span>수량</span>
                  <span>{item.quantity}{item.unit} × {item.varieties}종류</span>
                </div>
                <div className={styles.specRow}>
                  <span>인쇄(전면)</span>
                  <span>{item.frontPrint}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.detailSection}>
            <h4 className={styles.detailTitle}>비용 내역</h4>
            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>합계</span>
                <span>{quote.subtotal.toLocaleString()}원</span>
              </div>
              <div className={styles.priceRow}>
                <span>부가세</span>
                <span>{quote.tax.toLocaleString()}원</span>
              </div>
              <div className={`${styles.priceRow} ${styles.total}`}>
                <span>총 합계</span>
                <span>{quote.total.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          <div className={styles.quoteActions}>
            <Button variant="outline" size="medium">
              채팅하기
            </Button>
            <Button size="medium">
              승인하기
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function Quotes() {
  const [filter, setFilter] = useState('all');

  const filteredQuotes = quotes.filter(q =>
    filter === 'all' || q.status === filter
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>견적서</h1>
        <p className={styles.subtitle}>받은 견적을 확인하세요</p>
      </div>

      <div className={styles.filters}>
        {[
          { value: 'all', label: '전체' },
          { value: 'sent', label: '대기중' },
          { value: 'accepted', label: '승인됨' }
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

      <div className={styles.quotesList}>
        {filteredQuotes.length > 0 ? (
          filteredQuotes.map(quote => (
            <QuoteCard key={quote.id} quote={quote} />
          ))
        ) : (
          <div className={styles.empty}>
            <FileText size={48} strokeWidth={1} />
            <p>견적서가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
