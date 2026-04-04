import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { FaqMutateDrawer } from './faq-mutate-drawer';
import { useFaq } from './faq-provider';
import { FaqViewDrawer } from './faq-view-drawer';

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
        open={open === 'create' || open === 'update'}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      />

      {currentRow && (
        <>
          <FaqViewDrawer
            key={`faq-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null);
                setTimeout(() => setCurrentRow(null), 300);
              }
            }}
            currentRow={currentRow}
            onEdit={function (): void {
              throw new Error('Function not implemented.');
            }}
            onDelete={function (): void {
              throw new Error('Function not implemented.');
            }}
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
                삭제하시겠습니까? <br />
              </>
            }
            confirmText='삭제'
          />
        </>
      )}
    </>
  );
}
