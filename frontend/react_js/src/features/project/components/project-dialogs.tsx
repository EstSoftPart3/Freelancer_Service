'use client';

import { ProjectMutateDrawer } from './project-mutate-drawer';
import { useProject } from './project-provider';

export function ProjectDialogs() {
  const { open, setOpen, currentRow } = useProject();

  return (
    <>
      <ProjectMutateDrawer
        open={open === 'create' || open === 'update'}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setOpen(null);
        }}
        currentRow={currentRow}
      />
    </>
  );
}
