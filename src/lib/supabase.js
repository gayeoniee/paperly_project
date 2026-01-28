import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 종이 마스터 + 변형 데이터 조회
export async function fetchPapers() {
  // paper_master 테이블에서 기본 정보 조회
  const { data: masters, error: masterError } = await supabase
    .from('paper_master')
    .select('*');

  if (masterError) {
    console.error('Error fetching paper masters:', masterError);
    return [];
  }

  // paper_variants 테이블에서 변형 정보 조회
  const { data: variants, error: variantError } = await supabase
    .from('paper_variants')
    .select('*');

  if (variantError) {
    console.error('Error fetching paper variants:', variantError);
    return [];
  }

  // 마스터 데이터와 변형 데이터 결합
  const papersWithVariants = masters.map(master => ({
    ...master,
    variants: variants.filter(v => v.paper_name === master.paper_name)
  }));

  return papersWithVariants;
}

// 키워드로 종이 검색
export async function searchPapersByKeywords(keywords) {
  if (!keywords || keywords.length === 0) {
    return [];
  }

  // paper_master 테이블에서 태그, 특징, 설명에서 키워드 검색
  const { data: masters, error: masterError } = await supabase
    .from('paper_master')
    .select('*');

  if (masterError) {
    console.error('Error searching papers:', masterError);
    return [];
  }

  // 키워드 매칭 점수 계산
  const scoredPapers = masters.map(paper => {
    let score = 0;
    const searchFields = [
      paper.tags || '',
      paper.feature || '',
      paper.description || '',
      paper.pattern || '',
      paper.paper_name || ''
    ].join(' ').toLowerCase();

    keywords.forEach(keyword => {
      const kw = keyword.toLowerCase();
      if (searchFields.includes(kw)) {
        score += 1;
        // 태그에 있으면 가중치 추가
        if ((paper.tags || '').toLowerCase().includes(kw)) {
          score += 2;
        }
      }
    });

    return { ...paper, matchScore: score };
  });

  // 점수가 있는 것만 필터링하고 정렬
  const matchedPapers = scoredPapers
    .filter(p => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // 최대 5개

  if (matchedPapers.length === 0) {
    // 매칭되는 게 없으면 랜덤으로 3개 추천
    const shuffled = masters.sort(() => 0.5 - Math.random());
    return await addVariantsToPapers(shuffled.slice(0, 3));
  }

  return await addVariantsToPapers(matchedPapers);
}

// 종이에 variants 추가하는 헬퍼 함수
async function addVariantsToPapers(papers) {
  const paperNames = papers.map(p => p.paper_name);

  const { data: variants, error: variantError } = await supabase
    .from('paper_variants')
    .select('*')
    .in('paper_name', paperNames);

  if (variantError) {
    console.error('Error fetching variants:', variantError);
    return papers.map(p => ({ ...p, variants: [] }));
  }

  return papers.map(paper => ({
    ...paper,
    variants: variants.filter(v => v.paper_name === paper.paper_name)
  }));
}

// 특정 종이 상세 조회
export async function fetchPaperDetail(paperName) {
  const { data: master, error: masterError } = await supabase
    .from('paper_master')
    .select('*')
    .eq('paper_name', paperName)
    .single();

  if (masterError) {
    console.error('Error fetching paper detail:', masterError);
    return null;
  }

  const { data: variants, error: variantError } = await supabase
    .from('paper_variants')
    .select('*')
    .eq('paper_name', paperName);

  if (variantError) {
    console.error('Error fetching paper variants:', variantError);
    return null;
  }

  return {
    ...master,
    variants: variants || []
  };
}
