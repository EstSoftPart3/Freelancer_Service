import { createFileRoute } from '@tanstack/react-router';
import { FaqList } from '@/features/faq';

export const Route = createFileRoute('/_authenticated/contents/faq/')({
  component: FaqList,
});
