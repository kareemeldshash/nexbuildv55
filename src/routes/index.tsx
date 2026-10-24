import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { listCreators, listMine, type Profile, type Project } from "@/lib/projects.functions";
import { CreatorGrid, ProjectGrid, Shell } from "@/components/shell";

export const Route = createFileRoute("/")({ component: Home });

const samples: Project[] = [
  { id: "seed-arm", userId: "seed-layla", creatorName: "Layla Hassan", title: "Robotic arm", description: "Original design built from scratch, with full part files.", price: 0, status: "approved" },
  { id: "seed-sesame", userId: "seed-layla", creatorName: "Layla Hassan", title: "Sesame robot", description: "Hardware and firmware build.", price: 0, status: "approved" },
  { id: "seed-line", userId: "seed-omar", creatorName: "Omar Farid", title: "Line follower", description: "Self-driving LEGO SPIKE robot with two color sensors.", price: 0, status: "approved" },
  { id: "seed-loader", userId: "seed-nour", creatorName: "Nour Adel", title: "Wheel loader", description: "LEGO SPIKE pushing and scooping robot.", price: 0, status: "approved" },
];

function Home() {
  const [mine, setMine] = useState<Project[] | null>(null);
  const [creators, setCreators] = useState<Profile[]>([]);

  useEffect(() => {
    listMine().then(setMine).catch(() => setMine([]));
    listCreators().then(setCreators).catch(() => setCreators([]));
  }, []);

  return (
    <Shell>
      <section className="mx-auto max-w-[1320px] px-5 py-16 sm:px-10 sm:py-28">
        <h1 className="max-w-[12ch] text-[clamp(3rem,8vw,6.5rem)]">
          Build it. Share it. Sell it.
        </h1>
        <p className="mt-7 max-w-[44ch] text-xl text-mute sm:text-[1.35rem]">
          Full engineering projects with files and assembly guides, from robotic arms to firmware.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/explore" className="rounded-[10px] bg-blue px-8 py-4 font-semibold text-white">
            Explore projects
          </Link>
          <Link to="/creators" className="rounded-[10px] border-[1.5px] border-line bg-white px-8 py-4 font-semibold">
            Meet creators
          </Link>
        </div>
      </section>
      <section className="bg-paper px-5 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="mb-3 text-[clamp(2rem,4vw,3.2rem)]">Creators</h2>
          <p className="mb-12 text-mute">People behind the builds. Open a profile to see only their projects.</p>
          <CreatorGrid creators={creators} />
        </div>
      </section>
      <section className="px-5 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="mb-3 text-[clamp(2rem,4vw,3.2rem)]">My projects</h2>
          <SignedOut>
            <p className="mb-12 text-mute">Sign in to publish your own. These are examples from the creators above.</p>
            <ProjectGrid projects={samples} />
          </SignedOut>
          <SignedIn>
            <p className="mb-12 text-mute">Yours only. New listings stay pending until reviewed.</p>
            {mine === null ? <p className="text-mute">Loading…</p> : <ProjectGrid projects={mine} />}
          </SignedIn>
        </div>
      </section>
    </Shell>
  );
}
