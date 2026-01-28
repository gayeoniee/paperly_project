import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Layers, Palette, X,
  ChevronLeft, ChevronRight, Star, MapPin, User,
  MessageCircle, Phone, Award, AlertTriangle, ZoomIn
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { orders } from '../../data/mockData';
import { fetchPapers } from '../../lib/supabase';
import styles from './Home.module.css';

// 포트폴리오 데이터
const portfolios = [
  {
    id: 'maker-1',
    shopName: '성원인쇄소',
    specialty: '고급 명함 · 청첩장 전문',
    location: '서울 성동구',
    phone: '02-1234-5678',
    rating: 4.9,
    reviews: 128,
    experience: '30년',
    works: ['명함', '청첩장', '브로슈어'],
    workload: 'RELAXED',
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
    shopName: '프린트하우스',
    specialty: '대형 인쇄물 · 포스터',
    location: '서울 마포구',
    phone: '02-2345-6789',
    rating: 4.8,
    reviews: 95,
    experience: '15년',
    works: ['포스터', '현수막', '배너'],
    workload: 'BUSY',
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
    shopName: '아트프레스',
    specialty: '아트북 · 화집 제작',
    location: '서울 종로구',
    phone: '02-3456-7890',
    rating: 4.9,
    reviews: 67,
    experience: '25년',
    works: ['아트북', '화집', '도록'],
    workload: 'NORMAL',
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
    shopName: '에코프린팅',
    specialty: '친환경 인쇄 전문',
    location: '경기 성남시',
    phone: '031-456-7890',
    rating: 4.7,
    reviews: 82,
    experience: '10년',
    works: ['리플렛', '카탈로그', '패키지'],
    workload: 'RELAXED',
    description: 'FSC 인증 종이와 친환경 잉크를 사용하는 지속가능한 인쇄 전문 업체입니다. 환경을 생각하는 브랜드와 함께합니다.',
    specialties: ['친환경인쇄', 'FSC인증', '콩기름잉크', '재생지', '무코팅'],
    portfolio: [
      { title: '친환경 패키지', description: '재생지를 활용한 친환경 패키지' },
      { title: '지속가능 브랜드북', description: 'ESG 보고서 및 브랜드북' },
      { title: '에코 굿즈', description: '친환경 소재 프로모션 인쇄물' }
    ]
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

// 텍스트를 리스트로 포맷팅하는 헬퍼 함수
const formatTextWithList = (text) => {
  if (!text) return null;

  // "•" 또는 "-"로 시작하는 항목들을 분리
  const items = text.split(/(?=•)|(?=-)/).map(item => item.trim()).filter(item => item);

  // 리스트 형식이 아닌 경우 그냥 텍스트로 반환
  if (items.length <= 1 && !text.includes('•') && !text.includes('-')) {
    return <p>{text}</p>;
  }

  return (
    <ul style={{ margin: 0, paddingLeft: '1.2rem', listStyle: 'none' }}>
      {items.map((item, idx) => {
        // 앞의 "•" 또는 "-" 제거
        const cleanItem = item.replace(/^[•\-]\s*/, '').trim();
        if (!cleanItem) return null;
        return (
          <li key={idx} style={{ marginBottom: '0.5rem', position: 'relative', paddingLeft: '1rem' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            {cleanItem}
          </li>
        );
      })}
    </ul>
  );
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
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showBusyWarning, setShowBusyWarning] = useState(false);
  const [pendingPortfolio, setPendingPortfolio] = useState(null);
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

  // 포트폴리오 모달 핸들러
  const openPortfolioDetail = (portfolio) => {
    setSelectedPortfolio(portfolio);
  };

  const closePortfolioDetail = () => {
    setSelectedPortfolio(null);
  };

  const handleContactClick = (portfolio) => {
    if (portfolio.workload === 'BUSY' || portfolio.workload === 'NORMAL') {
      setPendingPortfolio(portfolio);
      setShowBusyWarning(true);
    } else {
      navigateToChat(portfolio);
    }
  };

  const navigateToChat = (portfolio) => {
    setSelectedPortfolio(null);
    setShowBusyWarning(false);
    setPendingPortfolio(null);
    navigate('/designer/chat', {
      state: {
        newChat: {
          id: portfolio.id,
          name: portfolio.shopName
        }
      }
    });
  };

  const handleConfirmContact = () => {
    if (pendingPortfolio) {
      navigateToChat(pendingPortfolio);
    }
  };

  const handleCancelWarning = () => {
    setShowBusyWarning(false);
    setPendingPortfolio(null);
  };

  const getWorkloadLabel = (workload) => {
    switch (workload) {
      case 'RELAXED': return '여유';
      case 'NORMAL': return '보통';
      case 'BUSY': return '분주';
      default: return '확인불가';
    }
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
                  onClick={() => openPortfolioDetail(portfolio)}
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
              {/* 종이 이미지 - 클릭하여 확대 */}
              <div
                className={`${styles.paperModalImage} ${selectedVariant?.paper_img ? styles.zoomable : ''}`}
                onClick={() => selectedVariant?.paper_img && setZoomedImage(selectedVariant.paper_img)}
              >
                {selectedVariant?.paper_img ? (
                  <>
                    <img src={selectedVariant.paper_img} alt={selectedVariant.paper_name} />
                    <div className={styles.zoomHintBadge}>
                      <ZoomIn size={16} />
                      <span>클릭하여 확대</span>
                    </div>
                  </>
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

                {selectedPaper.display_description && (
                  <div className={styles.paperDetailSection}>
                    <h3>설명</h3>
                    <div dangerouslySetInnerHTML={{ __html: selectedPaper.display_description }} />
                  </div>
                )}

                {selectedPaper.display_feature && (
                  <div className={styles.paperDetailSection}>
                    <h3>특징</h3>
                    <div dangerouslySetInnerHTML={{ __html: selectedPaper.display_feature }} />
                  </div>
                )}

                {selectedPaper.pattern && (
                  <div className={styles.paperDetailSection}>
                    <h3>패턴</h3>
                    {formatTextWithList(selectedPaper.pattern)}
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
                            {variant.gsm && <span className={styles.variantGsm}>{variant.gsm}</span>}
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
                          <span className={styles.specValue}>{selectedVariant.gsm}</span>
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

                {selectedPaper.display_etc && (
                  <div className={styles.paperDetailSection}>
                    <h3>기타 정보</h3>
                    <div dangerouslySetInnerHTML={{ __html: selectedPaper.display_etc }} />
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

      {/* 포트폴리오 상세보기 모달 */}
      {selectedPortfolio && (
        <div className={styles.modalOverlay} onClick={closePortfolioDetail}>
          <div className={styles.portfolioModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closePortfolioDetail}>
              <X size={24} />
            </button>

            <div className={styles.portfolioModalHeader}>
              <div className={styles.portfolioModalAvatar}>
                <User size={32} strokeWidth={1.5} />
              </div>
              <div className={styles.portfolioModalHeaderInfo}>
                <h2 className={styles.portfolioModalTitle}>{selectedPortfolio.shopName}</h2>
                <span className={styles.portfolioModalCategory}>{selectedPortfolio.specialty}</span>
                <div className={`${styles.workloadBadge} ${styles[selectedPortfolio.workload.toLowerCase()]}`}>
                  <span className={styles.workloadDot}></span>
                  <span>{getWorkloadLabel(selectedPortfolio.workload)}</span>
                </div>
              </div>
            </div>

            <div className={styles.portfolioModalStats}>
              <div className={styles.portfolioModalStat}>
                <Star size={16} fill="currentColor" className={styles.starIconModal} />
                <span className={styles.portfolioModalStatValue}>{selectedPortfolio.rating}</span>
                <span className={styles.portfolioModalStatLabel}>평점</span>
              </div>
              <div className={styles.portfolioModalStat}>
                <span className={styles.portfolioModalStatValue}>{selectedPortfolio.reviews}</span>
                <span className={styles.portfolioModalStatLabel}>리뷰</span>
              </div>
              <div className={styles.portfolioModalStat}>
                <Award size={16} className={styles.awardIconModal} />
                <span className={styles.portfolioModalStatValue}>{selectedPortfolio.experience}</span>
                <span className={styles.portfolioModalStatLabel}>경력</span>
              </div>
            </div>

            <div className={styles.portfolioModalSection}>
              <p className={styles.portfolioModalDescription}>{selectedPortfolio.description}</p>
            </div>

            <div className={styles.portfolioModalSection}>
              <div className={styles.portfolioModalInfoRow}>
                <MapPin size={16} />
                <span>{selectedPortfolio.location}</span>
              </div>
              <div className={styles.portfolioModalInfoRow}>
                <Phone size={16} />
                <span>{selectedPortfolio.phone}</span>
              </div>
            </div>

            <div className={styles.portfolioModalSection}>
              <h3 className={styles.portfolioModalSectionTitle}>전문 분야</h3>
              <div className={styles.specialtyTags}>
                {selectedPortfolio.specialties.map((specialty, idx) => (
                  <span key={idx} className={styles.specialtyTag}>{specialty}</span>
                ))}
              </div>
            </div>

            <div className={styles.portfolioModalSection}>
              <h3 className={styles.portfolioModalSectionTitle}>포트폴리오</h3>
              <div className={styles.portfolioList}>
                {selectedPortfolio.portfolio.map((item, idx) => (
                  <div key={idx} className={styles.portfolioItem}>
                    <h4 className={styles.portfolioItemTitle}>{item.title}</h4>
                    <p className={styles.portfolioItemDesc}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              icon={MessageCircle}
              size="large"
              onClick={() => handleContactClick(selectedPortfolio)}
            >
              문의하기
            </Button>
          </div>
        </div>
      )}

      {/* 바쁨 경고 모달 */}
      {showBusyWarning && pendingPortfolio && (
        <div className={styles.modalOverlay} onClick={handleCancelWarning}>
          <div className={styles.warningModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.warningIcon}>
              <AlertTriangle size={48} />
            </div>
            <h3 className={styles.warningTitle}>잠깐!</h3>
            <p className={styles.warningText}>
              <strong>{pendingPortfolio.shopName}</strong>은(는) 현재 <strong>{getWorkloadLabel(pendingPortfolio.workload)}</strong> 상태입니다.
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

      {/* 이미지 확대 모달 */}
      {zoomedImage && (
        <div className={styles.zoomOverlay} onClick={() => setZoomedImage(null)}>
          <button className={styles.zoomCloseBtn} onClick={() => setZoomedImage(null)}>
            <X size={24} />
          </button>
          <div className={styles.zoomContainer}>
            <img src={zoomedImage} alt="확대 이미지" className={styles.zoomedImage} />
            <p className={styles.zoomHint}>클릭하여 닫기</p>
          </div>
        </div>
      )}
    </div>
  );
}
