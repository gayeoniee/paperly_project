import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ArrowLeft, Layers, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { askGemini } from '../../lib/gemini';
import { searchPapersByKeywords } from '../../lib/supabase';
import styles from './AIChat.module.css';

const suggestedKeywords = ['포근한 느낌', '고급스러운', '친환경', '빈티지', '명함용'];

// variants에서 랜덤 이미지 가져오기
const getRandomVariantImage = (variants) => {
  if (!variants || variants.length === 0) return null;
  const variantsWithImg = variants.filter(v => v.paper_img);
  if (variantsWithImg.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * variantsWithImg.length);
  return variantsWithImg[randomIndex].paper_img;
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
    // 종이 선택 시 상세 정보 보여주기
    const detailMessage = {
      id: Date.now(),
      type: 'ai',
      text: `${paper.paper_name}을(를) 선택하셨네요! ${paper.feature || ''} ${paper.description || ''} 이 종이로 견적을 요청하시겠어요?`,
      selectedPaper: paper
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
                {message.text}
              </div>
              {message.keywords && message.keywords.length > 0 && (
                <div className={styles.extractedKeywords}>
                  {message.keywords.map((kw, i) => (
                    <span key={i} className={styles.extractedKeyword}>#{kw}</span>
                  ))}
                </div>
              )}
              {message.papers && message.papers.length > 0 && (
                <div className={styles.recommendations}>
                  {message.papers.map(paper => (
                    <PaperRecommendation
                      key={paper.paper_name}
                      paper={paper}
                      onSelect={handlePaperSelect}
                    />
                  ))}
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
    </div>
  );
}
