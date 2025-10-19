import Handwriting from '@/components/handwriting/Handwriting';

interface HandwritingDetailPageProps {
  params: {
    id: string;
    userId: string;
  };
}

export default function HandwritingDetailPage({ params }: HandwritingDetailPageProps) {
  return <Handwriting handwritingId={params.id} />;
}
