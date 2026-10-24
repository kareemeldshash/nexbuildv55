"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  Link as LinkIcon,
  Github,
  Linkedin,
  Trophy,
  FolderKanban,
  Eye,
  Heart,
  Code2,
} from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", profileData.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      setProjects(projectsData || []);
      setLoading(false);
    };

    load();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
        <p className="text-muted-foreground mb-6">
          This username doesn&apos;t exist yet.
        </p>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile header */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden mb-8">
        <div className="h-32 sm:h-40 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-emerald-500/30" />
        <div className="px-6 pb-6 -mt-12 sm:-mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-4 border-card bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-3xl sm:text-4xl font-bold text-black shadow-xl">
              {profile.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 pt-2 sm:pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {profile.full_name || profile.username}
                </h1>
                {profile.is_verified && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">@{profile.username}</p>
              {profile.headline && (
                <p className="mt-1 text-sm">{profile.headline}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-muted/50">
                <div className="text-xl font-bold text-primary">
                  {profile.activity_score?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              {profile.rank && (
                <div className="text-center px-4 py-2 rounded-xl bg-muted/50">
                  <div className="text-xl font-bold text-amber-400">
                    #{profile.rank}
                  </div>
                  <div className="text-xs text-muted-foreground">Rank</div>
                </div>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl">
              {profile.bio}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary"
              >
                <LinkIcon className="h-4 w-4" />
                Website
              </a>
            )}
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            )}
          </div>

          {profile.skills?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <FolderKanban className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            Projects ({projects.length})
          </h2>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Code2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No public projects yet</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="rounded-2xl border border-border bg-card p-5 card-hover"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold line-clamp-1">{project.title}</h3>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                      project.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-cyan-500/20 text-cyan-400"
                    }`}
                  >
                    {project.status?.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {project.short_description}
                </p>
                {project.tech_stack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tech_stack.slice(0, 5).map((t: string) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {project.views_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {project.likes_count || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
