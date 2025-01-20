'use client';
import { Button } from '@/components/ui/button';
import { useDeleteConnectedBank } from '../api/use-delete-connected-bank';
import { useConfirm } from '@/hooks/use-confirm-model';
export const PlaidDisconnect = () => {
  const [Dialog,confirm] = useConfirm(
    'Are you sure?',
    'This will disconnect your bank account, and remove all associated data'
  );
  const deleteConnectedBank  = useDeleteConnectedBank();
  
  const onClick = async() => {
    const ok = await confirm();
    if(ok){
    deleteConnectedBank.mutate()
    }
  }
    
 return (
    <>
    <Dialog/>
    <Button onClick={onClick} disabled={deleteConnectedBank.isPending} size='sm' variant='emerald'>
      Disconnect
    </Button>
    </>
  );
};
