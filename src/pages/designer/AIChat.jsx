import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ArrowLeft, Layers, Palette, X, ChevronLeft, ChevronRight, FileText, Building2, Star, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { askGemini } from '../../lib/gemini';
import { searchPapersByKeywords } from '../../lib/supabase';
import Button from '../../components/common/Button';
import styles from './AIChat.module.css';

// Mock 사장님 데이터 (나중에 Supabase에서 가져올 수 있음)
const mockMakers = [
  { id: 1, name: '대현기획', category: '인쇄 기획', rating: 4.9, tags: ['북디자인', '편집'], workload: 'RELAXED' },
  { id: 2, name: '정밀형압', category: '후가공', rating: 5.0, tags: ['형압', '박'], workload: 'BUSY' },
  { id: 3, name: '서진제본', category: '제본', rating: 4.8, tags: ['양장', '무선'], workload: 'NORMAL' },
  { id: 4, name: '삼화특수지', category: '용지공급', rating: 4.7, tags: ['특수지', '친환경'], workload: 'RELAXED' },
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

const suggestedKeywords = ['포근한 느낌', '고급스러운', '친환경', '빈티지', '명함용'];
const quoteKeywords = ['품명 알려주기', '사이즈 변경', '수량 변경', '추가 요청사항'];

// AI 메시지를 포맷팅하는 헬퍼 함수
const formatAIMessage = (text) => {
  if (!text) return null;

  // 줄바꿈으로 분리
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let listKey = 0;

  const processText = (str) => {
    // **bold** 처리
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} style={{ margin: '8px 0', paddingLeft: '0', listStyle: 'none' }}>
          {currentList.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '6px', paddingLeft: '1.2rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--color-primary)' }}>•</span>
              {processText(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // 빈 줄
    if (!trimmed) {
      flushList();
      return;
    }

    // 리스트 항목 (• 또는 - 로 시작)
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const content = trimmed.replace(/^[•\-]\s*/, '').trim();
      if (content) {
        currentList.push(content);
      }
    } else {
      // 일반 텍스트
      flushList();
      elements.push(
        <p key={`p-${idx}`} style={{ margin: '0 0 8px 0' }}>
          {processText(trimmed)}
        </p>
      );
    }
  });

  flushList();

  // 요소가 없으면 원본 텍스트 반환
  if (elements.length === 0) {
    return <span>{processText(text)}</span>;
  }

  return <div style={{ lineHeight: 1.6 }}>{elements}</div>;
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
  const items = text.split(/(?=•)|(?=-)/).map(item => item.trim()).filter(item => item);
  if (items.length <= 1 && !text.includes('•') && !text.includes('-')) {
    return <p>{text}</p>;
  }
  return (
    <ul style={{ margin: 0, paddingLeft: '1.2rem', listStyle: 'none' }}>
      {items.map((item, idx) => {
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

// 견적 미리보기 컴포넌트
function QuotePreview({ quoteData, onClose, onSendQuote }) {
  if (!quoteData) return null;

  return (
    <div className={styles.quotePreview}>
      <div className={styles.quotePreviewHeader}>
        <FileText size={18} />
        <span>견적 요청서 미리보기</span>
      </div>
      <div className={styles.quotePreviewContent}>
        {quoteData.paperName && (
          <div className={styles.quoteItem}>
            <span className={styles.quoteLabel}>선택 종이</span>
            <span className={styles.quoteValue}>{quoteData.paperName}</span>
          </div>
        )}
        <div className={styles.quoteItem}>
          <span className={styles.quoteLabel}>품명</span>
          <span className={styles.quoteValue}>{quoteData.itemName || '-'}</span>
        </div>
        <div className={styles.quoteItem}>
          <span className={styles.quoteLabel}>규격</span>
          <span className={styles.quoteValue}>{quoteData.size || '-'}</span>
        </div>
        <div className={styles.quoteItem}>
          <span className={styles.quoteLabel}>수량</span>
          <span className={styles.quoteValue}>{quoteData.quantity || '-'}</span>
        </div>
        {quoteData.printType && (
          <div className={styles.quoteItem}>
            <span className={styles.quoteLabel}>인쇄방식</span>
            <span className={styles.quoteValue}>{quoteData.printType}</span>
          </div>
        )}
        {quoteData.notes && (
          <div className={styles.quoteItem}>
            <span className={styles.quoteLabel}>추가 요청</span>
            <span className={styles.quoteValue}>{quoteData.notes}</span>
          </div>
        )}
      </div>
      <div className={styles.quotePreviewActions}>
        <Button variant="secondary" size="small" onClick={onClose}>
          수정하기
        </Button>
        <Button variant="primary" size="small" onClick={onSendQuote}>
          사장님 선택하기
        </Button>
      </div>
    </div>
  );
}

// 사장님 선택 모달
function MakerSelectionModal({ makers, selectedMaker, onSelect, onClose, onConfirm }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.makerModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>
        <div className={styles.makerModalHeader}>
          <Building2 size={24} />
          <h2>견적 요청할 사장님 선택</h2>
        </div>
        <p className={styles.makerModalDesc}>
          견적 요청서를 보낼 사장님을 선택해주세요
        </p>
        <div className={styles.makerList}>
          {makers.map((maker) => {
            const workload = getWorkloadUI(maker.workload);
            return (
              <div
                key={maker.id}
                className={`${styles.makerCard} ${selectedMaker?.id === maker.id ? styles.selected : ''}`}
                onClick={() => onSelect(maker)}
              >
                <div className={styles.makerInfo}>
                  <div className={styles.makerTop}>
                    <span className={styles.makerCategory}>{maker.category}</span>
                    <span className={styles.makerRating}>
                      <Star size={12} fill="currentColor" />
                      {maker.rating}
                    </span>
                    <div className={`${styles.workloadBadge} ${workload.className}`}>
                      <span className={styles.workloadDot}></span>
                      <span>{workload.label}</span>
                    </div>
                  </div>
                  <h3 className={styles.makerName}>{maker.name}</h3>
                  <div className={styles.makerTags}>
                    {maker.tags.map((tag, i) => (
                      <span key={i} className={styles.makerTag}>#{tag}</span>
                    ))}
                  </div>
                </div>
                {selectedMaker?.id === maker.id && (
                  <div className={styles.selectedCheck}>
                    <Check size={20} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles.makerModalFooter}>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={!selectedMaker}
          >
            견적 요청 보내기
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaperRecommendation({ paper, onSelect }) {
  const randomImg = getRandomVariantImage(paper.variants);

  return (
    <div className={styles.paperCard} onClick={() => onSelect(paper)}>
      <div className={styles.paperImage}>
        {randomImg ? (
          <img src={randomImg} alt={paper.paper_name} className={styles.paperImg} />
        ) : (
          <div className={styles.paperPlaceholder}>
            <Layers size={24} />
          </div>
        )}
      </div>
      <div className={styles.paperInfo}>
        <h4 className={styles.paperName}>{paper.paper_name}</h4>
        {paper.feature && (
          <p className={styles.paperSpec}>{paper.feature}</p>
        )}
        <div className={styles.paperKeywords}>
          {paper.tags && paper.tags.split(',').slice(0, 2).map((tag, i) => (
            <span key={i} className={styles.keyword}>#{tag.trim()}</span>
          ))}
        </div>
        {paper.variants && paper.variants.length > 0 && (
          <div className={styles.variantCount}>
            <Palette size={12} />
            <span>{paper.variants.length}가지 옵션</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIChat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: '안녕하세요! 저는 Paperly AI 입니다. 어떤 느낌의 종이를 찾고 계신가요? "포근한 느낌의 청첩장 종이", "고급스러운 명함용 종이" 처럼 편하게 말씀해주세요!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quoteData, setQuoteData] = useState(null);
  const [showQuotePreview, setShowQuotePreview] = useState(false);
  const [showMakerSelection, setShowMakerSelection] = useState(false);
  const [selectedMaker, setSelectedMaker] = useState(null);
  const [isQuoteMode, setIsQuoteMode] = useState(false); // 견적 모드 상태

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // 이전 메시지 히스토리 (최근 6개만)
      const history = messages.slice(-6).map(m => ({
        type: m.type,
        text: m.text
      }));

      // Gemini API 호출 (현재 모드 전달)
      const aiResponse = await askGemini(userInput, history, isQuoteMode);

      // 견적 요청이 완료된 경우
      if (aiResponse.type === 'quote_ready' && aiResponse.quoteData) {
        setQuoteData(aiResponse.quoteData);
        setIsQuoteMode(true);

        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: aiResponse.message,
          responseType: 'quote_ready'
        };
        setMessages(prev => [...prev, aiMessage]);

        // 잠시 후 견적 미리보기 표시
        setTimeout(() => {
          setShowQuotePreview(true);
        }, 500);
      }
      // 견적 정보 수집 중
      else if (aiResponse.type === 'quote_collecting') {
        setIsQuoteMode(true);
        // 부분 수집된 데이터 저장
        if (aiResponse.quoteData) {
          setQuoteData(prev => ({
            ...prev,
            ...aiResponse.quoteData
          }));
        }

        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: aiResponse.message,
          responseType: 'quote_collecting'
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      // 일반 추천 (견적 모드가 아닐 때만 종이 검색)
      else if (!isQuoteMode) {
        // 키워드로 종이 검색
        const recommendedPapers = await searchPapersByKeywords(aiResponse.searchTerms);

        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: aiResponse.message,
          papers: recommendedPapers,
          keywords: aiResponse.keywords
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      // 견적 모드인데 recommendation 타입이 온 경우 (텍스트만 표시)
      else {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: aiResponse.message
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: '죄송해요, 잠시 문제가 생겼어요. 다시 한번 말씀해주시겠어요?',
        papers: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeywordClick = (keyword) => {
    setInputValue(keyword);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaperSelect = (paper) => {
    setSelectedPaper(paper);
    setSelectedVariant(paper.variants?.[0] || null);
  };

  const closePaperDetail = () => {
    setSelectedPaper(null);
    setSelectedVariant(null);
  };

  const handleRequestQuote = (paper) => {
    closePaperDetail();
    // 선택한 종이 정보를 quoteData에 저장
    setQuoteData(prev => ({
      ...prev,
      paperName: paper.paper_name
    }));
    const detailMessage = {
      id: Date.now(),
      type: 'ai',
      text: `**${paper.paper_name}**을(를) 선택하셨네요!\n\n이 종이로 견적을 요청하시려면 아래 정보를 알려주세요:\n- 인쇄물 종류 (명함, 브로슈어 등)\n- 수량\n- 원하는 사이즈`,
    };
    setMessages(prev => [...prev, detailMessage]);
  };

  const handleCloseQuotePreview = () => {
    setShowQuotePreview(false);
    // 수정을 원하면 메시지 추가
    const modifyMessage = {
      id: Date.now(),
      type: 'ai',
      text: '견적 내용을 수정하고 싶으시면 원하시는 부분을 말씀해주세요!',
    };
    setMessages(prev => [...prev, modifyMessage]);
  };

  const handleOpenMakerSelection = () => {
    setShowQuotePreview(false);
    setShowMakerSelection(true);
  };

  const handleSelectMaker = (maker) => {
    setSelectedMaker(maker);
  };

  const handleCloseMakerSelection = () => {
    setShowMakerSelection(false);
    setSelectedMaker(null);
    // 견적 미리보기 다시 표시
    setShowQuotePreview(true);
  };

  const handleExitQuoteMode = () => {
    setIsQuoteMode(false);
    setQuoteData(null);
    const exitMessage = {
      id: Date.now(),
      type: 'ai',
      text: '종이 추천 모드로 돌아왔어요! 어떤 느낌의 종이를 찾고 계신가요?',
    };
    setMessages(prev => [...prev, exitMessage]);
  };

  const handleConfirmQuote = () => {
    if (!selectedMaker || !quoteData) return;

    // 견적 요청 완료 메시지
    const confirmMessage = {
      id: Date.now(),
      type: 'ai',
      text: `**${selectedMaker.name}** 사장님께 견적 요청을 보냈습니다! 🎉\n\n사장님이 확인하시면 연락드릴 거예요. 다른 도움이 필요하시면 말씀해주세요!`,
    };
    setMessages(prev => [...prev, confirmMessage]);

    // 상태 초기화
    setShowMakerSelection(false);
    setSelectedMaker(null);
    setQuoteData(null);
    setIsQuoteMode(false); // 견적 모드 종료

    // TODO: 실제 견적 요청 API 호출
    console.log('Quote request sent:', { maker: selectedMaker, quoteData });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerContent}>
          <div className={styles.aiAvatar}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className={styles.title}>AI 종이 추천</h1>
            <span className={styles.status}>온라인</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesArea}>
        {messages.map(message => (
          <div
            key={message.id}
            className={`${styles.message} ${message.type === 'user' ? styles.user : styles.ai}`}
          >
            {message.type === 'ai' && (
              <div className={styles.aiAvatarSmall}>
                <Sparkles size={14} />
              </div>
            )}
            <div className={styles.messageContent}>
              <div className={styles.messageBubble}>
                {message.type === 'ai' ? formatAIMessage(message.text) : message.text}
              </div>
              {message.keywords && message.keywords.length > 0 && (
                <div className={styles.extractedKeywords}>
                  {message.keywords.map((kw, i) => (
                    <span key={i} className={styles.extractedKeyword}>#{kw}</span>
                  ))}
                </div>
              )}
              {message.papers && message.papers.length > 0 && (
                <div className={styles.recommendationsWrapper}>
                  <div className={styles.recommendations}>
                    {message.papers.map(paper => (
                      <PaperRecommendation
                        key={paper.paper_name}
                        paper={paper}
                        onSelect={handlePaperSelect}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className={`${styles.message} ${styles.ai}`}>
            <div className={styles.aiAvatarSmall}>
              <Sparkles size={14} />
            </div>
            <div className={styles.typing}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {/* 견적 미리보기 */}
        {showQuotePreview && quoteData && (
          <div className={`${styles.message} ${styles.ai}`}>
            <div className={styles.aiAvatarSmall}>
              <Sparkles size={14} />
            </div>
            <div className={styles.messageContent}>
              <QuotePreview
                quoteData={quoteData}
                onClose={handleCloseQuotePreview}
                onSendQuote={handleOpenMakerSelection}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Keywords */}
      <div className={styles.suggestions}>
        {isQuoteMode ? (
          <>
            <button
              className={`${styles.suggestionBtn} ${styles.exitQuoteBtn}`}
              onClick={handleExitQuoteMode}
            >
              ← 종이 추천으로
            </button>
            {quoteKeywords.map(keyword => (
              <button
                key={keyword}
                className={styles.suggestionBtn}
                onClick={() => handleKeywordClick(keyword)}
              >
                {keyword}
              </button>
            ))}
          </>
        ) : (
          <>
            {suggestedKeywords.map(keyword => (
              <button
                key={keyword}
                className={styles.suggestionBtn}
                onClick={() => handleKeywordClick(keyword)}
              >
                {keyword}
              </button>
            ))}
            <button
              className={`${styles.suggestionBtn} ${styles.quoteBtn}`}
              onClick={() => handleKeywordClick('견적 요청하고 싶어요')}
            >
              견적 요청
            </button>
          </>
        )}
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="원하는 느낌을 입력하세요..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.input}
          disabled={isTyping}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
        >
          <Send size={20} />
        </button>
      </div>

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
                    <Layers size={48} />
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

                {selectedPaper.description && (
                  <div className={styles.paperDetailSection}>
                    <h3>설명</h3>
                    {formatTextWithList(selectedPaper.description)}
                  </div>
                )}

                {selectedPaper.feature && (
                  <div className={styles.paperDetailSection}>
                    <h3>특징</h3>
                    {formatTextWithList(selectedPaper.feature)}
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
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={closePaperDetail}>
                닫기
              </Button>
              <Button variant="primary" onClick={() => handleRequestQuote(selectedPaper)}>
                이 종이로 견적 요청
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Maker Selection Modal */}
      {showMakerSelection && (
        <MakerSelectionModal
          makers={mockMakers}
          selectedMaker={selectedMaker}
          onSelect={handleSelectMaker}
          onClose={handleCloseMakerSelection}
          onConfirm={handleConfirmQuote}
        />
      )}
    </div>
  );
}
