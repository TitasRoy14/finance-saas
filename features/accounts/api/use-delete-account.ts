import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { client } from '@/lib/hono';
type ResponseType = InferResponseType<
  (typeof client.api.accounts)[':id']['$delete']
>;

export const useDeleteAccount = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async (json) => {
      const response = await client.api.accounts[':id']['$delete']({
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Account deleted');
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      //TODO:invalidate the summary and transaction
    },
    onError: () => {
      toast.error('Failed to delete account');
    },
  });

  return mutation;
};