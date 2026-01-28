// Gemini API 헬퍼
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// 시스템 프롬프트: 종이 추천 전문가
const SYSTEM_PROMPT = `당신은 "Paperly"의 AI 종이 추천 및 견적 요청 전문가입니다.

## 중요: 모드를 명확히 분리하세요!
- **종이 추천 모드**: 종이 찾기, 추천, 느낌, 용도 관련 대화
- **견적 요청 모드**: 견적, 주문, 요청, 가격, 수량, 사이즈 관련 대화

한 번에 하나의 모드만 사용하세요. 모드가 섞이면 안 됩니다!

## 기본 규칙:
1. 친근하고 전문적인 말투를 사용하세요
2. 항상 한국어로 답변하세요
3. 응답을 깔끔하게 구조화하세요:
   - 여러 항목을 나열할 때는 "•" 또는 "-"로 시작하는 리스트 형식 사용
   - 강조할 단어는 **강조** 형식 사용

## 모드별 동작:

### 1. 종이 추천 모드 (type: "recommendation")
사용자가 종이를 찾거나 추천을 원할 때만:
- 키워드를 추출하고 적합한 종이 검색
- keywords와 searchTerms 반드시 포함
- quoteData는 포함하지 마세요

### 2. 견적 요청 모드 (type: "quote_collecting" 또는 "quote_ready")
사용자가 "견적", "주문", "요청", "가격", "몇 장", "수량" 등을 언급할 때:
- 종이 추천은 하지 마세요! keywords, searchTerms를 빈 배열로
- 필요한 정보만 수집: 품명, 규격(사이즈), 수량
- 선택 정보: 인쇄방식, 추가요청사항

정보가 부족하면 → type: "quote_collecting"
필수 정보(품명, 규격, 수량)가 다 있으면 → type: "quote_ready"

## 응답 형식 (JSON):

종이 추천 시:
{
  "type": "recommendation",
  "message": "사용자에게 보여줄 메시지",
  "keywords": ["추출한", "키워드"],
  "searchTerms": ["검색어"]
}

견적 수집 시:
{
  "type": "quote_collecting",
  "message": "부족한 정보를 물어보는 메시지",
  "keywords": [],
  "searchTerms": [],
  "quoteData": {
    "paperName": "선택한 종이명 (있으면)",
    "itemName": "품명",
    "size": "규격",
    "quantity": "수량",
    "printType": "인쇄방식",
    "notes": "추가 요청"
  }
}

견적 완료 시:
{
  "type": "quote_ready",
  "message": "견적 정보가 모두 수집되었습니다! 아래 내용을 확인해주세요.",
  "keywords": [],
  "searchTerms": [],
  "quoteData": { ... 모든 정보 포함 ... }
}`;

export async function askGemini(userMessage, conversationHistory = [], isQuoteMode = false, existingQuoteData = null) {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using fallback response.');
    return getFallbackResponse(userMessage, isQuoteMode, existingQuoteData);
  }

  try {
    // 대화 히스토리 구성
    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: 'model',
        parts: [{ text: '네, 이해했습니다. 종이 추천 전문가로서 도움을 드리겠습니다.' }]
      },
      ...conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('Empty response from Gemini');
    }

    // JSON 파싱 시도
    try {
      // JSON 블록 추출
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          type: parsed.type || 'recommendation',
          message: parsed.message || textResponse,
          keywords: parsed.keywords || [],
          searchTerms: parsed.searchTerms || parsed.keywords || [],
          quoteData: parsed.quoteData || null
        };
      }
    } catch (parseError) {
      // JSON 파싱 실패시 텍스트 그대로 반환
      console.log('JSON parse failed, using raw text');
    }

    // JSON이 아닌 경우 텍스트에서 키워드 추출 시도
    return {
      type: 'recommendation',
      message: textResponse,
      keywords: extractKeywordsFromText(userMessage),
      searchTerms: extractKeywordsFromText(userMessage),
      quoteData: null
    };

  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackResponse(userMessage, isQuoteMode, existingQuoteData);
  }
}

// 텍스트에서 키워드 추출 (폴백용)
function extractKeywordsFromText(text) {
  const allKeywords = [
    '포근', '고급', '빈티지', '모던', '자연', '따뜻', '차가운', '부드러운',
    '명함', '청첩장', '포스터', '브로슈어', '패키지', '책', '아트북',
    '친환경', '재생', '두꺼운', '얇은', '광택', '무광', '크라프트', '코튼'
  ];

  const found = allKeywords.filter(kw => text.includes(kw));
  return found.length > 0 ? found : ['추천'];
}

// 인쇄물별 기본 사이즈
const DEFAULT_SIZES = {
  '명함': '90x50mm',
  '브로슈어': 'A4',
  '리플렛': 'A4 3단접지',
  '포스터': 'A2',
  '카탈로그': 'A4',
  '청첩장': '150x150mm',
  '전단지': 'A5',
  '스티커': '50x50mm'
};

// 종이 추천 의도 감지
function hasPaperRecommendationIntent(message) {
  const paperKeywords = ['종이', '추천', '어떤 게', '뭐가 좋', '어떤게', '뭘 쓰', '뭘 써', '용지', '지류'];
  return paperKeywords.some(kw => message.includes(kw));
}

// API 키 없을 때 폴백 응답
function getFallbackResponse(userMessage, isQuoteMode = false, existingQuoteData = null) {
  // 견적 모드에서 종이 추천 요청 감지
  if (isQuoteMode && hasPaperRecommendationIntent(userMessage)) {
    // 기존 견적 데이터 유지하면서 종이 추천도 제공
    const quoteData = { ...(existingQuoteData || {}) };
    const itemName = quoteData.itemName || '';

    // 품명별 추천 종이
    const paperRecommendations = {
      '명함': '명함에는 **마시멜로우**, **몽블랑**, **랑데부** 같은 고급 코튼지나, **아르떼** 같은 부드러운 질감의 종이가 인기 있어요!',
      '브로슈어': '브로슈어에는 **아트지**, **스노우지** 같은 코팅지나, **몽블랑** 같은 고급지가 좋아요!',
      '포스터': '포스터에는 **아트지**, **스노우지** 같은 광택 있는 종이나, **모조지**가 적합해요!',
      '청첩장': '청첩장에는 **랑데부**, **코튼지**, **몽블랑** 같은 고급스러운 질감의 종이를 추천해요!',
      '리플렛': '리플렛에는 **아트지**, **스노우지**가 가장 많이 쓰이고, 고급스럽게는 **몽블랑**도 좋아요!',
      '': '어떤 인쇄물인지에 따라 추천이 달라져요! 명함, 브로슈어, 포스터 등 어떤 용도인지 알려주시면 맞춤 추천해드릴게요.'
    };

    const recommendation = paperRecommendations[itemName] || paperRecommendations[''];

    return {
      type: 'quote_collecting',
      message: `${recommendation}\n\n현재 견적 정보:\n• 품명: ${quoteData.itemName || '미정'}\n• 규격: ${quoteData.size || '미정'}\n• 수량: ${quoteData.quantity || '미정'}`,
      keywords: ['추천'],
      searchTerms: itemName ? [itemName, '고급'] : ['추천'],
      quoteData
    };
  }

  // 견적 모드일 때
  if (isQuoteMode) {
    // 기존 데이터와 새 데이터 병합
    const quoteData = { ...(existingQuoteData || {}) };
    const lowerMessage = userMessage.toLowerCase();

    // 수정/변경 의도 감지
    const wantsToModify = lowerMessage.includes('변경') || lowerMessage.includes('수정') ||
                          lowerMessage.includes('바꿔') || lowerMessage.includes('바꿀');
    const wantsToModifySize = wantsToModify && (lowerMessage.includes('사이즈') || lowerMessage.includes('규격') || lowerMessage.includes('크기'));
    const wantsToModifyQty = wantsToModify && (lowerMessage.includes('수량') || lowerMessage.includes('매수') || lowerMessage.includes('개수'));
    const wantsToModifyItem = wantsToModify && (lowerMessage.includes('품명') || lowerMessage.includes('종류'));
    const wantsToModifyPaper = wantsToModify && lowerMessage.includes('종이');

    // 수정 요청 처리
    if (wantsToModifySize) {
      return {
        type: 'quote_collecting',
        message: `현재 규격은 **${quoteData.size || '미정'}**이에요.\n새로운 규격을 알려주세요! (예: A4, 90x50mm, 일반 사이즈)`,
        keywords: [],
        searchTerms: [],
        quoteData
      };
    }
    if (wantsToModifyQty) {
      return {
        type: 'quote_collecting',
        message: `현재 수량은 **${quoteData.quantity || '미정'}**이에요.\n새로운 수량을 알려주세요! (예: 200매, 500부)`,
        keywords: [],
        searchTerms: [],
        quoteData
      };
    }
    if (wantsToModifyItem) {
      return {
        type: 'quote_collecting',
        message: `현재 품명은 **${quoteData.itemName || '미정'}**이에요.\n어떤 인쇄물로 바꿀까요? (명함, 브로슈어, 포스터 등)`,
        keywords: [],
        searchTerms: [],
        quoteData
      };
    }
    if (wantsToModifyPaper) {
      return {
        type: 'quote_collecting',
        message: `현재 선택된 종이는 **${quoteData.paperName || '미정'}**이에요.\n어떤 종이로 바꿀까요?`,
        keywords: [],
        searchTerms: [],
        quoteData
      };
    }

    // 종이 선택 감지 ("~로 해줘", "~로 할게", "~로 선택")
    const paperNames = ['아르떼', '몽블랑', '마시멜로우', '랑데부', '코튼', '크라프트', '모조지', '아트지', '스노우지', '레이드지', '펄지', '반누보'];
    for (const paper of paperNames) {
      if (userMessage.includes(paper)) {
        quoteData.paperName = paper;
        break;
      }
    }

    // 품명 추출
    const itemPatterns = ['명함', '브로슈어', '리플렛', '포스터', '카탈로그', '청첩장', '전단지', '스티커'];
    for (const item of itemPatterns) {
      if (userMessage.includes(item)) {
        quoteData.itemName = item;
        break;
      }
    }

    // 수량 추출 (숫자 + 장/부/매/세트)
    const qtyMatch = userMessage.match(/(\d+)\s*(장|부|매|개|세트)/);
    if (qtyMatch) {
      quoteData.quantity = qtyMatch[0];
    }

    // 사이즈 추출 - 더 많은 패턴 지원
    const sizePatterns = ['A4', 'A5', 'A6', 'A3', 'A2', 'B5', '90x50', '85x55', '90X50', '85X55'];
    for (const size of sizePatterns) {
      if (lowerMessage.includes(size.toLowerCase())) {
        quoteData.size = size.toUpperCase().replace('X', 'x');
        break;
      }
    }

    // mm 단위 사이즈 추출 (예: 90x50mm)
    const mmMatch = userMessage.match(/(\d+)\s*[xX×]\s*(\d+)\s*(mm)?/);
    if (mmMatch) {
      quoteData.size = `${mmMatch[1]}x${mmMatch[2]}mm`;
    }

    // "일반", "표준", "기본" 사이즈 요청 처리
    const wantsDefaultSize = lowerMessage.includes('일반') ||
                             lowerMessage.includes('표준') ||
                             lowerMessage.includes('기본') ||
                             lowerMessage.includes('보통') ||
                             lowerMessage.includes('알아서') ||
                             lowerMessage.includes('찾아서');

    if (wantsDefaultSize && quoteData.itemName && !quoteData.size) {
      if (DEFAULT_SIZES[quoteData.itemName]) {
        quoteData.size = DEFAULT_SIZES[quoteData.itemName];
      }
    }

    // 후가공 관련 키워드 추출
    const finishingPatterns = ['금박', '은박', '형압', '엠보싱', '코팅', 'UV', '박', '무광', '유광', '라미네이팅'];
    const foundFinishing = finishingPatterns.filter(p => userMessage.includes(p));
    if (foundFinishing.length > 0) {
      const existingNotes = quoteData.notes || '';
      const newNotes = foundFinishing.join(', ') + ' 후가공';
      quoteData.notes = existingNotes ? `${existingNotes}, ${newNotes}` : newNotes;
    }

    // 인쇄 방식 추출
    const printPatterns = ['양면', '단면', '4도', '1도', '풀컬러', '흑백'];
    const foundPrint = printPatterns.filter(p => userMessage.includes(p));
    if (foundPrint.length > 0) {
      quoteData.printType = foundPrint.join(' ');
    }

    // 종이 선택 시 메시지
    const justSelectedPaper = paperNames.some(p => userMessage.includes(p)) &&
                              (userMessage.includes('로 해') || userMessage.includes('로 할') ||
                               userMessage.includes('로 선택') || userMessage.includes('걸로'));
    if (justSelectedPaper && quoteData.paperName) {
      // 정보 현황 표시
      const infoLines = [];
      if (quoteData.paperName) infoLines.push(`• 종이: ${quoteData.paperName}`);
      if (quoteData.itemName) infoLines.push(`• 품명: ${quoteData.itemName}`);
      if (quoteData.size) infoLines.push(`• 규격: ${quoteData.size}`);
      if (quoteData.quantity) infoLines.push(`• 수량: ${quoteData.quantity}`);
      if (quoteData.printType) infoLines.push(`• 인쇄: ${quoteData.printType}`);
      if (quoteData.notes) infoLines.push(`• 후가공: ${quoteData.notes}`);

      const isComplete = quoteData.itemName && quoteData.size && quoteData.quantity;

      return {
        type: isComplete ? 'quote_ready' : 'quote_collecting',
        message: `**${quoteData.paperName}** 종이로 선택했어요! 좋은 선택이에요 ✨\n\n현재 견적 정보:\n${infoLines.join('\n')}${!isComplete ? '\n\n추가로 필요한 정보를 알려주세요!' : ''}`,
        keywords: [],
        searchTerms: [],
        quoteData
      };
    }

    // 필수 정보(품명, 사이즈, 수량)가 모두 있으면 quote_ready
    if (quoteData.itemName && quoteData.size && quoteData.quantity) {
      return {
        type: 'quote_ready',
        message: '견적 요청에 필요한 정보가 모두 수집되었어요! 아래 내용을 확인해주세요.',
        keywords: [],
        searchTerms: [],
        quoteData
      };
    }

    // 부분 정보만 있으면 나머지 요청
    const missing = [];
    if (!quoteData.itemName) missing.push('**품명** (명함, 브로슈어 등)');
    if (!quoteData.size) missing.push('**규격** (A4, 90x50mm 등)');
    if (!quoteData.quantity) missing.push('**수량** (100부, 200매 등)');

    const collectedInfo = [];
    if (quoteData.itemName) collectedInfo.push(`• 품명: ${quoteData.itemName}`);
    if (quoteData.size) collectedInfo.push(`• 규격: ${quoteData.size}`);
    if (quoteData.quantity) collectedInfo.push(`• 수량: ${quoteData.quantity}`);
    if (quoteData.notes) collectedInfo.push(`• 추가: ${quoteData.notes}`);

    let message = '';
    if (collectedInfo.length > 0) {
      message = `확인했어요!\n${collectedInfo.join('\n')}\n\n`;
    }
    message += `추가로 ${missing.join(', ')}을(를) 알려주세요!`;

    return {
      type: 'quote_collecting',
      message,
      keywords: [],
      searchTerms: [],
      quoteData: Object.keys(quoteData).length > 0 ? quoteData : null
    };
  }

  // 견적 요청 의도 감지 (isQuoteMode가 false여도)
  const quoteIntentKeywords = ['견적', '주문', '요청', '가격', '얼마', '비용', '인쇄하고', '만들고'];
  const hasQuoteIntent = quoteIntentKeywords.some(kw => userMessage.includes(kw));

  if (hasQuoteIntent) {
    // 견적 모드로 전환
    return {
      type: 'quote_collecting',
      message: '견적 요청을 도와드릴게요! 아래 정보를 알려주세요:\n\n• **품명**: 어떤 인쇄물인가요? (명함, 브로슈어, 포스터 등)\n• **규격**: 사이즈가 어떻게 되나요? (A4, 90x50mm 등)\n• **수량**: 몇 부 필요하신가요?\n\n예시: "명함 200매, 일반 사이즈로 해주세요"',
      keywords: [],
      searchTerms: [],
      quoteData: null
    };
  }

  // 종이 추천 모드
  const keywords = extractKeywordsFromText(userMessage);

  const responses = {
    '포근': '포근하고 따뜻한 느낌을 원하시는군요! 부드러운 질감의 종이를 추천드릴게요.',
    '고급': '고급스러운 느낌을 찾으시는군요! 두께감 있고 질감이 좋은 종이를 추천드립니다.',
    '빈티지': '빈티지한 분위기를 원하시네요! 크라프트 계열이나 복고풍 질감의 종이가 좋을 것 같아요.',
    '친환경': '친환경 종이를 찾으시는군요! 재생 펄프나 FSC 인증 종이를 추천드려요.',
    '명함': '명함용 종이를 찾으시는군요! 두께감 있고 인쇄가 잘 되는 종이를 추천드릴게요.',
    '청첩장': '청첩장용 종이시군요! 고급스럽고 특별한 질감의 종이가 좋을 것 같아요.'
  };

  let message = '말씀하신 느낌에 맞는 종이를 찾아볼게요!';
  for (const [key, response] of Object.entries(responses)) {
    if (userMessage.includes(key)) {
      message = response;
      break;
    }
  }

  return {
    type: 'recommendation',
    message,
    keywords,
    searchTerms: keywords,
    quoteData: null
  };
}
