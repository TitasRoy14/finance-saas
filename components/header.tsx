import { HeaderLogo } from './header-logo';
import { Navigation } from './navigation';
import WelcomeMsg from './welcome-msg';
import { Filters } from './filters';
import { DashboardUserButton } from './dashboard-user-button';

export const Header = () => {
  //#8B0000 #2F4F4F #261147
  // bg-[#870b21] bg-linear-to-tr from-[#870b21] via-[#270840] to-[#230e3a]
  //bg-gradient-to-tr from-rose-700 via-rose-800 to-rose-900
  return (
    <header className="bg-[#261147] px-4 py-8 lg:px-14 pb-36">
      <div className="max-w-(--breakpoint-2xl) mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="flex item-center lg:gap-x-16">
            <HeaderLogo />
            <Navigation />
          </div>
          <DashboardUserButton />
        </div>
        <WelcomeMsg />
        <Filters />
      </div>
    </header>
  );
};
