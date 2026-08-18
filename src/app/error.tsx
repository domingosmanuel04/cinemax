"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[50vh] place-items-center px-4 pt-28 text-center">
      <div>
        <h1 className="font-display text-3xl">ALGO FALHOU</h1>
        <p className="mt-2 text-sm text-cx-muted">{error.message}</p>
        <button onClick={reset} className="mt-6 rounded-full bg-cx-red px-5 py-3">
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
