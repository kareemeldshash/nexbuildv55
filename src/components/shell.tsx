import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import type { Profile, Project } from "@/lib/projects.functions";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1320px] items-center justify-between px-5 sm:px-10">
          <Link to="/" className="logo text-[1.7rem] font-bold text-blue">
            NexBuild
          </Link>
          <nav className="flex items-center gap-3 text-[15px] font-medium sm:gap-8">
            <Link to="/" className="hover:text-blue">
              My projects
            </Link>
            <Link to="/explore" className="hover:text-blue">
              Explore
            </Link>
            <Link to="/creators" className="hover:text-blue">
              Creators
            </Link>
            <SignedIn>
              <Link to="/profile" className="hidden hover:text-blue sm:inline">
                Profile
              </Link>
              <Link to="/new" className="hidden rounded-lg bg-blue px-4 py-2 text-sm font-semibold text-white sm:inline-block">
                Publish
              </Link>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link
                to="/login"
                className="rounded-lg bg-blue px-4 py-2 text-sm font-semibold text-white"
              >
                Sign in
              </Link>
            </SignedOut>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-line px-5 py-10 text-[0.95rem] text-mute sm:px-10">
        <div className="mx-auto max-w-[1320px]">
          © NexBuild. Every project is reviewed before it is listed.
        </div>
      </footer>
    </div>
  );
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return <p className="text-mute">No projects yet.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((p) => (
        <article key={p.id} className="overflow-hidden rounded-[14px] border border-line bg-white">
          <Link to="/p/$id" params={{ id: p.id }} className="block">
            <div className="flex h-[200px] items-center justify-center bg-[#e6ecf8] font-display text-6xl font-bold text-blue">
              {(p.title || "?")[0]}
            </div>
          </Link>
          <div className="p-6">
            <Link to="/p/$id" params={{ id: p.id }}>
              <h3 className="mb-2 text-2xl hover:text-blue">{p.title}</h3>
            </Link>
            <p className="text-base text-mute">{p.description}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="font-bold text-blue">{p.price > 0 ? `$${p.price}` : "Free"}</span>
              {p.status === "pending" ? (
                <span className="text-sm text-mute">Waiting for review</span>
              ) : (
                <Link to="/u/$userId" params={{ userId: p.userId }} className="text-sm font-medium hover:text-blue">
                  {p.creatorName}
                </Link>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CreatorGrid({ creators }: { creators: Profile[] }) {
  if (!creators.length) return <p className="text-mute">No creators yet.</p>;
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {creators.map((c) => (
        <Link
          key={c.userId}
          to="/u/$userId"
          params={{ userId: c.userId }}
          className="rounded-[14px] border border-line bg-white p-6 hover:border-blue"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6ecf8] font-display text-2xl font-bold text-blue">
            {c.displayName[0]}
          </div>
          <h3 className="text-xl">{c.displayName}</h3>
          <p className="mt-1 text-sm text-mute">{c.headline}</p>
          <p className="mt-3 text-sm font-semibold text-blue">
            {c.projectCount} project{c.projectCount === 1 ? "" : "s"}
            {c.location ? ` · ${c.location}` : ""}
          </p>
        </Link>
      ))}
    </div>
  );
}
