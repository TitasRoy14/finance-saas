import { DateFilter } from '@/components/date-filter';
import { AccountFilter } from '@/components/account-filter';
import { Suspense } from 'react';

export const Filters = () => {
  return (
    <Suspense>
      <div className="flex flex-col lg:flex-row items-center gap-y-2 lg:gap-y-0 lg:gap-x-2">
        <AccountFilter />
        <DateFilter />
      </div>
    </Suspense>
  );
};
