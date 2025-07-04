'use client';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBulkDeleteTransactions } from '@/features/transactions/api/use-bulk-delete-transactions';
import { useGetTransactions } from '@/features/transactions/api/use-get-transactions';
import { useNewTransaction } from '@/features/transactions/hooks/use-new-transaction';
import { useSelectAccount } from '@/features/accounts/hooks/use-select-account';
import { Loader2, Plus } from 'lucide-react';
import { columns } from './columns';
import { Suspense, useState } from 'react';
import { UploadButton } from './upload-button';
import { ImportCard } from './import-card';
import { transactions as transactionSchema } from '@/database/schema';
import { toast } from 'sonner';
import { useBulkCreateTransactions } from '@/features/transactions/api/use-bulk-create-transactions';

enum VARIANTS {
  LIST = 'LIST',
  IMPORT = 'IMPORT',
}

const INITIAL_IMPORT_RESULT = {
  data: [],
  error: [],
  meta: {},
};

// Loading component for the main page
const TransactionPageSkeleton = () => (
  <div className="max-w-(--breakpoint-2xl) mx-auto w-full pb-10 -mt-24">
    <Card className="border-none drop-shadow-lg">
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full flex items-center justify-center">
          <Loader2 className="size-6 text-slate-300 animate-spin" />
        </div>
      </CardContent>
    </Card>
  </div>
);

// Main transaction component logic
const TransactionPageContent = () => {
  const [AccountDialog, confirm] = useSelectAccount();
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULT);

  const onUpload = (results: typeof INITIAL_IMPORT_RESULT) => {
    console.log(results);
    setImportResults(results);
    setVariant(VARIANTS.IMPORT);
  };

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULT);
    setVariant(VARIANTS.LIST);
  };

  const newTransaction = useNewTransaction();
  const createTransactions = useBulkCreateTransactions();
  const bulkDeleteTransactions = useBulkDeleteTransactions();
  const transactionsQuery = useGetTransactions();
  const transactions = transactionsQuery.data || [];

  const isDisabled =
    transactionsQuery.isLoading || bulkDeleteTransactions.isPending;

  const onSubmitImport = async (
    values: (typeof transactionSchema.$inferInsert)[]
  ) => {
    const accountId = await confirm();

    if (!accountId) return toast.error('Please select an account to continue');

    const data = values.map((value) => ({
      ...value,
      accountId: accountId as string,
    }));

    createTransactions.mutate(data, {
      onSuccess: () => {
        onCancelImport();
      },
    });
  };

  if (transactionsQuery.isLoading) {
    return <TransactionPageSkeleton />;
  }

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <AccountDialog />
        <ImportCard
          data={importResults.data}
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
        />
      </>
    );
  }

  const TransactionButton = (
    <Button
      size="sm"
      onClick={newTransaction.onOpen}
      className="w-full lg:w-auto"
    >
      <Plus className="size-4 mr-2" />
      Add new
    </Button>
  );

  const uploadButton = <UploadButton onUpload={onUpload} />;

  return (
    <>
      <AccountDialog />
      <div className="max-w-(--breakpoint-2xl) mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-lg">
          <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-xl line-clamp-1">
              Transaction History
            </CardTitle>

            <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
              {TransactionButton}
              {uploadButton}
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <DataTable
                columns={columns}
                data={transactions}
                filterKey="payee"
                onDelete={(row) => {
                  const ids = row.map((r) => r.original.id);
                  bulkDeleteTransactions.mutate({ ids });
                }}
                disabled={isDisabled}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// Main component with Suspense boundary
const TransactionPage = () => {
  return (
    <Suspense fallback={<TransactionPageSkeleton />}>
      <TransactionPageContent />
    </Suspense>
  );
};

export default TransactionPage;
