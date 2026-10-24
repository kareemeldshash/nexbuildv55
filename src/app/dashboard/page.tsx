"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  FolderKanban,
  Trophy,
  Eye,
  Heart,
  TrendingUp,
  User,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      setProjects(projectsData || []);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your projects, activity score, and climb the ranks.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20">
              <FolderKanban className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
              <Trophy className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {profile?.activity_score?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">Activity Score</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                #{profile?.rank || "—"}
              </p>
              <p className="text-xs text-muted-foreground">Global Rank</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
              <Eye className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {projects.reduce((s, p) => s + (p.views_count || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Your Projects</h2>
          <Link
            href="/projects"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Upload your first engineering project to start building your living
              CV and climbing the ranks.
            </p>
            <Link href="/projects/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create first project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{project.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {project.short_description || project.category}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {project.views_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {project.likes_count || 0}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      project.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : project.status === "in_progress"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {project.status?.replace("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <Link
          href={profile?.username ? `/u/${profile.username}` : "#"}
          className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors flex items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">View public profile</h3>
            <p className="text-sm text-muted-foreground">
              Your living CV that others can see
            </p>
          </div>
        </Link>
        <Link
          href="/leaderboard"
          className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors flex items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold">Leaderboard</h3>
            <p className="text-sm text-muted-foreground">
              See who is most active this week
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
