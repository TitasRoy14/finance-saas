'use client';
import DataGrid from '@/components/data-grid';
import { useGetSummary } from '@/features/summary/api/use-get-summary';
import { formatCurrency } from '@/lib/utils';

export default function Home() {
  const { data } = useGetSummary();

  console.log({ data });
  return (
    <div className='max-w-screen-2xl mx-auto w-full pb-10 -mt-24'>
      <DataGrid />
    </div>
  );
}
