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

export async function askGemini(userMessage, conversationHistory = [], isQuoteMode = false) {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using fallback response.');
    return getFallbackResponse(userMessage, isQuoteMode);
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
    return getFallbackResponse(userMessage);
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

// API 키 없을 때 폴백 응답
function getFallbackResponse(userMessage, isQuoteMode = false) {
  // 견적 모드일 때
  if (isQuoteMode) {
    // 견적 관련 정보 추출 시도
    const quoteData = {};

    // 품명 추출
    const itemPatterns = ['명함', '브로슈어', '리플렛', '포스터', '카탈로그', '청첩장', '전단지', '스티커'];
    for (const item of itemPatterns) {
      if (userMessage.includes(item)) {
        quoteData.itemName = item;
        break;
      }
    }

    // 수량 추출 (숫자 + 장/부/매)
    const qtyMatch = userMessage.match(/(\d+)\s*(장|부|매|개)/);
    if (qtyMatch) {
      quoteData.quantity = qtyMatch[0];
    }

    // 사이즈 추출
    const sizePatterns = ['A4', 'A5', 'A6', 'B5', '90x50', '85x55'];
    for (const size of sizePatterns) {
      if (userMessage.toLowerCase().includes(size.toLowerCase())) {
        quoteData.size = size;
        break;
      }
    }

    // 후가공 관련 키워드 추출
    const finishingPatterns = ['금박', '은박', '형압', '엠보싱', '코팅', 'UV', '박'];
    const foundFinishing = finishingPatterns.filter(p => userMessage.includes(p));
    if (foundFinishing.length > 0) {
      quoteData.notes = foundFinishing.join(', ') + ' 후가공';
    }

    return {
      type: 'quote_collecting',
      message: '네, 말씀하신 내용 확인했어요! 견적 요청을 위해 아래 정보를 알려주세요:\n\n• **품명**: 어떤 인쇄물인가요? (명함, 브로슈어 등)\n• **규격**: 사이즈가 어떻게 되나요?\n• **수량**: 몇 부 필요하신가요?',
      keywords: [],
      searchTerms: [],
      quoteData: Object.keys(quoteData).length > 0 ? quoteData : null
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
