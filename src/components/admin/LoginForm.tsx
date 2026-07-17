"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  loginAction,
  type LoginActionState,
} from "@/app/admin/login/actions";

type LoginFormProps = {
  initialMessage?: string;
  nextPath?: string;
};

const initialState: LoginActionState = {
  message: null,
};

export function LoginForm({ initialMessage, nextPath = "/admin" }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, {
    message: initialMessage ?? initialState.message,
  });
  const messageId = state.message ? "login-message" : undefined;

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <input name="next" type="hidden" value={nextPath} />
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-herbal-ink" htmlFor="email">
          Email
        </label>
        <input
          aria-describedby={messageId}
          autoComplete="email"
          className="min-h-12 rounded-md border border-herbal-green/20 bg-white px-4 text-base text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-herbal-ink" htmlFor="password">
          Kata sandi
        </label>
        <input
          aria-describedby={messageId}
          autoComplete="current-password"
          className="min-h-12 rounded-md border border-herbal-green/20 bg-white px-4 text-base text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      {state.message ? (
        <p
          className="rounded-md border border-herbal-brown/20 bg-[#F5E9DF] px-4 py-3 text-sm font-medium text-herbal-brown"
          id="login-message"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-12 items-center justify-center rounded-md bg-herbal-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? "Memeriksa akses..." : "Masuk"}
    </button>
  );
}
