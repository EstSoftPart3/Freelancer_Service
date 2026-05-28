import { ConfirmDialog } from '@/components/confirm-dialog'
import { useBanner } from './banner-provider'
import { BannerMutateDrawer } from './banner-mutate-drawer'
import { BannerViewDrawer } from './banner-view-drawer'

export function BannerDialogs() {
  const { open, setOpen, currentRow, deleteBanner } = useBanner()

  const handleDelete = () => {
    if (!currentRow) return
    deleteBanner(currentRow.bannerSq)
    // await bannerApi.deleteBanner(currentRow.bannerSq)
    setOpen(null)
  }

  return (
    <>
      <BannerMutateDrawer
        key='banner-create'
        open={open === 'create'}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      />

      {currentRow && (
        <>
          <BannerViewDrawer />

          <BannerMutateDrawer
            key={`banner-update-${currentRow.bannerSq}`}
            open={open === 'update'}
            onOpenChange={(isOpen) => !isOpen && setOpen(null)}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='banner-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => !isOpen && setOpen(null)}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`배너 삭제: ${currentRow.bannerSq}번`}
            desc={
              <>
                정말로 <strong>{currentRow.bannerTitle}</strong> 배너를
                삭제하시겠습니까?
                <br />
                (현재는 목 데이터에서만 제거됩니다.)
              </>
            }
            confirmText='삭제'
          />
        </>
      )}
    </>
  )
}
