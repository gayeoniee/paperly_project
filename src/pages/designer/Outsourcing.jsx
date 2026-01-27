import { useState } from 'react';
import { HeartHandshake, Clock, CheckCircle, Star, ArrowRight, Plus, Package, Truck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import styles from './Outsourcing.module.css';

// Mock 데이터 - 사용자가 의뢰한 내역
const myRequests = [
  {
    id: 'REQ-2024-05',
    type: '명함 인쇄',
    partner: '성원인쇄소',
    progress: 75,
    status: '인쇄 진행 중',
    expectedDate: '2024.01.30'
  },
  {
    id: 'REQ-2024-04',
    type: '포스터 제작',
    partner: '프린트하우스',
    progress: 100,
    status: '배송 완료',
    expectedDate: '2024.01.25'
  },
  {
    id: 'REQ-2024-03',
    type: '브로슈어',
    partner: '아트프레스',
    progress: 30,
    status: '디자인 검토',
    expectedDate: '2024.02.05'
  },
];

// 추천 파트너
const recommendedPartners = [
  { name: '성원인쇄소', category: '명함/청첩장', rating: 4.9, reviews: 128 },
  { name: '프린트하우스', category: '대형인쇄', rating: 4.8, reviews: 95 },
  { name: '아트프레스', category: '아트북/화집', rating: 4.9, reviews: 67 },
  { name: '에코프린팅', category: '친환경인쇄', rating: 4.7, reviews: 82 },
];

export default function Outsourcing() {
  const activeRequests = myRequests.filter(r => r.progress < 100);
  const completedRequests = myRequests.filter(r => r.progress === 100);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>나의 의뢰</h1>
          <p className={styles.subtitle}>인쇄 의뢰 현황을 확인하고 새로운 의뢰를 등록하세요</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <Package size={24} className={styles.statIcon} />
          <div>
            <span className={styles.statNumber}>{activeRequests.length}</span>
            <span className={styles.statLabel}>진행 중</span>
          </div>
        </div>
        <div className={styles.statBox}>
          <CheckCircle size={24} className={styles.statIcon} />
          <div>
            <span className={styles.statNumber}>{completedRequests.length}</span>
            <span className={styles.statLabel}>완료</span>
          </div>
        </div>
      </div>

      {/* New Request Button */}
      <Button variant="primary" fullWidth icon={Plus} size="large">
        새 인쇄 의뢰하기
      </Button>

      {/* 진행 중인 의뢰 */}
      {activeRequests.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Clock size={18} />
            진행 중인 의뢰
          </h2>
          <div className={styles.requestList}>
            {activeRequests.map((item) => (
              <Card key={item.id} className={styles.requestCard}>
                <div className={styles.requestTop}>
                  <span className={styles.requestId}>{item.id}</span>
                  <span className={styles.statusBadge}>{item.status}</span>
                </div>
                <h3 className={styles.requestTitle}>{item.type}</h3>
                <p className={styles.requestPartner}>{item.partner}</p>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <div className={styles.requestFooter}>
                  <span className={styles.progressPercent}>{item.progress}%</span>
                  <span className={styles.expectedDate}>예상 완료: {item.expectedDate}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 완료된 의뢰 */}
      {completedRequests.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <CheckCircle size={18} />
            완료된 의뢰
          </h2>
          <div className={styles.requestList}>
            {completedRequests.map((item) => (
              <Card key={item.id} className={styles.completedCard}>
                <div className={styles.completedInfo}>
                  <div>
                    <h3 className={styles.completedTitle}>{item.type}</h3>
                    <p className={styles.completedPartner}>{item.partner}</p>
                  </div>
                  <Truck size={20} className={styles.completedIcon} />
                </div>
                <button className={styles.reorderBtn}>
                  재주문하기 <ArrowRight size={14} />
                </button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 추천 파트너 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <HeartHandshake size={18} />
          추천 인쇄 파트너
        </h2>
        <p className={styles.sectionDesc}>검증된 장인들과 함께하세요</p>
        <div className={styles.partnerList}>
          {recommendedPartners.map((partner, i) => (
            <Card key={i} className={styles.partnerCard}>
              <div className={styles.partnerInfo}>
                <h3 className={styles.partnerName}>{partner.name}</h3>
                <span className={styles.partnerCategory}>{partner.category}</span>
              </div>
              <div className={styles.partnerMeta}>
                <span className={styles.partnerRating}>
                  <Star size={12} fill="currentColor" />
                  {partner.rating}
                </span>
                <span className={styles.partnerReviews}>리뷰 {partner.reviews}개</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 안내 */}
      <Card className={styles.guideCard}>
        <h3 className={styles.guideTitle}>의뢰는 이렇게 진행돼요</h3>
        <div className={styles.guideSteps}>
          <div className={styles.guideStep}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepText}>원하는 인쇄물 정보 입력</span>
          </div>
          <div className={styles.guideStep}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepText}>파트너 매칭 및 견적 수령</span>
          </div>
          <div className={styles.guideStep}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepText}>결제 후 제작 진행</span>
          </div>
          <div className={styles.guideStep}>
            <span className={styles.stepNumber}>4</span>
            <span className={styles.stepText}>완성품 배송</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
