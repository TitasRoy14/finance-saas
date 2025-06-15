'use client';
import { DataCharts } from '@/components/data-charts';
import DataGrid from '@/components/data-grid';
import { Suspense } from 'react';

export default function Home() {
  return (
    <Suspense>
      <div className="max-w-(--breakpoint-2xl) mx-auto w-full pb-10 -mt-24">
        <DataGrid />
        <DataCharts />
      </div>
    </Suspense>
  );
}
