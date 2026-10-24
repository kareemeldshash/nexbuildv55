import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SignInGate } from "@/lib/auth/gates";
import { createProject } from "@/lib/projects.functions";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/new")({ component: NewProject });

function NewProject() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await createProject({
        data: { title, description, price: Number(price) || 0 },
      });
      await nav({ to: "/" });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not publish.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <SignInGate>
        <main className="mx-auto max-w-[560px] px-6 py-16">
          <h1 className="mb-3 text-5xl">Publish a project</h1>
          <p className="mb-8 text-mute">It stays pending until it is reviewed and listed.</p>
          <form onSubmit={submit} className="space-y-3">
            <input
              required
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-[10px] border-[1.5px] border-line px-4 py-4"
            />
            <textarea
              placeholder="What did you build?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-[10px] border-[1.5px] border-line px-4 py-4"
            />
            <input
              type="number"
              min={0}
              placeholder="Price (0 = free)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-[10px] border-[1.5px] border-line px-4 py-4"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-[10px] bg-blue px-4 py-4 font-semibold text-white disabled:opacity-60"
            >
              Submit for review
            </button>
            {msg ? <p className="text-[#b42318]">{msg}</p> : null}
          </form>
        </main>
      </SignInGate>
    </Shell>
  );
}
