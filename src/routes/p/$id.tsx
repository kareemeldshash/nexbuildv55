import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProject, type Project } from "@/lib/projects.functions";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/p/$id")({ component: ProjectPage });

function ProjectPage() {
  const { id } = Route.useParams();
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    getProject({ data: id }).then(setProject).catch(() => setProject(null));
  }, [id]);

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-10">
        {project === undefined ? (
          <p className="text-mute">Loading…</p>
        ) : project === null ? (
          <h1 className="text-4xl">Project not found</h1>
        ) : (
          <>
            <div className="mb-8 flex h-56 items-center justify-center rounded-[14px] bg-[#e6ecf8] font-display text-8xl font-bold text-blue">
              {project.title[0]}
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue">
              {project.price > 0 ? `$${project.price}` : "Free"}
            </p>
            <h1 className="mt-2 text-5xl">{project.title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-mute">{project.description}</p>
            <Link
              to="/u/$userId"
              params={{ userId: project.userId }}
              className="mt-8 inline-flex items-center gap-3 rounded-[14px] border border-line px-4 py-3 hover:border-blue"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6ecf8] font-bold text-blue">
                {project.creatorName[0]}
              </span>
              <span>
                <span className="block text-sm text-mute">Creator</span>
                <span className="font-semibold">{project.creatorName}</span>
              </span>
            </Link>
          </>
        )}
      </section>
    </Shell>
  );
}
