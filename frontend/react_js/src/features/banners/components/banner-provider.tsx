import React, { useCallback, useState } from 'react'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { INITIAL_MOCK_BANNERS } from '../data/mock-banners'
import { type Banner } from '../data/schema'
// import { bannerApi } from '../api/banner-api'

type BannerDialogType = 'create' | 'update' | 'delete' | 'view'

type BannerContextType = {
  open: BannerDialogType | null
  setOpen: (str: BannerDialogType | null) => void
  currentRow: Banner | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Banner | null>>
  banners: Banner[]
  toggleActive: (bannerSq: number) => void
  deleteBanner: (bannerSq: number) => void
}

const BannerContext = React.createContext<BannerContextType | null>(null)

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<BannerDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Banner | null>(null)
  const [banners, setBanners] = useState<Banner[]>(INITIAL_MOCK_BANNERS)

  const toggleActive = useCallback((bannerSq: number) => {
    setBanners((prev) =>
      prev.map((b) =>
        b.bannerSq === bannerSq ? { ...b, isActive: !b.isActive } : b
      )
    )
    // await bannerApi.toggleActive(bannerSq)
    toast.success('활성 상태가 변경되었습니다. (목 데이터)')
  }, [])

  const deleteBanner = useCallback((bannerSq: number) => {
    setBanners((prev) => prev.filter((b) => b.bannerSq !== bannerSq))
    // await bannerApi.deleteBanner(bannerSq)
    toast.success('배너가 삭제되었습니다. (목 데이터)')
  }, [])

  return (
    <BannerContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        banners,
        toggleActive,
        deleteBanner,
      }}
    >
      {children}
    </BannerContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBanner = () => {
  const context = React.useContext(BannerContext)
  if (!context) {
    throw new Error('useBanner는 BannerProvider 안에서 사용되어야 합니다.')
  }
  return context
}
