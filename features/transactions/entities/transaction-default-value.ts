import { useCreateAccount } from '@/features/accounts/api/use-create-account';
import { useGetAccounts } from '@/features/accounts/api/use-get-accounts';
import { useCreateCategories } from '@/features/categories/api/use-create-category';
import { useGetCategories } from '@/features/categories/api/use-get-categories';

export default function useTransactionDefaultValue() {
  //Categories Section
  const categoryQuery = useGetCategories();
  const categoryMutation = useCreateCategories();
  const onCreateCategory = (name: string) =>
    categoryMutation.mutate({
      name,
    });
  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  // Account Section

  const accountQuery = useGetAccounts();
  const accountMutation = useCreateAccount();
  const onCreateAccount = (name: string) =>
    accountMutation.mutate({
      name,
    });
  const accountOptions = (accountQuery.data ?? []).map((account) => ({
    label: account.name,
    value: account.id,
  }));

  return {
    categoryQuery,
    categoryMutation,
    onCreateCategory,
    categoryOptions,
    accountQuery,
    accountMutation,
    onCreateAccount,
    accountOptions,
  };
}
