'use client';
import { UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div>
      <UserButton />
      <p>this is an authinticated route</p>
    </div>
  );
}
