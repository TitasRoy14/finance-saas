import { useNewCategory } from '@/features/categories/hooks/use-new-category';
import { CategoriesForm } from '@/features/categories/components/categories-form';
import { FormValues } from '@/features/categories/entities/Category';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCreateCategories } from '../api/use-create-category';

export const NewCategoriesSheet = () => {
  const { isOpen, onClose } = useNewCategory();

  const mutation = useCreateCategories();

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
          <SheetTitle>New Category</SheetTitle>
          <SheetDescription>
            Create a new category to start your transaction
          </SheetDescription>
        </SheetHeader>
        <CategoriesForm onSubmit={handleSubmit} disabled={mutation.isPending} />
      </SheetContent>
    </Sheet>
  );
};
