import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignInGate } from "@/lib/auth/gates";
import { myProfile, saveProfile } from "@/lib/projects.functions";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/profile")({ component: EditProfile });

function EditProfile() {
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [userId, setUserId] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    myProfile()
      .then((p) => {
        setUserId(p.userId);
        setDisplayName(p.displayName);
        setHeadline(p.headline);
        setBio(p.bio);
        setLocation(p.location);
        setSkills(p.skills);
      })
      .catch(() => setMsg("Sign in to edit your profile."));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await saveProfile({ data: { displayName, headline, bio, location, skills } });
      setMsg("Saved. Your public profile is updated.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <SignInGate>
        <main className="mx-auto max-w-[560px] px-6 py-16">
          <h1 className="mb-3 text-5xl">Your profile</h1>
          <p className="mb-8 text-mute">This is the page other people see with your projects.</p>
          <form onSubmit={submit} className="space-y-3">
            <input required placeholder="Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-[10px] border-[1.5px] border-line px-4 py-4" />
            <input placeholder="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full rounded-[10px] border-[1.5px] border-line px-4 py-4" />
            <textarea placeholder="Short bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full rounded-[10px] border-[1.5px] border-line px-4 py-4" />
            <input placeholder="City" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-[10px] border-[1.5px] border-line px-4 py-4" />
            <input placeholder="Skills, separated by commas" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full rounded-[10px] border-[1.5px] border-line px-4 py-4" />
            <button type="submit" disabled={busy} className="w-full rounded-[10px] bg-blue px-4 py-4 font-semibold text-white disabled:opacity-60">
              Save profile
            </button>
          </form>
          {msg ? <p className="mt-4 text-mute">{msg}</p> : null}
          {userId ? (
            <Link to="/u/$userId" params={{ userId }} className="mt-6 inline-block text-blue">
              View public profile
            </Link>
          ) : null}
        </main>
      </SignInGate>
    </Shell>
  );
}
