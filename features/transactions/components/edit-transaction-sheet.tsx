import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useEditTransaction } from '@/features/transactions/api/use-edit-transaction';
import { useDeleteTransaction } from '@/features/transactions/api/use-delete-transaction';
import { useGetTransaction } from '@/features/transactions/api/use-get-transaction';
import { TransactionForm } from '@/features/transactions/components/transaction-form';
import { FormValues } from '@/features/transactions/entities/Transaction';
import { useOpenTransaction } from '@/features/transactions/hooks/use-open-transaction';

import useTransactionDefaultValue from '@/features/transactions/entities/transaction-default-value';

import { Loader2 } from 'lucide-react';
import { useConfirm } from '@/hooks/use-confirm-model';
import { memo } from 'react';

export const EditTransactionSheet = () => {
  const {
    categoryQuery,
    accountQuery,
    categoryOptions,
    onCreateCategory,
    accountOptions,
    onCreateAccount,
  } = useTransactionDefaultValue();
  const { isOpen, onClose, id } = useOpenTransaction();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this transaction.'
  );

  const transactionQuery = useGetTransaction(id);
  const editMutation = useEditTransaction(id);
  const deleteMutation = useDeleteTransaction(id!);

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const isPending =
    transactionQuery.isPending ||
    deleteMutation.isPending ||
    categoryQuery.isPending ||
    accountQuery.isPending;

  const isLoading =
    transactionQuery.isLoading ||
    accountQuery.isLoading ||
    categoryQuery.isLoading;

  const handleSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const defaultValues = transactionQuery.data
    ? {
        accountId: transactionQuery.data.accountId,
        categoryId: transactionQuery.data.categoryId,
        amount: transactionQuery.data.amount.toString(),
        date: transactionQuery.data.date
          ? new Date(transactionQuery.data.date)
          : new Date(),
        payee: transactionQuery.data.payee,
        notes: transactionQuery.data.notes,
      }
    : {
        accountId: '',
        categoryId: '',
        amount: '',
        date: new Date(),
        payee: '',
        notes: '',
      };

  //   const TransactionForm =  <TransactionForm
  //   id={id}
  //   defaultValues={defaultValues}
  //   onSubmit={handleSubmit}
  //   onDelete={onDelete}
  //   disabled={isPending}
  //   categoryOptions={categoryOptions}
  //   onCreateCategory={onCreateCategory}
  //   accountOptions={accountOptions}
  //   onCreateAccount={onCreateAccount}
  // />
  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className='space-y-4'>
          <SheetHeader>
            <SheetTitle>Edit Transaction</SheetTitle>
            <SheetDescription>Edit an existing transaction</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Loader2 className='size-4 text-muted-foreground animate-spin' />
            </div>
          ) : (
            <TransactionForm
              id={id}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              onDelete={onDelete}
              disabled={isPending}
              categoryOptions={categoryOptions}
              onCreateCategory={onCreateCategory}
              accountOptions={accountOptions}
              onCreateAccount={onCreateAccount}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
