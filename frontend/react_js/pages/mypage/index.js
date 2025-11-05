// Next.js 마이페이지 메인 라우트
// /mypage 경로로 접근 시 캘린더로 리다이렉트

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mypage/calendar');
  }, [router]);

  return null;
}

