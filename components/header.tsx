import { UserButton, ClerkLoading, ClerkLoaded } from '@clerk/nextjs';
import { HeaderLogo } from './header-logo';
import { Navigation } from './navigation';
import { Loader2 } from 'lucide-react';
import WelcomeMsg from './welcome-msg';

export const Header = () => {
  return (
    <header className=' bg-[#870b21] bg-gradient-to-tr from-[#870b21] via-[#270840] to-[#230e3a] px-4 py-8 lg:px-14 pb-36'>
      <div className='max-w-screen-2xl mx-auto'>
        <div className='w-full flex items-center justify-between mb-14'>
          <div className='flex item-center lg:gap-x-16'>
            <HeaderLogo />
            <Navigation />
          </div>
          <ClerkLoaded>
            <UserButton />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className='size-8 animate-spin text-slate-400' />
          </ClerkLoading>
        </div>
        <WelcomeMsg />
      </div>
    </header>
  );
};
