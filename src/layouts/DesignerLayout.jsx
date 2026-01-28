import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  FileText,
  MessageCircle,
  Package,
  HeartHandshake,
  LogOut,
  Bell,
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import Button from '../components/common/Button';
import styles from './DesignerLayout.module.css';

const navItems = [
  { to: '/designer/home', icon: Home, label: '홈' },
  { to: '/designer/ai-chat', icon: MessageSquare, label: 'AI 종이 추천' },
  { to: '/designer/quotes', icon: FileText, label: '견적 확인' },
  { to: '/designer/outsourcing', icon: HeartHandshake, label: '나의 의뢰' },
  { to: '/designer/chat', icon: MessageCircle, label: '채팅' },
  { to: '/designer/orders', icon: Package, label: '주문 현황' },
];

export default function DesignerLayout() {
  const navigate = useNavigate();
  const [showCustomerService, setShowCustomerService] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar (Desktop) */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>Paperly</h1>
          <p className={styles.logoSub}>사용자</p>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.sidebarItem} ${isActive ? styles.active : ''}`
              }
            >
              <item.icon size={20} strokeWidth={1.5} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.supportBtn} onClick={() => setShowCustomerService(true)}>
            <HelpCircle size={20} strokeWidth={1.5} />
            <span>고객센터</span>
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} strokeWidth={1.5} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className={styles.mainArea}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.headerLogo}>Paperly</h1>
          <div className={styles.headerActions}>
            <button className={styles.headerBtn}>
              <Bell size={22} strokeWidth={1.5} />
              <span className={styles.badge}>2</span>
            </button>
            <button className={styles.headerBtn} onClick={handleLogout}>
              <LogOut size={22} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <nav className={styles.bottomNav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={22} strokeWidth={1.5} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

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
              <div className={styles.faqSection}>
                <h3>자주 묻는 질문</h3>

                <div className={styles.faqCategory}>
                  <h4>사용자</h4>
                  {[
                    { q: '종이 추천은 어떻게 받나요?', a: 'AI 채팅을 통해 원하는 느낌이나 용도를 말씀해주시면 맞춤 종이를 추천해드립니다.' },
                    { q: '견적 요청은 어떻게 하나요?', a: '원하는 종이를 선택한 후 "견적 요청" 버튼을 클릭하고, 품명/수량/사이즈 등을 입력하시면 됩니다.' },
                    { q: '결제는 어떻게 이루어지나요?', a: 'Paperly는 매칭 플랫폼으로, 결제는 선택하신 인쇄소와 직접 진행하시면 됩니다.' },
                  ].map((faq, idx) => (
                    <div key={`user-${idx}`} className={styles.faqItem}>
                      <button
                        className={`${styles.faqQuestion} ${expandedFaq === `user-${idx}` ? styles.expanded : ''}`}
                        onClick={() => setExpandedFaq(expandedFaq === `user-${idx}` ? null : `user-${idx}`)}
                      >
                        <span>{faq.q}</span>
                        {expandedFaq === `user-${idx}` ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {expandedFaq === `user-${idx}` && <div className={styles.faqAnswer}>{faq.a}</div>}
                    </div>
                  ))}
                </div>

                <div className={styles.faqCategory}>
                  <h4>인쇄소 사장님</h4>
                  {[
                    { q: '파트너 등록은 어떻게 하나요?', a: '사장님 로그인 후 "파트너 등록" 메뉴에서 인쇄소 정보를 입력하시면 검토 후 승인됩니다.' },
                    { q: '견적 요청은 어떻게 받나요?', a: '등록하신 전문 분야와 매칭되는 견적 요청이 들어오면 알림으로 안내드립니다.' },
                    { q: '수수료 정책이 어떻게 되나요?', a: '현재 베타 기간 중으로 매칭 수수료는 무료입니다.' },
                  ].map((faq, idx) => (
                    <div key={`maker-${idx}`} className={styles.faqItem}>
                      <button
                        className={`${styles.faqQuestion} ${expandedFaq === `maker-${idx}` ? styles.expanded : ''}`}
                        onClick={() => setExpandedFaq(expandedFaq === `maker-${idx}` ? null : `maker-${idx}`)}
                      >
                        <span>{faq.q}</span>
                        {expandedFaq === `maker-${idx}` ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {expandedFaq === `maker-${idx}` && <div className={styles.faqAnswer}>{faq.a}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <button className={styles.inquiryBtn} onClick={() => setShowInquiryModal(true)}>
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
