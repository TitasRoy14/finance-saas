import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useEditCategory } from '@/features/categories/api/use-edit-category';
import { useDeleteCategory } from '@/features/categories/api/use-delete-category';
import { useGetCategory } from '@/features/categories/api/use-get-category';
import { CategoriesForm } from '@/features/categories/components/categories-form';
import { FormValues } from '@/features/categories/entities/Category';
import { useOpenCategory } from '@/features/categories/hooks/use-open-category';

import { Loader2 } from 'lucide-react';
import { useConfirm } from '@/hooks/use-confirm-model';

export const EditCategoriesSheet = () => {
  const { isOpen, onClose, id } = useOpenCategory();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this category.'
  );

  const categoryQuery = useGetCategory(id);

  const editMutation = useEditCategory(id);

  const deleteMutation = useDeleteCategory(id!);

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

  const isPending = categoryQuery.isPending || deleteMutation.isPending;

  const isLoading = categoryQuery.isLoading;

  const handleSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const defaultValues = categoryQuery.data
    ? {
        name: categoryQuery.data.name,
      }
    : {
        name: '',
      };
  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className='space-y-4'>
          <SheetHeader>
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>Edit an existing category</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Loader2 className='size-4 text-muted-foreground animate-spin' />
            </div>
          ) : (
            <CategoriesForm
              id={id}
              onSubmit={handleSubmit}
              defaultValues={defaultValues}
              disabled={isPending}
              onDelete={onDelete}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
