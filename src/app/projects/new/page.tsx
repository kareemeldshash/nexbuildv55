"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "software",
  "mechanical",
  "electrical",
  "civil",
  "ai_ml",
  "robotics",
  "embedded",
  "other",
];

const STATUSES = [
  { value: "idea", label: "Idea" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "looking_for_team", label: "Looking for Team" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("software");
  const [status, setStatus] = useState("idea");
  const [techStack, setTechStack] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [lookingForCollab, setLookingForCollab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    const slug = slugify(title) + "-" + Date.now().toString(36);

    const { data, error: insertError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        title,
        slug,
        short_description: shortDescription,
        description,
        category,
        status,
        tech_stack: techStack
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        repo_url: repoUrl || null,
        demo_url: demoUrl || null,
        looking_for_collab: lookingForCollab,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Log activity
    await supabase.rpc("log_activity", {
      p_user_id: user.id,
      p_action_type: "project_created",
      p_points: 50,
      p_metadata: { project_id: data.id },
    });

    router.push(`/projects/${data.slug}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">New Project</h1>
      <p className="text-muted-foreground mb-8">
        Share your engineering work with the community
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="title"
          label="Project title *"
          placeholder="Smart Irrigation System using IoT"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          id="short"
          label="Short description"
          placeholder="A one-line summary that appears on cards"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          maxLength={160}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-muted-foreground">
            Full description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            placeholder="Describe the problem, your approach, results, and what you learned..."
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-muted-foreground">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " / ")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-muted-foreground">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          id="tech"
          label="Tech stack (comma separated)"
          placeholder="React, Arduino, Python, SolidWorks"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            id="repo"
            label="Repository URL"
            placeholder="https://github.com/..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <Input
            id="demo"
            label="Demo / Live URL"
            placeholder="https://..."
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={lookingForCollab}
            onChange={(e) => setLookingForCollab(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm">Looking for collaborators</span>
        </label>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={loading} className="flex-1">
            Publish Project
          </Button>
          <Link href="/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
