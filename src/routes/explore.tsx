import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listApproved, type Project } from "@/lib/projects.functions";
import { ProjectGrid, Shell } from "@/components/shell";

export const Route = createFileRoute("/explore")({ component: Explore });

function Explore() {
  const [list, setList] = useState<Project[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    listApproved()
      .then(setList)
      .catch((e: Error) => {
        setErr(e.message);
        setList([]);
      });
  }, []);

  return (
    <Shell>
      <section className="min-h-[70vh] bg-paper px-5 py-16 sm:px-10">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="mb-3 text-[clamp(2rem,4vw,3.2rem)]">Explore projects</h2>
          <p className="mb-12 text-mute">Projects from every creator on NexBuild.</p>
          {err ? <p className="mb-6 text-[#b42318]">{err}</p> : null}
          {list === null ? <p className="text-mute">Loading…</p> : <ProjectGrid projects={list} />}
        </div>
      </section>
    </Shell>
  );
}
