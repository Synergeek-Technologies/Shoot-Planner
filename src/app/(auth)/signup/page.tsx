'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signUpAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} className="w-full">{pending ? 'Creating…' : 'Create account'}</Button>;
}

export default function SignupPage() {
  const [state, action] = useActionState(signUpAction, { error: '' });
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <form action={action} className="flex flex-col gap-4">
        <div><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" required /></div>
        <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
        <div><Label htmlFor="password">Password (8+ chars)</Label><Input id="password" name="password" type="password" required minLength={8} /></div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
      </form>
      <p className="text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="underline">Sign in</Link>
      </p>
    </main>
  );
}
