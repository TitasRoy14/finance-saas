'use client';
import { useUser } from '@clerk/nextjs';

const WelcomeMsg = () => {
  const { user, isLoaded } = useUser();
  return (
    <>
      <div className='space-y-2 mb-4'>
        <h2 className='text-2xl lg:text-4xl font-serif text-white font-medium'>
          Welcome to your Kingdom <span className=''>{user?.firstName}</span> !
        </h2>
        <p className='text-sm lg:text-base font-sans text-slate-400'>
          This is your Financial Overview Report
        </p>
      </div>
    </>
  );
};

export default WelcomeMsg;
