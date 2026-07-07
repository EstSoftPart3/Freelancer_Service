import { create } from 'zustand'

// 전체보기/일반게시판/Q&A 탭 전환 시 정렬·검색 조건을 보존하기 위한 스토어.
// page는 탭을 옮길 때마다 1로 리셋하므로 여기서 관리하지 않는다.
interface CommunityFilters {
  sort: string
  searchType: string
  keyword: string
  status: string
}

const EMPTY: CommunityFilters = {
  sort: 'latest',
  searchType: 'all',
  keyword: '',
  status: 'all',
}

interface CommunityState extends CommunityFilters {
  setFilters: (partial: Partial<CommunityFilters>) => void
  reset: () => void
}

export const useCommunityStore = create<CommunityState>((set) => ({
  ...EMPTY,
  setFilters: (partial) => set((state) => ({ ...state, ...partial })),
  reset: () => set({ ...EMPTY }),
}))
