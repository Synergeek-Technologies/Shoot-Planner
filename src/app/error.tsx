'use client';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="rounded bg-foreground px-3 py-1.5 text-sm text-background">Reload</button>
    </main>
  );
}
