import { createFileRoute } from '@tanstack/react-router';
import { ProjectList } from '@/features/project';

export const Route = createFileRoute('/_authenticated/contents/project/')({
  component: ProjectList,
});
