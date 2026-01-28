import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, MapPin, ChevronRight, X,
  ArrowRight, Bell, Phone, Clock, Award,
  ChevronLeft, Layers, Palette, FileText, Sparkles, User,
  HeartHandshake, Users, Package, ZoomIn, HelpCircle, MessageCircle,
  ChevronDown, ChevronUp, Send
} from 'lucide-react';

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
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { fetchPapers } from '../lib/supabase';
import styles from './Home.module.css';

const portfolios = [
    {
      id: 1,
      shopName: '성원인쇄소',
      ownerName: '김성원',
      ownerInitial: '김',
      specialty: '고급 명함 · 청첩장 전문',
      location: '서울 성동구',
      phone: '02-1234-5678',
      rating: 4.9,
      reviewCount: 128,
      experience: '30년',
      works: ['명함', '청첩장', '브로슈어'],
      description: '30년 경력의 장인이 한 장 한 장 정성을 담아 인쇄합니다.',
      detailDescription: '1994년부터 시작한 성원인쇄소는 고급 명함과 청첩장 전문 인쇄소입니다. 최고급 종이와 정밀한 인쇄 기술로 고객님의 소중한 순간을 더욱 특별하게 만들어 드립니다. 특히 엠보싱, 박 가공, 형압 등 다양한 후가공 기술을 보유하고 있습니다.',
      workingHours: '평일 09:00 - 18:00',
      portfolio: ['프리미엄 명함 500종', '웨딩 청첩장 200종', '기업 브로슈어 150종'],
      workload: 'RELAXED'
    },
    {
      id: 2,
      shopName: '프린트하우스',
      ownerName: '이준호',
      ownerInitial: '이',
      specialty: '대형 인쇄물 · 포스터',
      location: '서울 마포구',
      phone: '02-2345-6789',
      rating: 4.8,
      reviewCount: 95,
      experience: '15년',
      works: ['포스터', '현수막', '배너'],
      description: '최신 장비로 선명하고 생생한 대형 인쇄물을 제작합니다.',
      detailDescription: '프린트하우스는 대형 인쇄 전문 업체로, 최신 UV 프린터와 라텍스 프린터를 보유하고 있습니다. 실내외 배너, 포스터, 현수막 등 다양한 대형 인쇄물을 빠르고 정확하게 제작해 드립니다.',
      workingHours: '평일 08:00 - 20:00, 토요일 09:00 - 15:00',
      portfolio: ['전시회 포스터 300종', '기업 현수막 500종', '매장 배너 200종'],
      workload: 'BUSY'
    },
    {
      id: 3,
      shopName: '아트프레스',
      ownerName: '박민수',
      ownerInitial: '박',
      specialty: '아트북 · 화집 제작',
      location: '서울 종로구',
      phone: '02-3456-7890',
      rating: 4.9,
      reviewCount: 67,
      experience: '25년',
      works: ['아트북', '화집', '도록'],
      description: '예술가의 작품을 최고의 품질로 담아내는 것이 저희의 사명입니다.',
      detailDescription: '아트프레스는 예술 인쇄 전문 업체입니다. 색 재현력이 뛰어난 고급 인쇄 장비와 미술 전문 색보정 기술로 작가님의 작품을 완벽하게 재현합니다. 국내 유명 미술관, 갤러리와 협업한 풍부한 경험을 보유하고 있습니다.',
      workingHours: '평일 10:00 - 19:00',
      portfolio: ['미술관 도록 100종', '작가 화집 80종', '전시 아트북 50종'],
      workload: 'NORMAL'
    },
    {
      id: 4,
      shopName: '에코프린팅',
      ownerName: '최지영',
      ownerInitial: '최',
      specialty: '친환경 인쇄 전문',
      location: '경기 성남시',
      phone: '031-456-7890',
      rating: 4.7,
      reviewCount: 82,
      experience: '10년',
      works: ['리플렛', '카탈로그', '패키지'],
      description: '콩기름 잉크와 재생용지로 환경을 생각하는 인쇄를 합니다.',
      detailDescription: '에코프린팅은 친환경 인쇄를 선도하는 업체입니다. FSC 인증 용지, 콩기름 잉크, 무알콜 인쇄 등 환경을 생각하는 인쇄 방식을 채택하고 있습니다. 친환경이지만 품질에는 타협하지 않습니다.',
      workingHours: '평일 09:00 - 18:00',
      portfolio: ['친환경 패키지 200종', '기업 카탈로그 150종', '홍보 리플렛 300종'],
      workload: 'RELAXED'
    }
  ];

const paperTypes = [
  { name: '몽블랑', desc: '부드러운', bg: '#FAF7F2' },
  { name: '크라프트', desc: '자연스러운', bg: '#E8DED3' },
  { name: '랑데부', desc: '우아한', bg: '#F5F0E8' },
  { name: '에코', desc: '친환경', bg: '#E8EDE5' }
];

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


// 배너 이미지 데이터
const bannerImages = [
  { src: '/banners/banner1.png', alt: 'PAPERLY 사용자 후기 - ARIEL 사장님, ZACH 과장님' },
  { src: '/banners/banner2.png', alt: 'PAPERLY 서비스 소개 - 종이와 관련된 다양한 서비스' },
  { src: '/banners/banner3.png', alt: 'PAPERLY - 종이와 가치를 연결합니다' },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showCustomerService, setShowCustomerService] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const paperScrollRef = useRef(null);
  const portfolioScrollRef = useRef(null);

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

  // 배너 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % bannerImages.length);
    }, 5000); // 5초마다 변경

    return () => clearInterval(timer);
  }, []);

  // 종이 스크롤 함수
  const scrollPapers = (direction) => {
    if (paperScrollRef.current) {
      const scrollAmount = 300;
      paperScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 포트폴리오 스크롤 함수
  const scrollPortfolios = (direction) => {
    if (portfolioScrollRef.current) {
      const scrollAmount = 400;
      portfolioScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const openDetail = (portfolio) => {
    setSelectedPortfolio(portfolio);
  };

  const closeDetail = () => {
    setSelectedPortfolio(null);
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
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.logo}>Paperly</h1>
        <div className={styles.headerActions}>
          <button className={styles.headerBtn}>
            <Bell size={22} />
          </button>
          <Button
            variant="primary"
            size="small"
            onClick={() => navigate('/login')}
          >
            로그인
          </Button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className={styles.heroBanner}>
        <div className={styles.bannerSlider}>
          {bannerImages.map((banner, idx) => (
            <div
              key={idx}
              className={`${styles.bannerSlide} ${currentBanner === idx ? styles.active : ''}`}
            >
              <img
                src={banner.src}
                alt={banner.alt}
                className={styles.bannerImage}
              />
            </div>
          ))}
        </div>

        {/* Banner Indicators */}
        <div className={styles.bannerIndicators}>
          {bannerImages.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.bannerDot} ${currentBanner === idx ? styles.active : ''}`}
              onClick={() => setCurrentBanner(idx)}
              aria-label={`배너 ${idx + 1}`}
            />
          ))}
        </div>

        {/* Banner Navigation */}
        <button
          className={`${styles.bannerNav} ${styles.bannerPrev}`}
          onClick={() => setCurrentBanner(prev => prev === 0 ? bannerImages.length - 1 : prev - 1)}
          aria-label="이전 배너"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className={`${styles.bannerNav} ${styles.bannerNext}`}
          onClick={() => setCurrentBanner(prev => prev === bannerImages.length - 1 ? 0 : prev + 1)}
          aria-label="다음 배너"
        >
          <ChevronRight size={24} />
        </button>
      </section>

      {/* Paper Section */}
      <section className={styles.paperSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Sparkles size={24} className={styles.sectionIcon} />
            다양한 종이를 만나보세요
          </h2>
          <p className={styles.sectionDesc}>
            각각의 종이가 가진 고유한 질감과 색상을 탐색해보세요
          </p>
        </div>

        <div className={styles.paperScrollWrapper}>
          <button
            className={`${styles.scrollBtn} ${styles.scrollLeft}`}
            onClick={() => scrollPapers('left')}
          >
            <ChevronLeft size={24} />
          </button>

          <div className={styles.paperScroll} ref={paperScrollRef}>
            {loadingPapers ? (
              <div className={styles.loadingPapers}>
                <div className={styles.loadingSpinner} />
                <span>종이 정보를 불러오는 중...</span>
              </div>
            ) : papers.length > 0 ? (
              papers.map((paper) => (
                <div
                  key={paper.paper_name}
                  className={styles.paperItem}
                  onClick={() => openPaperDetail(paper)}
                >
                  <div className={styles.paperImageWrapper}>
                    {(() => {
                      const randomImg = getRandomVariantImage(paper.variants);
                      if (randomImg) {
                        return (
                          <img
                            src={randomImg}
                            alt={paper.paper_name}
                            className={styles.paperImg}
                          />
                        );
                      } else if (paper.env_img) {
                        return (
                          <img
                            src={paper.env_img}
                            alt={paper.paper_name}
                            className={styles.paperImg}
                          />
                        );
                      } else {
                        return (
                          <div className={styles.paperPlaceholder}>
                            <Layers size={32} />
                          </div>
                        );
                      }
                    })()}
                    {paper.tags && (
                      <div className={styles.paperTags}>
                        {paper.tags.split(',').slice(0, 2).map((tag, i) => (
                          <span key={i} className={styles.tag}>#{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.paperInfo}>
                    <h3 className={styles.paperTitle}>{paper.paper_name}</h3>
                    {paper.feature && (
                      <p className={styles.paperFeature}>{paper.feature}</p>
                    )}
                    {paper.variants && paper.variants.length > 0 && (
                      <div className={styles.variantPreview}>
                        <Palette size={14} />
                        <span>{paper.variants.length}가지 옵션</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noPapers}>
                <FileText size={32} />
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
      <section className={styles.portfolioSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>장인들의 포트폴리오</h2>
          <p className={styles.sectionDesc}>
            수십 년 경력의 인쇄 장인들이 당신의 작품을 기다립니다
          </p>
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
                onClick={() => openDetail(portfolio)}
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
            )})}
          </div>

          <button
            className={`${styles.scrollBtn} ${styles.scrollRight}`}
            onClick={() => scrollPortfolios('right')}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Connection Section */}
      <section className={styles.connectionSection}>
        <div className={styles.connectionContent}>
          <h2 className={styles.connectionTitle}>
            <span>종이</span>라는 매개체로<br />
            우리는 연결됩니다
          </h2>
          <p className={styles.connectionDesc}>
            명함 한 장에 담긴 첫인상,<br />
            청첩장에 담긴 사랑의 약속,<br />
            포스터에 담긴 예술가의 영혼.<br /><br />
            Paperly에서 당신의 이야기를 종이 위에 담아보세요.
          </p>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>150+</span>
              <span className={styles.statLabel}>인쇄소 장인</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>3,200+</span>
              <span className={styles.statLabel}>완성된 작품</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>98%</span>
              <span className={styles.statLabel}>만족도</span>
            </div>
          </div>
        </div>
      </section>

      {/* Outsourcing Guide Section */}
      <section className={styles.outsourcingSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <HeartHandshake size={24} className={styles.sectionIcon} />
            의뢰 및 협업
          </h2>
          <p className={styles.sectionDesc}>
            기획, 인쇄, 후가공까지 - 전문 파트너와 연결됩니다
          </p>
        </div>

        <div className={styles.outsourcingGrid}>
          <Card className={styles.outsourcingCard}>
            <div className={styles.outsourcingIcon}>
              <Users size={28} />
            </div>
            <h3>사용자라면</h3>
            <p>원하는 인쇄물 정보를 입력하면 검증된 장인들에게 견적을 받을 수 있어요. 진행 현황도 실시간으로 확인하세요.</p>
            <ul className={styles.outsourcingList}>
              <li>쉬운 의뢰 등록</li>
              <li>실시간 진행 현황</li>
              <li>파트너 평점 확인</li>
            </ul>
          </Card>

          <Card className={styles.outsourcingCard}>
            <div className={styles.outsourcingIcon}>
              <Package size={28} />
            </div>
            <h3>사장님이라면</h3>
            <p>후가공, 제본, 특수 인쇄 등 협력 파트너를 찾고 의뢰를 관리하세요. 파트너 마켓플레이스에서 새로운 기회를 만나보세요.</p>
            <ul className={styles.outsourcingList}>
              <li>파트너 마켓플레이스</li>
              <li>의뢰 관리 대시보드</li>
              <li>협업 통계 분석</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>지금 시작하세요</h2>
        <p>로그인하고 당신만의 종이를 찾아보세요</p>
        <Button
          variant="primary"
          size="large"
          icon={ArrowRight}
          onClick={() => navigate('/login')}
        >
          무료로 시작하기
        </Button>
        <br></br>
        <button
          className={styles.customerServiceBtn}
          onClick={() => setShowCustomerService(true)}
        >
          <HelpCircle size={18} />
          고객센터
        </button>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Paperly. 장인의 기술과 디자이너의 감성을 잇다.</p>
      </footer>

      {/* Portfolio Detail Modal */}
      {selectedPortfolio && (
        <div className={styles.modalOverlay} onClick={closeDetail}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeDetail}>
              <X size={24} />
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>
                <User size={40} strokeWidth={1.5} />
              </div>
              <div className={styles.modalInfo}>
                <h2 className={styles.modalTitle}>{selectedPortfolio.shopName}</h2>
                <p className={styles.modalSpecialty}>{selectedPortfolio.specialty}</p>
                <div className={styles.modalRating}>
                  <Star size={16} fill="#F5A623" color="#F5A623" />
                  <span>{selectedPortfolio.rating}</span>
                  <span className={styles.reviewCount}>({selectedPortfolio.reviewCount}개 리뷰)</span>
                </div>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <MapPin size={18} />
                  <span>{selectedPortfolio.location}</span>
                </div>
                <div className={styles.infoItem}>
                  <Phone size={18} />
                  <span>{selectedPortfolio.phone}</span>
                </div>
                <div className={styles.infoItem}>
                  <Clock size={18} />
                  <span>{selectedPortfolio.workingHours}</span>
                </div>
                <div className={styles.infoItem}>
                  <Award size={18} />
                  <span>경력 {selectedPortfolio.experience}</span>
                </div>
              </div>

              <div className={styles.section}>
                <h3>소개</h3>
                <p>{selectedPortfolio.detailDescription}</p>
              </div>

              <div className={styles.section}>
                <h3>주요 작업</h3>
                <div className={styles.worksList}>
                  {selectedPortfolio.works.map((work) => (
                    <span key={work} className={styles.workTag}>{work}</span>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3>포트폴리오</h3>
                <ul className={styles.portfolioList}>
                  {selectedPortfolio.portfolio.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={closeDetail}>
                닫기
              </Button>
              <Button variant="primary" onClick={() => navigate('/login')}>
                문의하기
              </Button>
            </div>
          </div>
        </div>
      )}

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
                className={`${styles.paperModalImage} ${(selectedVariant?.paper_img || selectedPaper.env_img) ? styles.zoomable : ''}`}
                onClick={() => {
                  const imgUrl = selectedVariant?.paper_img || selectedPaper.env_img;
                  if (imgUrl) setZoomedImage(imgUrl);
                }}
              >
                {selectedVariant?.paper_img ? (
                  <>
                    <img src={selectedVariant.paper_img} alt={selectedVariant.paper_name} />
                    <div className={styles.zoomHintBadge}>
                      <ZoomIn size={16} />
                      <span>클릭하여 확대</span>
                    </div>
                  </>
                ) : selectedPaper.env_img ? (
                  <>
                    <img src={selectedPaper.env_img} alt={selectedPaper.paper_name} />
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
                      ))}
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
                      ))}
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
              <Button variant="primary" onClick={() => navigate('/login')}>
                이 종이로 견적 요청
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

      {/* 고객센터 모달 */}
      {showCustomerService && (
        <div className={styles.modalOverlay} onClick={() => setShowCustomerService(false)}>
          <div className={styles.customerServiceModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowCustomerService(false)}>
              <X size={24} />
            </button>

            <div className={styles.customerServiceHeader}>
              <HelpCircle size={32} />
              <h2>고객센터</h2>
              <p>무엇을 도와드릴까요?</p>
            </div>

            <div className={styles.customerServiceBody}>
              {/* FAQ 섹션 */}
              <div className={styles.faqSection}>
                <h3>자주 묻는 질문</h3>

                {/* 사용자 FAQ */}
                <div className={styles.faqCategory}>
                  <h4>사용자</h4>
                  {[
                    { q: '종이 추천은 어떻게 받나요?', a: 'AI 채팅을 통해 원하는 느낌이나 용도를 말씀해주시면 맞춤 종이를 추천해드립니다. 홈 화면의 "AI 종이 추천" 배너를 클릭해보세요!' },
                    { q: '견적 요청은 어떻게 하나요?', a: '원하는 종이를 선택한 후 "견적 요청" 버튼을 클릭하고, 품명/수량/사이즈 등을 입력하시면 인쇄소 사장님들께 견적이 전달됩니다.' },
                    { q: '결제는 어떻게 이루어지나요?', a: 'Paperly는 매칭 플랫폼으로, 결제는 선택하신 인쇄소와 직접 진행하시면 됩니다. 견적 확정 후 인쇄소에서 안내드립니다.' },
                  ].map((faq, idx) => (
                    <div key={`user-${idx}`} className={styles.faqItem}>
                      <button
                        className={`${styles.faqQuestion} ${expandedFaq === `user-${idx}` ? styles.expanded : ''}`}
                        onClick={() => setExpandedFaq(expandedFaq === `user-${idx}` ? null : `user-${idx}`)}
                      >
                        <span>{faq.q}</span>
                        {expandedFaq === `user-${idx}` ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {expandedFaq === `user-${idx}` && (
                        <div className={styles.faqAnswer}>{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 사장님 FAQ */}
                <div className={styles.faqCategory}>
                  <h4>인쇄소 사장님</h4>
                  {[
                    { q: '파트너 등록은 어떻게 하나요?', a: '사장님 로그인 후 "파트너 등록" 메뉴에서 인쇄소 정보와 전문 분야를 입력하시면 검토 후 승인됩니다. 보통 1-2 영업일 소요됩니다.' },
                    { q: '견적 요청은 어떻게 받나요?', a: '등록하신 전문 분야와 매칭되는 견적 요청이 들어오면 알림을 통해 안내드립니다. 대시보드에서 요청 내역을 확인하고 견적을 보내실 수 있습니다.' },
                    { q: '수수료 정책이 어떻게 되나요?', a: '현재 베타 기간 중으로 매칭 수수료는 무료입니다. 정식 오픈 후에도 합리적인 수수료 정책을 운영할 예정입니다.' },
                  ].map((faq, idx) => (
                    <div key={`maker-${idx}`} className={styles.faqItem}>
                      <button
                        className={`${styles.faqQuestion} ${expandedFaq === `maker-${idx}` ? styles.expanded : ''}`}
                        onClick={() => setExpandedFaq(expandedFaq === `maker-${idx}` ? null : `maker-${idx}`)}
                      >
                        <span>{faq.q}</span>
                        {expandedFaq === `maker-${idx}` ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {expandedFaq === `maker-${idx}` && (
                        <div className={styles.faqAnswer}>{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 1:1 문의 버튼 */}
              <button
                className={styles.inquiryBtn}
                onClick={() => setShowInquiryModal(true)}
              >
                <MessageCircle size={20} />
                1:1 문의하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1:1 문의 모달 */}
      {showInquiryModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInquiryModal(false)}>
          <div className={styles.inquiryModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowInquiryModal(false)}>
              <X size={24} />
            </button>

            <div className={styles.inquiryHeader}>
              <MessageCircle size={28} />
              <h2>1:1 문의하기</h2>
            </div>

            <div className={styles.inquiryBody}>
              <div className={styles.inputGroup}>
                <label>제목</label>
                <input
                  type="text"
                  placeholder="문의 제목을 입력해주세요"
                  value={inquiryTitle}
                  onChange={(e) => setInquiryTitle(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>내용</label>
                <textarea
                  placeholder="문의 내용을 자세히 작성해주세요"
                  rows={6}
                  value={inquiryContent}
                  onChange={(e) => setInquiryContent(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inquiryFooter}>
              <Button variant="secondary" onClick={() => setShowInquiryModal(false)}>
                취소
              </Button>
              <Button
                variant="primary"
                icon={Send}
                onClick={() => {
                  alert('문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.');
                  setInquiryTitle('');
                  setInquiryContent('');
                  setShowInquiryModal(false);
                }}
                disabled={!inquiryTitle.trim() || !inquiryContent.trim()}
              >
                보내기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
