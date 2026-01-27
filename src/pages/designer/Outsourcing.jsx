import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, Clock, CheckCircle, Star, ArrowRight, Plus, Package, Truck, X, MessageCircle, MapPin, Phone, Award, AlertTriangle } from 'lucide-react';
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

// 추천 파트너 (포트폴리오 및 workload 정보 추가)
const recommendedPartners = [
  {
    id: 'maker-1',
    name: '성원인쇄소',
    category: '명함/청첩장',
    rating: 4.9,
    reviews: 128,
    workload: '여유',
    location: '서울 성동구',
    phone: '02-1234-5678',
    experience: '15년',
    description: '프리미엄 명함과 청첩장 전문 인쇄소입니다. 섬세한 후가공과 빠른 납기로 많은 디자이너분들께 사랑받고 있습니다.',
    specialties: ['명함', '청첩장', '고급 후가공', '형압', 'UV인쇄'],
    portfolio: [
      { title: '모던 명함 시리즈', description: '심플하고 세련된 명함 디자인' },
      { title: '프리미엄 청첩장', description: '레터프레스와 금박을 활용한 고급 청첩장' },
      { title: '브랜드 아이덴티티', description: '일관된 브랜드 이미지를 위한 인쇄물 세트' }
    ]
  },
  {
    id: 'maker-2',
    name: '프린트하우스',
    category: '대형인쇄',
    rating: 4.8,
    reviews: 95,
    workload: '분주',
    location: '서울 마포구',
    phone: '02-2345-6789',
    experience: '12년',
    description: '대형 배너, 현수막, 포스터 전문 업체입니다. 최신 장비와 숙련된 기술력으로 완벽한 결과물을 제공합니다.',
    specialties: ['대형배너', '현수막', '포스터', '실사출력', '래핑'],
    portfolio: [
      { title: '전시회 배너', description: '각종 전시회 및 행사용 대형 배너' },
      { title: '매장 사이니지', description: '브랜드 매장 내외부 사인물' },
      { title: '이벤트 현수막', description: '행사 및 프로모션용 현수막' }
    ]
  },
  {
    id: 'maker-3',
    name: '아트프레스',
    category: '아트북/화집',
    rating: 4.9,
    reviews: 67,
    workload: '보통',
    location: '서울 종로구',
    phone: '02-3456-7890',
    experience: '20년',
    description: '예술 서적과 화집 제작 전문입니다. 색재현에 특히 강점이 있으며, 작가님들의 작품을 최상의 품질로 인쇄합니다.',
    specialties: ['아트북', '화집', '도록', '사진집', '고급제본'],
    portfolio: [
      { title: '작가 화집', description: '유명 작가의 작품집 인쇄' },
      { title: '전시 도록', description: '미술관 및 갤러리 전시 도록' },
      { title: '사진집', description: '고품질 색재현 사진집' }
    ]
  },
  {
    id: 'maker-4',
    name: '에코프린팅',
    category: '친환경인쇄',
    rating: 4.7,
    reviews: 82,
    workload: '여유',
    location: '경기 성남시',
    phone: '031-456-7890',
    experience: '8년',
    description: 'FSC 인증 종이와 친환경 잉크를 사용하는 지속가능한 인쇄 전문 업체입니다. 환경을 생각하는 브랜드와 함께합니다.',
    specialties: ['친환경인쇄', 'FSC인증', '콩기름잉크', '재생지', '무코팅'],
    portfolio: [
      { title: '친환경 패키지', description: '재생지를 활용한 친환경 패키지' },
      { title: '지속가능 브랜드북', description: 'ESG 보고서 및 브랜드북' },
      { title: '에코 굿즈', description: '친환경 소재 프로모션 인쇄물' }
    ]
  },
];

export default function Outsourcing() {
  const navigate = useNavigate();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showBusyWarning, setShowBusyWarning] = useState(false);
  const [pendingPartner, setPendingPartner] = useState(null);

  const activeRequests = myRequests.filter(r => r.progress < 100);
  const completedRequests = myRequests.filter(r => r.progress === 100);

  const handlePartnerClick = (partner) => {
    setSelectedPartner(partner);
  };

  const handleCloseModal = () => {
    setSelectedPartner(null);
  };

  const handleContactClick = (partner) => {
    if (partner.workload === '분주' || partner.workload === '보통') {
      setPendingPartner(partner);
      setShowBusyWarning(true);
    } else {
      navigateToChat(partner);
    }
  };

  const navigateToChat = (partner) => {
    setSelectedPartner(null);
    setShowBusyWarning(false);
    setPendingPartner(null);
    navigate('/designer/chat', { state: { newChat: partner } });
  };

  const handleConfirmContact = () => {
    if (pendingPartner) {
      navigateToChat(pendingPartner);
    }
  };

  const handleCancelWarning = () => {
    setShowBusyWarning(false);
    setPendingPartner(null);
  };

  const getWorkloadColor = (workload) => {
    switch (workload) {
      case '여유': return 'workloadFree';
      case '보통': return 'workloadNormal';
      case '분주': return 'workloadBusy';
      default: return 'workloadNormal';
    }
  };

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
          {recommendedPartners.map((partner) => (
            <Card key={partner.id} className={styles.partnerCard} onClick={() => handlePartnerClick(partner)}>
              <div className={styles.partnerInfo}>
                <h3 className={styles.partnerName}>{partner.name}</h3>
                <span className={styles.partnerCategory}>{partner.category}</span>
              </div>
              <div className={styles.partnerMeta}>
                <span className={`${styles.workloadBadge} ${styles[getWorkloadColor(partner.workload)]}`}>
                  {partner.workload}
                </span>
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

      {/* 파트너 상세보기 모달 */}
      {selectedPartner && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={handleCloseModal}>
              <X size={24} />
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>
                {selectedPartner.name.charAt(0)}
              </div>
              <div className={styles.modalHeaderInfo}>
                <h2 className={styles.modalTitle}>{selectedPartner.name}</h2>
                <span className={styles.modalCategory}>{selectedPartner.category}</span>
                <span className={`${styles.workloadBadge} ${styles[getWorkloadColor(selectedPartner.workload)]}`}>
                  {selectedPartner.workload}
                </span>
              </div>
            </div>

            <div className={styles.modalStats}>
              <div className={styles.modalStat}>
                <Star size={16} fill="currentColor" className={styles.starIcon} />
                <span className={styles.modalStatValue}>{selectedPartner.rating}</span>
                <span className={styles.modalStatLabel}>평점</span>
              </div>
              <div className={styles.modalStat}>
                <span className={styles.modalStatValue}>{selectedPartner.reviews}</span>
                <span className={styles.modalStatLabel}>리뷰</span>
              </div>
              <div className={styles.modalStat}>
                <Award size={16} className={styles.awardIcon} />
                <span className={styles.modalStatValue}>{selectedPartner.experience}</span>
                <span className={styles.modalStatLabel}>경력</span>
              </div>
            </div>

            <div className={styles.modalSection}>
              <p className={styles.modalDescription}>{selectedPartner.description}</p>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalInfoRow}>
                <MapPin size={16} />
                <span>{selectedPartner.location}</span>
              </div>
              <div className={styles.modalInfoRow}>
                <Phone size={16} />
                <span>{selectedPartner.phone}</span>
              </div>
            </div>

            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>전문 분야</h3>
              <div className={styles.specialtyTags}>
                {selectedPartner.specialties.map((specialty, idx) => (
                  <span key={idx} className={styles.specialtyTag}>{specialty}</span>
                ))}
              </div>
            </div>

            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>포트폴리오</h3>
              <div className={styles.portfolioList}>
                {selectedPartner.portfolio.map((item, idx) => (
                  <div key={idx} className={styles.portfolioItem}>
                    <h4 className={styles.portfolioTitle}>{item.title}</h4>
                    <p className={styles.portfolioDesc}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              icon={MessageCircle}
              size="large"
              onClick={() => handleContactClick(selectedPartner)}
            >
              문의하기
            </Button>
          </div>
        </div>
      )}

      {/* 바쁨 경고 모달 */}
      {showBusyWarning && pendingPartner && (
        <div className={styles.modalOverlay} onClick={handleCancelWarning}>
          <div className={styles.warningModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.warningIcon}>
              <AlertTriangle size={48} />
            </div>
            <h3 className={styles.warningTitle}>잠깐!</h3>
            <p className={styles.warningText}>
              <strong>{pendingPartner.name}</strong>은(는) 현재 <strong>{pendingPartner.workload}</strong> 상태입니다.
              <br />
              답변이 평소보다 오래 걸릴 수 있어요.
            </p>
            <div className={styles.warningButtons}>
              <Button variant="outline" onClick={handleCancelWarning}>
                다른 파트너 찾기
              </Button>
              <Button variant="primary" onClick={handleConfirmContact}>
                그래도 문의하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
