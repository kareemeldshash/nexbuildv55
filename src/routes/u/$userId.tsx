import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile, listByCreator, type Profile, type Project } from "@/lib/projects.functions";
import { ProjectGrid, Shell } from "@/components/shell";

export const Route = createFileRoute("/u/$userId")({ component: CreatorPage });

function CreatorPage() {
  const { userId } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProfile({ data: userId }).then(setProfile).catch(() => setProfile(null));
    listByCreator({ data: userId }).then(setProjects).catch(() => setProjects([]));
  }, [userId]);

  return (
    <Shell>
      <section className="px-5 py-14 sm:px-10">
        <div className="mx-auto max-w-[1320px]">
          {profile === undefined ? (
            <p className="text-mute">Loading…</p>
          ) : profile === null ? (
            <h1 className="text-4xl">Creator not found</h1>
          ) : (
            <>
              <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#e6ecf8] font-display text-5xl font-bold text-blue">
                  {profile.displayName[0]}
                </div>
                <div>
                  <h1 className="text-5xl">{profile.displayName}</h1>
                  <p className="mt-2 text-xl text-mute">{profile.headline}</p>
                  <p className="mt-3 max-w-2xl">{profile.bio}</p>
                  <p className="mt-3 text-sm font-semibold text-blue">
                    {profile.location ? `${profile.location} · ` : ""}
                    {profile.skills}
                  </p>
                </div>
              </div>
              <h2 className="mb-8 text-3xl">Projects by {profile.displayName.split(" ")[0]}</h2>
              <ProjectGrid projects={projects} />
            </>
          )}
        </div>
      </section>
    </Shell>
  );
}
