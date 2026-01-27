// Gemini API 헬퍼
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// 시스템 프롬프트: 종이 추천 전문가
const SYSTEM_PROMPT = `당신은 "Paperly"의 AI 종이 추천 전문가입니다.
사용자가 원하는 느낌이나 용도를 말하면, 적합한 종이를 추천해주세요.

규칙:
1. 친근하고 전문적인 말투를 사용하세요
2. 사용자의 요청에서 키워드를 추출하세요
3. 종이 추천 시 왜 그 종이가 적합한지 간단히 설명하세요
4. 답변은 2-3문장으로 간결하게 해주세요
5. 항상 한국어로 답변하세요

사용자 요청에서 다음과 같은 키워드를 추출하세요:
- 느낌: 포근한, 고급스러운, 빈티지, 모던, 자연스러운, 따뜻한, 차가운, 부드러운
- 용도: 명함, 청첩장, 포스터, 브로슈어, 패키지, 책, 아트북
- 특성: 친환경, 재생, 두꺼운, 얇은, 광택, 무광

응답 형식 (JSON):
{
  "message": "사용자에게 보여줄 친근한 답변 메시지",
  "keywords": ["추출된", "키워드", "배열"],
  "searchTerms": ["DB검색용", "태그"]
}`;

export async function askGemini(userMessage, conversationHistory = []) {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using fallback response.');
    return getFallbackResponse(userMessage);
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
          message: parsed.message || textResponse,
          keywords: parsed.keywords || [],
          searchTerms: parsed.searchTerms || parsed.keywords || []
        };
      }
    } catch (parseError) {
      // JSON 파싱 실패시 텍스트 그대로 반환
      console.log('JSON parse failed, using raw text');
    }

    // JSON이 아닌 경우 텍스트에서 키워드 추출 시도
    return {
      message: textResponse,
      keywords: extractKeywordsFromText(userMessage),
      searchTerms: extractKeywordsFromText(userMessage)
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
function getFallbackResponse(userMessage) {
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
    message,
    keywords,
    searchTerms: keywords
  };
}
