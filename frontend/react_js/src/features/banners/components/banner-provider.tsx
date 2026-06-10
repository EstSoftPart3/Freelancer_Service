import React, { useCallback, useState } from 'react'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { bannerApi, type BannerListParams } from '../api/banner-api'
import { type Banner } from '../data/schema'

type BannerDialogType = 'create' | 'update' | 'delete' | 'view'

type BannerContextType = {
  open: BannerDialogType | null
  setOpen: (str: BannerDialogType | null) => void
  currentRow: Banner | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Banner | null>>
  banners: Banner[]
  totalElements: number
  isLoading: boolean
  fetchBanners: (params: BannerListParams) => Promise<void>
  refreshBanners: () => Promise<void>
  toggleActive: (bannerSq: number) => Promise<void>
  deleteBanner: (bannerSq: number) => Promise<void>
}

const BannerContext = React.createContext<BannerContextType | null>(null)

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<BannerDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Banner | null>(null)
  const [banners, setBanners] = useState<Banner[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [listParams, setListParams] = useState<BannerListParams>({
    page: 1,
    size: 10,
    sortField: 'displayOrder',
    sortOrder: 'ASC',
  })

  const fetchBanners = useCallback(async (params: BannerListParams) => {
    setListParams(params)
    try {
      setIsLoading(true)
      const response = await bannerApi.getBanners(params)
      if (response.output) {
        setBanners(response.output.banners)
        setTotalElements(response.output.totalElements)
      }
    } catch {
      toast.error('배너 목록 조회에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshBanners = useCallback(async () => {
    await fetchBanners(listParams)
  }, [fetchBanners, listParams])

  const toggleActive = useCallback(
    async (bannerSq: number) => {
      try {
        await bannerApi.toggleActive(bannerSq)
        toast.success('배너 활성 상태가 변경되었습니다.')
        await refreshBanners()
      } catch {
        toast.error('활성 상태 변경에 실패했습니다.')
      }
    },
    [refreshBanners]
  )

  const deleteBanner = useCallback(
    async (bannerSq: number) => {
      try {
        await bannerApi.deleteBanner(bannerSq)
        toast.success('배너가 삭제되었습니다.')
        await refreshBanners()
      } catch {
        toast.error('배너 삭제에 실패했습니다.')
      }
    },
    [refreshBanners]
  )

  return (
    <BannerContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        banners,
        totalElements,
        isLoading,
        fetchBanners,
        refreshBanners,
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
