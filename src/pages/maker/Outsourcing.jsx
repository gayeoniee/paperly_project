import { useState } from 'react';
import { HeartHandshake, Users, Clock, CheckCircle, Star, ArrowRight, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import styles from './Outsourcing.module.css';

// Mock 데이터
const activeRequests = [
  { id: 'OS-2024-11', type: '후가공(박)', partner: '대원박공사', progress: 45, status: '공정 진행 중' },
  { id: 'OS-2024-12', type: '기획/디자인', partner: '스튜디오 모노', progress: 10, status: '자료 검토' },
  { id: 'OS-2024-13', type: '지류 소싱', partner: '한솔지기', progress: 100, status: '입고 완료' },
];

const partners = [
  { name: '대현기획', category: '인쇄 기획', tags: ['북디자인', '편집'], rating: 4.9, workload: 'RELAXED' },
  { name: '정밀형압', category: '후가공', tags: ['형압', '박'], rating: 5.0, workload: 'BUSY' },
  { name: '서진제본', category: '제본', tags: ['양장', '무선'], rating: 4.8, workload: 'NORMAL' },
  { name: '삼화특수지', category: '용지공급', tags: ['특수지', '친환경'], rating: 4.7, workload: 'RELAXED' },
];

// workload 상태 UI
const getWorkloadUI = (status) => {
  switch (status) {
    case 'RELAXED':
      return { label: '여유', className: styles.workloadRelaxed };
    case 'NORMAL':
      return { label: '보통', className: styles.workloadNormal };
    case 'BUSY':
      return { label: '분주', className: styles.workloadBusy };
    default:
      return { label: '확인불가', className: styles.workloadUnknown };
  }
};

const pendingRequests = [
  { from: '을지로 디자인', item: '도록 인쇄', dday: 'D-3' },
  { from: '그린 팩토리', item: '에코백 제작', dday: 'D-12' },
];

const stats = {
  monthlyRequests: 12,
  matchRate: 92,
  newPartners: 3
};

export default function Outsourcing() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>의뢰 및 협업</h1>
          <p className={styles.subtitle}>기획, 인쇄, 후가공 등 전문 파트너와 연결됩니다</p>
        </div>
        <Button variant="primary" icon={Plus}>
          신규 의뢰 등록
        </Button>
      </div>

      <div className={styles.content}>
        {/* Main Content */}
        <div className={styles.mainArea}>
          {/* 진행 중인 의뢰 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>01</span>
              진행 중인 의뢰 내역
            </h2>
            <div className={styles.requestList}>
              {activeRequests.map((item) => (
                <Card key={item.id} className={styles.requestCard}>
                  <div className={styles.requestHeader}>
                    <div>
                      <span className={styles.requestId}>{item.id}</span>
                      <h3 className={styles.requestTitle}>
                        {item.type} <span className={styles.divider}>|</span> {item.partner}
                      </h3>
                    </div>
                    <span className={`${styles.statusBadge} ${item.progress === 100 ? styles.complete : ''}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className={styles.progressText}>{item.progress}% 완료</div>
                </Card>
              ))}
            </div>
          </section>

          {/* 파트너 마켓플레이스 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>02</span>
              파트너 마켓플레이스
            </h2>
            <div className={styles.partnerGrid}>
              {partners.map((partner, i) => {
                const workload = getWorkloadUI(partner.workload);
                return (
                  <Card key={i} className={styles.partnerCard}>
                    <div className={styles.partnerHeader}>
                      <span className={styles.partnerCategory}>{partner.category}</span>
                      <span className={styles.partnerRating}>
                        <Star size={12} fill="currentColor" />
                        {partner.rating}
                      </span>
                    </div>
                    <h3 className={styles.partnerName}>{partner.name}</h3>
                    <div className={styles.partnerTags}>
                      {partner.tags.map(tag => (
                        <span key={tag} className={styles.tag}>#{tag}</span>
                      ))}
                    </div>
                    <div className={styles.partnerFooter}>
                      <button className={styles.contactBtn}>
                        문의하기 <ArrowRight size={14} />
                      </button>
                      <div className={`${styles.workloadBadge} ${workload.className}`}>
                        <span className={styles.workloadDot}></span>
                        <span>{workload.label}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* 받은 의뢰 대기 */}
          <Card className={styles.pendingCard}>
            <h3 className={styles.pendingTitle}>
              <Clock size={20} />
              받은 의뢰 대기 목록
            </h3>
            <div className={styles.pendingList}>
              {pendingRequests.map((req, i) => (
                <div key={i} className={styles.pendingItem}>
                  <div className={styles.pendingHeader}>
                    <span className={styles.pendingFrom}>{req.from}</span>
                    <span className={styles.pendingDday}>{req.dday}</span>
                  </div>
                  <p className={styles.pendingDesc}>{req.item}</p>
                  <button className={styles.pendingBtn}>의뢰 확인하기</button>
                </div>
              ))}
            </div>
          </Card>

          {/* 협업 통계 */}
          <Card className={styles.statsCard}>
            <h3 className={styles.statsTitle}>
              <HeartHandshake size={20} />
              협업 통계
            </h3>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>이번 달 의뢰</span>
                <span className={styles.statValue}>{stats.monthlyRequests}건</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>매칭 성공률</span>
                <span className={styles.statValue}>{stats.matchRate}%</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>신규 파트너</span>
                <span className={styles.statValue}>{stats.newPartners}곳</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
