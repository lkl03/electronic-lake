"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login } from "./actions";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await login(password);
      if (!res.ok) setError("Contraseña incorrecta.");
      else router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="password"
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 block w-full border-0 border-b border-ink/25 bg-transparent px-0 py-3 font-mono text-sm text-ink placeholder:text-ink/30 focus:border-moss focus:outline-none focus:ring-0"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-moss hover:text-ink disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar →"}
      </button>
    </form>
  );
}
