"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Eye,
  Heart,
  ExternalLink,
  Github,
  Code2,
  User,
} from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("projects")
        .select(
          `
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url,
            activity_score,
            headline
          )
        `
        )
        .eq("slug", slug)
        .single();

      if (data) {
        setProject(data);
        supabase
          .from("projects")
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq("id", data.id)
          .then();
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <h1 className="text-2xl font-bold mb-2">Project not found</h1>
        <Link href="/projects">
          <Button variant="outline">Browse projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <div className="aspect-video rounded-2xl overflow-hidden bg-muted mb-8 border border-border">
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            <Code2 className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
              {project.category?.replace("_", " ")}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                project.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : project.status === "looking_for_team"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-cyan-500/20 text-cyan-400"
              }`}
            >
              {project.status?.replace("_", " ")}
            </span>
          </div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            {project.views_count || 0}
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            {project.likes_count || 0}
          </span>
        </div>
      </div>

      <Link
        href={`/u/${project.profiles?.username}`}
        className="flex items-center gap-3 mb-8 p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
      >
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-lg font-bold text-black">
          {project.profiles?.username?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <div className="font-semibold">
            {project.profiles?.full_name || project.profiles?.username}
          </div>
          <div className="text-sm text-muted-foreground">
            @{project.profiles?.username}
            {project.profiles?.headline ? ` · ${project.profiles.headline}` : ""}
          </div>
        </div>
      </Link>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">About this project</h2>
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {project.description || project.short_description || "No description provided."}
        </p>
      </div>

      {project.tech_stack?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Tech stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.tech_stack.map((tech: string) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-lg text-sm bg-muted border border-border"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {project.repo_url && (
          <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <Github className="h-4 w-4" />
              Repository
            </Button>
          </a>
        )}
        {project.demo_url && (
          <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
            <Button className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </Button>
          </a>
        )}
        {project.looking_for_collab && (
          <Button variant="secondary" className="gap-2">
            <User className="h-4 w-4" />
            Request to Collaborate
          </Button>
        )}
      </div>
    </div>
  );
}
