'use client';

import { useRouter } from 'next/navigation';
import VillaDetail from '@/app/protected/admin/_components/VillaDetail';
import { use } from 'react';

interface VillaDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VillaDetailPage({ params }: VillaDetailPageProps) {
  const resolvedParams = use(params);
  const villaId = resolvedParams.id;
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.push('/protected/admin/villas')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Geri Dön</title>
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Villa Listesine Geri Dön
        </button>
      </div>

      <VillaDetail villaId={villaId} />
    </div>
  );
} 