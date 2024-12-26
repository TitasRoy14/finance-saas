import { useNewTransaction } from '@/features/transactions/hooks/use-new-transaction';
import { FormValues } from '@/features/transactions/entities/Transaction';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCreatTranasaction } from '@/features/transactions/api/use-create-transaction';
import { TransactionForm } from './transaction-form';
import { Loader2 } from 'lucide-react';
import useTransactionDefaultValue from '../entities/transaction-default-value';

export const NewTransactionSheet = () => {
  const {
    categoryQuery,
    accountQuery,
    categoryOptions,
    onCreateCategory,
    accountOptions,
    onCreateAccount,
    categoryMutation,
    accountMutation,
  } = useTransactionDefaultValue();
  const { isOpen, onClose } = useNewTransaction();
  const createMutation = useCreatTranasaction();

  const isPending =
    createMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending;

  const isLoading = categoryQuery.isLoading || accountQuery.isLoading;

  const handleSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='space-y-4'>
        <SheetHeader>
          <SheetTitle>New Account</SheetTitle>
          <SheetDescription>
            Create a new account to start your transaction
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className='absolute inset-0 flex items-center justify-center'>
            <Loader2 className='size-4 text-muted-foreground animate-spin' />
          </div>
        ) : (
          <TransactionForm
            onSubmit={handleSubmit}
            disabled={isPending}
            categoryOptions={categoryOptions}
            onCreateCategory={onCreateCategory}
            accountOptions={accountOptions}
            onCreateAccount={onCreateAccount}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
