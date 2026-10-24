import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listCreators, type Profile } from "@/lib/projects.functions";
import { CreatorGrid, Shell } from "@/components/shell";

export const Route = createFileRoute("/creators")({ component: Creators });

function Creators() {
  const [list, setList] = useState<Profile[] | null>(null);
  useEffect(() => {
    listCreators().then(setList).catch(() => setList([]));
  }, []);
  return (
    <Shell>
      <section className="min-h-[70vh] bg-paper px-5 py-16 sm:px-10">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="mb-3 text-[clamp(2rem,4vw,3.2rem)]">Creators</h2>
          <p className="mb-12 text-mute">Each profile is a living page of that person’s engineering work.</p>
          {list === null ? <p className="text-mute">Loading…</p> : <CreatorGrid creators={list} />}
        </div>
      </section>
    </Shell>
  );
}
