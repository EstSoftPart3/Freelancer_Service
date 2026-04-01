import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { FaqMutateDrawer } from './faq-mutate-drawer';
import { useFaq } from './faq-provider';

export function FaqDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useFaq();

  const handleDelete = async () => {
    if (!currentRow) return;

    toast.success('FAQ가 삭제되었습니다.');
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      <FaqMutateDrawer
        key='faq-create'
        open={open === 'create'}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      />

      {currentRow && (
        <>
          <FaqMutateDrawer
            key={`faq-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null);
                setTimeout(() => setCurrentRow(null), 300);
              }
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='faq-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => !isOpen && setOpen(null)}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`FAQ 삭제: ${currentRow.id}번`}
            desc={
              <>
                정말로 <strong>{currentRow.question}</strong> FAQ를
                삭제하시겠습니까? <br />이 작업은 되돌릴 수 없습니다.
              </>
            }
            confirmText='삭제'
          />
        </>
      )}
    </>
  );
}
