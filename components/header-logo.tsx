import Link from 'next/link';
import Image from 'next/image';

export const HeaderLogo = () => {
  return (
    <Link href='/'>
      <div className='items-center hidden lg:flex'>
        <Image src='/logo.svg' alt='logo' width={28} height={28} />
        <p className='font-semibold font-spaceGrotesk text-white text-2xl ml-2.5'>
          Expensio
        </p>
      </div>
    </Link>
  );
};
