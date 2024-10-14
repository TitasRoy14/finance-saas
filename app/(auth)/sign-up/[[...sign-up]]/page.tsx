import { Loader2 } from 'lucide-react';
import { SignUp, ClerkLoading, ClerkLoaded } from '@clerk/nextjs';
import Image from 'next/image';

const SignInPage = () => {
  return (
    <div className='min-h-screen grid grid-cols-1 lg:grid-cols-2'>
      <div className='h-full  lg:flex flex-col items-center justify-center px-4'>
        <div className='text-center space-y-4 pt-16'>
          <h1 className='font-bold text-3xl text-[#2e2A47]'>Welcome Back !</h1>
          <p className='text-base text-[#7E8CA0]'>
            Log in or create an account to get back to your dashboard
          </p>
        </div>
        <div className='flex items-center justify-center mt-8'>
          <ClerkLoaded>
            <SignUp />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className='animate-spin text-muted-foreground' />
          </ClerkLoading>
        </div>
      </div>
      <div className='h-full  bg-blue-950  hidden lg:flex flex-col items-center space-y-4 justify-center'>
        <Image src='/logo.svg' height={160} width={160} alt='logo' />
        <p className='text-white font-spaceGrotesk font-bold text-3xl'>
          Expensio
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
