import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ArrowLeft, Layers, Palette, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { askGemini } from '../../lib/gemini';
import { searchPapersByKeywords } from '../../lib/supabase';
import Button from '../../components/common/Button';
import styles from './AIChat.module.css';

const suggestedKeywords = ['포근한 느낌', '고급스러운', '친환경', '빈티지', '명함용'];

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

      // Gemini API 호출
      const aiResponse = await askGemini(userInput, history);

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
    const detailMessage = {
      id: Date.now(),
      type: 'ai',
      text: `**${paper.paper_name}**을(를) 선택하셨네요!\n\n이 종이로 견적을 요청하시려면 아래 정보를 알려주세요:\n- 인쇄물 종류 (명함, 브로슈어 등)\n- 수량\n- 원하는 사이즈`,
    };
    setMessages(prev => [...prev, detailMessage]);
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

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Keywords */}
      <div className={styles.suggestions}>
        {suggestedKeywords.map(keyword => (
          <button
            key={keyword}
            className={styles.suggestionBtn}
            onClick={() => handleKeywordClick(keyword)}
          >
            {keyword}
          </button>
        ))}
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
    </div>
  );
}
