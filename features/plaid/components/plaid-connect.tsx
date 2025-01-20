'use client';
import { Button } from '@/components/ui/button';
import { useMount } from 'react-use';
import { useState } from 'react';
import { useCreateLinkToken } from '../api/use-create-link-token';
import {usePlaidLink} from 'react-plaid-link';
import { useExchangePublicToken } from '../api/use-exchange-public-token';
export const PlaidConnect = () => {
  const [token, setToken] = useState<string | null>(null);
  const createLinkToken = useCreateLinkToken();
  const exchangePublicToken = useExchangePublicToken();

  useMount(() => {
    createLinkToken.mutate(undefined, {
      onSuccess: ({ data }) => {
       setToken(data)
      },
    });
  });

  const onClick = () => (
    plaid.open()
  )

  const plaid = usePlaidLink({
    token:token,
    onSuccess:(publicToken) => {
      exchangePublicToken.mutate({publicToken})
    },
    env:'sandbox'
  })

  const isDisabled = !plaid.ready || exchangePublicToken.isPending;

  return (
    <Button onClick={onClick} disabled={isDisabled} size='sm' variant='emerald'>
      Connect
    </Button>
  );
};
