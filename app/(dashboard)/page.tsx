'use client';

import { Button } from '@/components/ui/button';
import { useNewAccount } from '@/features/accounts/hooks/use-new-account';

export default function Home() {
  const { onOpen } = useNewAccount();
  return (
    <div>
      <p>this is an authinticated route</p>
      <Button onClick={onOpen}>Add account</Button>
    </div>
  );
}
