'use client';
import { z } from 'zod';
import { Loader2, OctagonAlertIcon, KeyRound } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { redirect, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const SignInVIew = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [passkeyPending, setPasskeyPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Preload passkeys for conditional UI (autofill)
  useEffect(() => {
    // Check if browser supports conditional mediation
    if (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential &&
      PublicKeyCredential.isConditionalMediationAvailable
    ) {
      PublicKeyCredential.isConditionalMediationAvailable().then(
        (available) => {
          if (available) {
            // Preload passkeys for autofill
            authClient.signIn.passkey({ autoFill: true }).catch(() => {
              // Ignore errors for autofill preloading
            });
          }
        }
      );
    }
  }, []);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          setPending(false);
          redirect('/');
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

  const onPasskeySignIn = async () => {
    setError(null);
    setPasskeyPending(true);

    await authClient.signIn.passkey({
      fetchOptions: {
        onSuccess: () => {
          setPasskeyPending(false);
          router.push('/');
        },
        onError: ({ error }) => {
          setPasskeyPending(false);
          setError(error.message);
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <section className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome Back</h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your account
                  </p>
                </section>

                {/* Passkey Sign In Button */}
                <Button
                  onClick={onPasskeySignIn}
                  disabled={passkeyPending || pending}
                  variant="outline"
                  type="button"
                  className="w-full"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Sign in with Passkey
                  {passkeyPending && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </Button>

                <section className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or sign in with email
                  </span>
                </section>

                <section className="grid gap-3">
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
                            autoComplete="username webauthn"
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
                            autoComplete="current-password webauthn"
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
                <Button
                  disabled={pending || passkeyPending}
                  type="submit"
                  className="w-full"
                >
                  Sign in {pending && <Loader2 className="animate-spin" />}
                </Button>
                <section className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </section>
                <section className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => onSocial('google')}
                    variant="outline"
                    type="button"
                    className="w-full"
                    disabled={pending || passkeyPending}
                  >
                    <FaGoogle />
                  </Button>
                  <Button
                    onClick={() => onSocial('github')}
                    variant="outline"
                    type="button"
                    className="w-full"
                    disabled={pending || passkeyPending}
                  >
                    <FaGithub />
                  </Button>
                </section>
                <section className="text-center text-sm">
                  Don't have an account?{' '}
                  <Link
                    href="/sign-up"
                    className="underline underline-offset-4"
                  >
                    Sign up
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
