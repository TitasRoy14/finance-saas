'use client';
import { z } from 'zod';
import { Loader2, OctagonAlertIcon, KeyRound, CheckCircle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { redirect, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa6';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';

const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email(),
    password: z.string().min(1, { message: 'Password is required' }),
    confirmPassword: z.string().min(1, { message: 'Password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: `Passwords don't match`,
    path: ['confirmPassword'],
  });

export const SignUpView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [passkeyPending, setPasskeyPending] = useState(false);
  const [passkeyRegistered, setPasskeyRegistered] = useState(false);
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          setPending(false);
          // Show passkey registration prompt after successful signup
          setShowPasskeyPrompt(true);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      }
    );
  };

  const onSocial = (provider: 'google' | 'github') => {
    setError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: '/',
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      }
    );
  };

  const registerPasskey = async () => {
    setError(null);
    setPasskeyPending(true);

    await authClient.passkey.addPasskey({
      fetchOptions: {
        onSuccess: () => {
          setPasskeyPending(false);
          setPasskeyRegistered(true);
          router.push('/');
        },
        onError: ({ error }) => {
          setPasskeyPending(false);
          setError(error.message);
        },
      },
    });
  };

  const skipPasskey = () => {
    redirect('/');
  };

  // Show passkey registration prompt after signup
  if (showPasskeyPrompt) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-6 items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>

              <section className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Secure Your Account</h1>
                <p className="text-muted-foreground text-balance">
                  Add a passkey for faster, more secure sign-ins using your
                  fingerprint, face, or device PIN
                </p>
              </section>

              {passkeyRegistered && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">
                    Passkey registered successfully! Redirecting...
                  </AlertTitle>
                </Alert>
              )}

              {!!error && (
                <Alert className="bg-destructive/10 border-none">
                  <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}

              <div className="flex flex-col gap-3 w-full max-w-sm">
                <Button
                  onClick={registerPasskey}
                  disabled={passkeyPending || passkeyRegistered}
                  className="w-full"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Register Passkey
                  {passkeyPending && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </Button>

                <Button
                  onClick={skipPasskey}
                  variant="outline"
                  disabled={passkeyPending || passkeyRegistered}
                  className="w-full"
                >
                  Skip for now
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-balance">
                You can add a passkey later from your account settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <section className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Let's get started</h1>
                  <p className="text-muted-foreground text-balance">
                    Create your account
                  </p>
                </section>
                <section className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="John Doe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}
                <Button disabled={pending} type="submit" className="w-full">
                  Sign up {pending && <Loader2 className="animate-spin" />}
                </Button>
                <section className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </section>
                <section className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => onSocial('google')}
                    type="button"
                    className="w-full"
                    disabled={pending}
                  >
                    <FaGoogle />
                  </Button>
                  <Button
                    onClick={() => onSocial('github')}
                    variant="outline"
                    type="button"
                    className="w-full"
                    disabled={pending}
                  >
                    <FaGithub />
                  </Button>
                </section>
                <section className="text-center text-sm">
                  Already have an account?{' '}
                  <Link
                    href="/sign-in"
                    className="underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </section>
              </div>
            </form>
          </Form>
          <div className="bg-radial from-[#270840] to-[#230e3a] hidden md:flex flex-col gap-y-4 items-center justify-center">
            <img src="./logo.svg" alt="image" className="h-[92px] w-[92px]" />
            <p className="text-2xl font-semibold text-white">Expensio</p>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>
      </div>
    </div>
  );
};
