import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { SignInVIew } from '@/modules/auth/ui/views/sign-in-view';

const SignInPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!!session) {
    redirect('/');
  }
  return (
    <div>
      <SignInVIew />
    </div>
  );
};

export default SignInPage;
