"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="Password"
        aria-label="Password"
        className="rounded-lg border border-border bg-white px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--accent)] px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {state?.error && (
        <p className="text-sm text-red-600" role="status">
          {state.error}
        </p>
      )}
    </form>
  );
}
