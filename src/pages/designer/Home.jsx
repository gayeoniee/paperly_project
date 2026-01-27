import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Layers, Palette, X,
  ChevronLeft, ChevronRight, Star, MapPin, User
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { orders } from '../../data/mockData';
import { fetchPapers } from '../../lib/supabase';
import styles from './Home.module.css';

// 포트폴리오 데이터
const portfolios = [
  {
    id: 1,
    shopName: '성원인쇄소',
    specialty: '고급 명함 · 청첩장 전문',
    location: '서울 성동구',
    rating: 4.9,
    experience: '30년',
    works: ['명함', '청첩장', '브로슈어'],
    workload: 'RELAXED'
  },
  {
    id: 2,
    shopName: '프린트하우스',
    specialty: '대형 인쇄물 · 포스터',
    location: '서울 마포구',
    rating: 4.8,
    experience: '15년',
    works: ['포스터', '현수막', '배너'],
    workload: 'BUSY'
  },
  {
    id: 3,
    shopName: '아트프레스',
    specialty: '아트북 · 화집 제작',
    location: '서울 종로구',
    rating: 4.9,
    experience: '25년',
    works: ['아트북', '화집', '도록'],
    workload: 'NORMAL'
  },
  {
    id: 4,
    shopName: '에코프린팅',
    specialty: '친환경 인쇄 전문',
    location: '경기 성남시',
    rating: 4.7,
    experience: '10년',
    works: ['리플렛', '카탈로그', '패키지'],
    workload: 'RELAXED'
  }
];

// workload 상태 UI
const getWorkloadUI = (status) => {
  switch (status) {
    case 'RELAXED':
      return { label: '여유', color: styles.relaxed };
    case 'NORMAL':
      return { label: '보통', color: styles.normal };
    case 'BUSY':
      return { label: '분주', color: styles.busy };
    default:
      return { label: '확인불가', color: styles.unknown };
  }
};

// variants에서 랜덤 이미지 가져오기
const getRandomVariantImage = (variants) => {
  if (!variants || variants.length === 0) return null;
  const variantsWithImg = variants.filter(v => v.paper_img);
  if (variantsWithImg.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * variantsWithImg.length);
  return variantsWithImg[randomIndex].paper_img;
};

function PaperCard({ paper, onClick }) {
  const randomImg = getRandomVariantImage(paper.variants);

  return (
    <Card variant="paper" padding="none" className={styles.paperCard} onClick={onClick}>
      <div className={styles.paperImage}>
        {randomImg ? (
          <img src={randomImg} alt={paper.paper_name} className={styles.paperImg} />
        ) : (
          <div className={styles.paperPlaceholder}>
            <Layers size={24} />
          </div>
        )}
        {paper.tags && (
          <span className={styles.paperCategory}>
            #{paper.tags.split(',')[0]?.trim()}
          </span>
        )}
      </div>
      <div className={styles.paperInfo}>
        <h3 className={styles.paperName}>{paper.paper_name}</h3>
        {paper.variants && paper.variants.length > 0 && (
          <div className={styles.paperKeywords}>
            <Palette size={12} />
            <span>{paper.variants.length}가지 옵션</span>
          </div>
        )}
      </div>
    </Card>
  );
}

function OrderPreview({ order }) {
  const statusColors = {
    pending: '#D4A76A',
    in_progress: '#7BA876',
    quote_sent: '#8B7355',
    completed: '#A8B5A0'
  };

  return (
    <div className={styles.orderItem}>
      <div className={styles.orderProgress}>
        <div
          className={styles.progressRing}
          style={{
            background: `conic-gradient(${statusColors[order.status]} ${order.progress * 3.6}deg, var(--color-background) 0deg)`
          }}
        >
          <span>{order.progress}%</span>
        </div>
      </div>
      <div className={styles.orderInfo}>
        <span className={styles.orderPaper}>{order.paperName}</span>
        <span className={styles.orderStatus}>{order.statusText}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const paperScrollRef = useRef(null);
  const portfolioScrollRef = useRef(null);
  const recentOrders = orders.filter(o => o.status !== 'completed').slice(0, 2);

  // Supabase에서 종이 데이터 가져오기
  useEffect(() => {
    async function loadPapers() {
      try {
        const data = await fetchPapers();
        setPapers(data);
      } catch (error) {
        console.error('Failed to fetch papers:', error);
      } finally {
        setLoadingPapers(false);
      }
    }
    loadPapers();
  }, []);

  // 종이 스크롤 함수
  const scrollPapers = (direction) => {
    if (paperScrollRef.current) {
      const scrollAmount = 200;
      paperScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 포트폴리오 스크롤 함수
  const scrollPortfolios = (direction) => {
    if (portfolioScrollRef.current) {
      const scrollAmount = 280;
      portfolioScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const openPaperDetail = (paper) => {
    setSelectedPaper(paper);
    setSelectedVariant(paper.variants?.[0] || null);
  };

  const closePaperDetail = () => {
    setSelectedPaper(null);
    setSelectedVariant(null);
  };

  return (
    <div className={styles.home}>
      {/* Welcome Section */}
      <div className={styles.welcome}>
        <h1 className={styles.welcomeText}>
          안녕하세요,<br />
          <span className={styles.highlight}>사용자</span>님
        </h1>
        <p className={styles.welcomeSub}>오늘은 어떤 종이를 찾으시나요?</p>
      </div>

      {/* AI Banner */}
      <Card
        variant="paper"
        padding="medium"
        onClick={() => navigate('/designer/ai-chat')}
        className={styles.aiBanner}
      >
        <div className={styles.aiIcon}>
          <Sparkles size={24} />
        </div>
        <div className={styles.aiContent}>
          <h3 className={styles.aiTitle}>AI 종이 추천</h3>
          <p className={styles.aiDesc}>"포근한 느낌의 종이"처럼 말해보세요</p>
        </div>
        <ArrowRight size={20} className={styles.aiArrow} />
      </Card>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>진행 중인 주문</h2>
            <button
              className={styles.viewMore}
              onClick={() => navigate('/designer/orders')}
            >
              더보기
            </button>
          </div>
          <div className={styles.ordersList}>
            {recentOrders.map(order => (
              <OrderPreview key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended Papers */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>추천 종이</h2>
        </div>
        <div className={styles.paperScrollWrapper}>
          <button
            className={`${styles.scrollBtn} ${styles.scrollLeft}`}
            onClick={() => scrollPapers('left')}
          >
            <ChevronLeft size={24} />
          </button>
          <div className={styles.papersScroll} ref={paperScrollRef}>
            {loadingPapers ? (
              <div className={styles.loadingPapers}>
                <div className={styles.loadingSpinner} />
                <span>종이 정보를 불러오는 중...</span>
              </div>
            ) : papers.length > 0 ? (
              papers.map(paper => (
                <PaperCard
                  key={paper.paper_name}
                  paper={paper}
                  onClick={() => openPaperDetail(paper)}
                />
              ))
            ) : (
              <div className={styles.noPapers}>
                <Layers size={24} />
                <span>등록된 종이가 없습니다</span>
              </div>
            )}
          </div>
          <button
            className={`${styles.scrollBtn} ${styles.scrollRight}`}
            onClick={() => scrollPapers('right')}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>사장님 포트폴리오</h2>
        </div>
        <div className={styles.portfolioScrollWrapper}>
          <button
            className={`${styles.scrollBtn} ${styles.scrollLeft}`}
            onClick={() => scrollPortfolios('left')}
          >
            <ChevronLeft size={24} />
          </button>
          <div className={styles.portfolioScroll} ref={portfolioScrollRef}>
            {portfolios.map((portfolio) => {
              const workload = getWorkloadUI(portfolio.workload);
              return (
                <div
                  key={portfolio.id}
                  className={styles.portfolioCard}
                  // onClick={() => openDetail(portfolio)}
                >
                  <div className={styles.portfolioAvatar}>
                    <User size={32} strokeWidth={1.5} />
                  </div>
                  <div className={styles.portfolioContent}>
                    <div className={styles.portfolioHeader}>
                      <h3 className={styles.shopName}>{portfolio.shopName}</h3>
                      <div className={styles.rating}>
                        <Star size={12} fill="currentColor" />
                        {portfolio.rating}
                      </div>
                    </div>
                    <p className={styles.specialty}>{portfolio.specialty}</p>
                    <div className={styles.portfolioMeta}>
                      <span className={styles.location}>
                        <MapPin size={12} />
                        {portfolio.location}
                      </span>
                      <span className={styles.experience}>{portfolio.experience} 경력</span>
                    </div>
                    <div className={styles.works}>
                      {portfolio.works.map((work) => (
                        <span key={work} className={styles.workTag}>{work}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`${styles.workloadIndicator} ${workload.color}`}>
                    <span className={styles.workloadDot}></span>
                    <span>{workload.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className={`${styles.scrollBtn} ${styles.scrollRight}`}
            onClick={() => scrollPortfolios('right')}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Paper Detail Modal */}
      {selectedPaper && (
        <div className={styles.modalOverlay} onClick={closePaperDetail}>
          <div className={styles.paperModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closePaperDetail}>
              <X size={24} />
            </button>

            <div className={styles.paperModalContent}>
              {/* 종이 이미지 */}
              <div className={styles.paperModalImage}>
                {selectedVariant?.paper_img ? (
                  <img src={selectedVariant.paper_img} alt={selectedVariant.paper_name} />
                ) : (
                  <div className={styles.paperModalPlaceholder}>
                    <Layers size={64} />
                  </div>
                )}
              </div>

              {/* 종이 정보 */}
              <div className={styles.paperModalInfo}>
                <h2 className={styles.paperModalTitle}>{selectedPaper.paper_name}</h2>

                {selectedPaper.tags && (
                  <div className={styles.paperModalTags}>
                    {selectedPaper.tags.split(',').map((tag, i) => (
                      <span key={i} className={styles.tag}>#{tag.trim()}</span>
                    ))}
                  </div>
                )}

                {/* 환경 인증 마크 */}
                {selectedPaper.env_img && (
                  <div className={styles.paperDetailSection}>
                    <h3>환경 인증</h3>
                    <div className={styles.envImageList}>
                      {selectedPaper.env_img.split(',').map((imgUrl, idx) => (
                        <div key={idx} className={styles.envImageWrapper}>
                          <img src={imgUrl.trim()} alt={`${selectedPaper.paper_name} 환경 인증 마크 ${idx + 1}`} />
                        </div>
                      ))}'
                    </div>
                  </div>
                )}

                {selectedPaper.description && (
                  <div className={styles.paperDetailSection}>
                    <h3>설명</h3>
                    <p>{selectedPaper.description}</p>
                  </div>
                )}

                {selectedPaper.feature && (
                  <div className={styles.paperDetailSection}>
                    <h3>특징</h3>
                    <p>{selectedPaper.feature}</p>
                  </div>
                )}

                {selectedPaper.pattern && (
                  <div className={styles.paperDetailSection}>
                    <h3>패턴</h3>
                    <p>{selectedPaper.pattern}</p>
                  </div>
                )}

                {/* Variants 선택 */}
                {selectedPaper.variants && selectedPaper.variants.length > 0 && (
                  <div className={styles.paperDetailSection}>
                    <h3>옵션 선택</h3>
                    <div className={styles.variantList}>
                      {selectedPaper.variants.map((variant) => (
                        <button
                          key={variant.paper_code}
                          className={`${styles.variantBtn} ${
                            selectedVariant?.paper_code === variant.paper_code ? styles.active : ''
                          }`}
                          onClick={() => setSelectedVariant(variant)}
                        >
                          {variant.paper_img && (
                            <img src={variant.paper_img} alt={variant.color} />
                          )}
                          <div className={styles.variantInfo}>
                            <span className={styles.variantColor}>{variant.color || '기본'}</span>
                            {variant.gsm && <span className={styles.variantGsm}>{variant.gsm}gsm</span>}
                          </div>
                        </button>
                      ))}'
                    </div>
                  </div>
                )}

                {/* 선택된 Variant 상세 정보 */}
                {selectedVariant && (
                  <div className={styles.selectedVariantInfo}>
                    <div className={styles.variantSpec}>
                      {selectedVariant.color && (
                        <div className={styles.specItem}>
                          <span className={styles.specLabel}>색상</span>
                          <span className={styles.specValue}>{selectedVariant.color}</span>
                        </div>
                      )}
                      {selectedVariant.gsm && (
                        <div className={styles.specItem}>
                          <span className={styles.specLabel}>평량</span>
                          <span className={styles.specValue}>{selectedVariant.gsm}gsm</span>
                        </div>
                      )}
                      {selectedVariant.standard && (
                        <div className={styles.specItem}>
                          <span className={styles.specLabel}>규격</span>
                          <span className={styles.specValue}>{selectedVariant.standard}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedPaper.etc && (
                  <div className={styles.paperDetailSection}>
                    <h3>기타 정보</h3>
                    <p>{selectedPaper.etc}</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={closePaperDetail}>
                닫기
              </Button>
              <Button variant="primary" onClick={() => navigate('/designer/ai-chat')}>
                이 종이로 견적 요청
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
