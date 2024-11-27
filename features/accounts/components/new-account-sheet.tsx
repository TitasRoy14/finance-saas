import { useNewAccount } from '@/features/accounts/hooks/use-new-account';
import { AccountForm } from '@/features/accounts/components/accounts-form';
import { FormValues } from '@/features/accounts/entities/Account';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCreateAccount } from '../api/use-create-account';

export const NewAccountSheet = () => {
  const { isOpen, onClose } = useNewAccount();

  const mutation = useCreateAccount();

  const handleSubmit = (values: FormValues) => {
    mutation.mutate(values, {
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
        <AccountForm onSubmit={handleSubmit} disabled={mutation.isPending} />
      </SheetContent>
    </Sheet>
  );
};