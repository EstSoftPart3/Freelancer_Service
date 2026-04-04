'use client';

import { ProjectMutateDrawer } from './project-mutate-drawer';
import { useProject } from './project-provider';
import { ProjectViewDrawer } from './project-view-drawer';

export function ProjectDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProject();

  return (
    <>
      <ProjectMutateDrawer
        open={open === 'create' || open === 'update'}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setOpen(null);
            setTimeout(() => setCurrentRow(null), 300);
          }
        }}
        currentRow={currentRow}
      />

      {currentRow && (
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
          onEdit={function (): void {
            throw new Error('Function not implemented.');
          }}
          onDelete={function (): void {
            throw new Error('Function not implemented.');
          }}
        />
      )}
    </>
  );
}
