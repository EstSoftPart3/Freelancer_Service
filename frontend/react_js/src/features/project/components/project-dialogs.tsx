import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ProjectMutateDrawer } from './project-mutate-drawer';
import { useProject } from './project-provider';
import { ProjectViewDrawer } from './project-view-drawer';

export function ProjectDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProject();

  const handleDelete = async () => {
    if (!currentRow) return;

    toast.success('프로젝트 게시글이 삭제되었습니다.');
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      {currentRow && (
        <>
          <ProjectViewDrawer
            key={`project-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null);
                setTimeout(() => setCurrentRow(null), 300);
              }
            }}
            currentRow={currentRow}
            onEdit={() => setOpen('update')}
            onDelete={() => setOpen('delete')}
          />

          <ProjectMutateDrawer
            key={`project-update-${currentRow.id}`}
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
            key='project-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => !isOpen && setOpen(null)}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`프로젝트 게시글 삭제: ${currentRow.id}번`}
            desc={
              <>
                정말로 <strong>{currentRow.title}</strong> 게시글을
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
