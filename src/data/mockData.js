// Mock Data for Paperly

export const currentUser = {
  id: 'user-1',
  name: '김장인',
  role: 'maker', // 'maker' or 'designer'
  company: '성원인쇄소',
  email: 'kim@sungwon.com',
  avatar: null
};

export const papers = [
  {
    id: 'paper-1',
    name: '몽블랑 스노우화이트',
    category: '고급지',
    weight: '200g',
    texture: '부드러움',
    keywords: ['포근한', '고급스러운', '깔끔한'],
    price: 1200,
    image: null
  },
  {
    id: 'paper-2',
    name: '크라프트 내추럴',
    category: '친환경',
    weight: '150g',
    texture: '거친',
    keywords: ['자연스러운', '빈티지', '따뜻한'],
    price: 800,
    image: null
  },
  {
    id: 'paper-3',
    name: '랑데부 아이보리',
    category: '고급지',
    weight: '180g',
    texture: '매끄러움',
    keywords: ['우아한', '클래식', '부드러운'],
    price: 1500,
    image: null
  },
  {
    id: 'paper-4',
    name: '에코 리사이클',
    category: '친환경',
    weight: '120g',
    texture: '보통',
    keywords: ['환경친화', '심플한', '자연스러운'],
    price: 600,
    image: null
  }
];

export const orders = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2026-0126-001',
    designerName: '박디자인',
    designerCompany: '스튜디오 모먼트',
    status: 'in_progress',
    statusText: '인쇄 진행중',
    paperName: '몽블랑 스노우화이트',
    quantity: 500,
    totalPrice: 125000,
    createdAt: '2026-01-25',
    dueDate: '2026-01-30',
    progress: 60
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2026-0125-003',
    designerName: '이크리에이티브',
    designerCompany: '디자인랩',
    status: 'pending',
    statusText: '견적 대기',
    paperName: '크라프트 내추럴',
    quantity: 1000,
    totalPrice: 0,
    createdAt: '2026-01-25',
    dueDate: null,
    progress: 0
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-2026-0124-002',
    designerName: '최아트',
    designerCompany: '아트스페이스',
    status: 'completed',
    statusText: '완료',
    paperName: '랑데부 아이보리',
    quantity: 300,
    totalPrice: 89000,
    createdAt: '2026-01-24',
    dueDate: '2026-01-26',
    progress: 100
  },
  {
    id: 'order-4',
    orderNumber: 'ORD-2026-0126-002',
    designerName: '정스튜디오',
    designerCompany: '프린트하우스',
    status: 'quote_sent',
    statusText: '견적 발송',
    paperName: '에코 리사이클',
    quantity: 2000,
    totalPrice: 156000,
    createdAt: '2026-01-26',
    dueDate: null,
    progress: 20
  }
];

export const quotes = [
  {
    id: 'quote-1',
    quoteNumber: 'QT-2026-0126-001',
    date: '2026년 01월 26일',
    recipient: '박디자인',
    recipientCompany: '스튜디오 모먼트',
    supplier: {
      businessNumber: '367-87-00976',
      companyName: '(주)성원인쇄소',
      representative: '김장인',
      address: '서울 성동구 성수2가 284-49',
      phone: '02-1234-5678'
    },
    items: [
      {
        name: '실내용배너',
        material: '페트 210µ',
        size: '600*1800',
        quantity: 1,
        unit: '장',
        varieties: 1,
        frontPrint: '수성잉크 4색',
        backPrint: '없음'
      }
    ],
    subtotal: 11300,
    tax: 1130,
    shipping: 0,
    additionalCost: 0,
    total: 12430,
    notes: '',
    validDays: 15,
    status: 'sent'
  }
];

export const chats = [
  {
    id: 'chat-1',
    partnerId: 'designer-1',
    partnerName: '박디자인',
    partnerCompany: '스튜디오 모먼트',
    partnerRole: 'designer',
    lastMessage: '네, 내일 오후에 샘플 확인 가능할까요?',
    lastMessageTime: '오후 3:42',
    unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'designer-1', text: '안녕하세요, 명함 인쇄 문의드려요', time: '오후 2:30', isMe: false },
      { id: 'm2', senderId: 'user-1', text: '네 안녕하세요! 어떤 종이로 생각하고 계신가요?', time: '오후 2:35', isMe: true },
      { id: 'm3', senderId: 'designer-1', text: '포근하고 따뜻한 느낌의 종이를 찾고 있어요', time: '오후 3:00', isMe: false },
      { id: 'm4', senderId: 'user-1', text: '몽블랑 스노우화이트나 랑데부 아이보리를 추천드려요. 둘 다 부드러운 질감이에요.', time: '오후 3:15', isMe: true },
      { id: 'm5', senderId: 'designer-1', text: '오, 좋네요! 샘플을 볼 수 있을까요?', time: '오후 3:30', isMe: false },
      { id: 'm6', senderId: 'designer-1', text: '네, 내일 오후에 샘플 확인 가능할까요?', time: '오후 3:42', isMe: false }
    ]
  },
  {
    id: 'chat-2',
    partnerId: 'designer-2',
    partnerName: '이크리에이티브',
    partnerCompany: '디자인랩',
    partnerRole: 'designer',
    lastMessage: '견적서 확인했습니다. 감사합니다!',
    lastMessageTime: '오전 11:20',
    unreadCount: 0,
    messages: [
      { id: 'm1', senderId: 'designer-2', text: '브로슈어 인쇄 견적 부탁드려요', time: '오전 10:00', isMe: false },
      { id: 'm2', senderId: 'user-1', text: '네, 사이즈와 수량 알려주시면 견적 보내드릴게요', time: '오전 10:15', isMe: true },
      { id: 'm3', senderId: 'designer-2', text: 'A4 삼단접지, 1000부입니다', time: '오전 10:30', isMe: false },
      { id: 'm4', senderId: 'user-1', text: '견적서 보내드렸습니다. 확인 부탁드려요!', time: '오전 11:00', isMe: true },
      { id: 'm5', senderId: 'designer-2', text: '견적서 확인했습니다. 감사합니다!', time: '오전 11:20', isMe: false }
    ]
  },
  {
    id: 'chat-3',
    partnerId: 'maker-1',
    partnerName: '김장인',
    partnerCompany: '성원인쇄소',
    partnerRole: 'maker',
    lastMessage: '견적서 보내드렸습니다. 확인 부탁드려요!',
    lastMessageTime: '오전 11:00',
    unreadCount: 1,
    messages: [
      { id: 'm1', senderId: 'user-1', text: '안녕하세요, 명함 인쇄 문의드려요', time: '오후 2:30', isMe: true },
      { id: 'm2', senderId: 'maker-1', text: '네 안녕하세요! 어떤 종이로 생각하고 계신가요?', time: '오후 2:35', isMe: false },
      { id: 'm3', senderId: 'user-1', text: '포근하고 따뜻한 느낌의 종이를 찾고 있어요', time: '오후 3:00', isMe: true },
      { id: 'm4', senderId: 'maker-1', text: '견적서 보내드렸습니다. 확인 부탁드려요!', time: '오전 11:00', isMe: false }
    ]
  }
];

export const files = [
  {
    id: 'file-1',
    name: '명함_디자인_최종.pdf',
    type: 'pdf',
    size: '2.4MB',
    uploadedBy: '박디자인',
    uploadedAt: '2026-01-26 14:30',
    orderNumber: 'ORD-2026-0126-001'
  },
  {
    id: 'file-2',
    name: '브로슈어_표지.jpg',
    type: 'image',
    size: '5.1MB',
    uploadedBy: '이크리에이티브',
    uploadedAt: '2026-01-25 16:20',
    orderNumber: 'ORD-2026-0125-003'
  },
  {
    id: 'file-3',
    name: '포스터_A2.ai',
    type: 'ai',
    size: '12.8MB',
    uploadedBy: '최아트',
    uploadedAt: '2026-01-24 09:15',
    orderNumber: 'ORD-2026-0124-002'
  }
];

export const stats = {
  todayOrders: 3,
  pendingQuotes: 2,
  inProgressOrders: 4,
  monthlyRevenue: 2450000,
  monthlyOrderCount: 28,
  unreadMessages: 3
};

// AI Chat responses for designer
export const aiResponses = {
  '포근한': '포근한 느낌을 원하시는군요! 부드러운 질감의 "몽블랑 스노우화이트"나 따뜻한 색감의 "랑데부 아이보리"를 추천드려요. 두 종이 모두 손으로 만졌을 때 포근한 감촉을 느낄 수 있어요.',
  '친환경': '환경을 생각하시는군요! "에코 리사이클"은 재생지로 만들어졌지만 인쇄 품질이 뛰어나요. "크라프트 내추럴"도 자연스러운 질감으로 친환경적인 이미지를 줄 수 있어요.',
  '고급스러운': '고급스러운 느낌이시라면 "랑데부 아이보리"가 제격이에요! 명함이나 초대장에 많이 사용되는 프리미엄 종이입니다. 은은한 광택이 있어서 우아한 느낌을 줘요.',
  '빈티지': '빈티지 감성이시네요! "크라프트 내추럴"이 딱이에요. 자연스러운 갈색 톤과 약간의 거친 질감이 레트로한 분위기를 연출해줍니다.',
  default: '어떤 느낌의 종이를 찾고 계신가요? "포근한", "고급스러운", "친환경", "빈티지" 같은 키워드로 말씀해주시면 딱 맞는 종이를 추천해드릴게요!'
};
