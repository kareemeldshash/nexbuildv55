import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function emailAuth(up: boolean) {
    setBusy(true);
    setMsg("");
    try {
      const res = up
        ? await authClient.signUp.email({ email, password, name: email.split("@")[0] || "Builder" })
        : await authClient.signIn.email({ email, password });
      if (res.error) {
        setMsg(res.error.message || "Could not sign in.");
        return;
      }
      if (up) setMsg("Account created. You can sign in now.");
      else await nav({ to: "/" });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <main className="mx-auto max-w-[480px] px-6 py-20">
        <h1 className="mb-7 text-5xl">Sign in</h1>
        {!authEnabled ? (
          <p className="text-mute">Sign-in is disabled.</p>
        ) : (
          <>
            <div className="space-y-3">
              {GROK_PROVIDERS.map((p) => (
                <button
                  key={p.providerId}
                  type="button"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                  className="w-full rounded-[10px] border-[1.5px] border-line bg-white px-4 py-4 font-semibold"
                >
                  Continue with {p.label}
                </button>
              ))}
            </div>
            <p className="my-6 text-center text-mute">or use email</p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-3 w-full rounded-[10px] border-[1.5px] border-line px-4 py-4"
            />
            <input
              type="password"
              placeholder="Password (6+ characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-3 w-full rounded-[10px] border-[1.5px] border-line px-4 py-4"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => emailAuth(false)}
              className="w-full rounded-[10px] bg-blue px-4 py-4 font-semibold text-white disabled:opacity-60"
            >
              Sign in
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => emailAuth(true)}
              className="mt-4 text-blue"
            >
              Create account instead
            </button>
            {msg ? <p className="mt-4 text-[#b42318]">{msg}</p> : null}
          </>
        )}
      </main>
    </Shell>
  );
}
