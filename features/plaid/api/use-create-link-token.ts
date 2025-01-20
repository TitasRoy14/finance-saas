import { useMutation } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';
type ResponseType = InferResponseType<
  (typeof client.api.plaid)['create-link-token']['$post']
>;

export const useCreateLinkToken = () => {
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.plaid['create-link-token'].$post();
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Link Token Created');
    },
    onError: () => {
      toast.error('Failed to create link token');
    },
  });

  return mutation;
};
