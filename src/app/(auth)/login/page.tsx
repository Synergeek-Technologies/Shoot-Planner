'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signInAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} className="w-full">{pending ? 'Signing in…' : 'Sign in'}</Button>;
}

export default function LoginPage() {
  const [state, action] = useActionState(signInAction, { error: '' });
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sign in to Shoot Planner</h1>
      <form action={action} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
      </form>
      <p className="text-sm text-muted-foreground">
        No account yet? <Link href="/signup" className="underline">Sign up</Link>
      </p>
    </main>
  );
}
