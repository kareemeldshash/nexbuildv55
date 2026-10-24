"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Medal, Award, Flame } from "lucide-react";

export default function LeaderboardPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, activity_score, headline, skills")
        .order("activity_score", { ascending: false })
        .limit(50);

      setProfiles(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-amber-400" />;
    if (index === 1) return <Medal className="h-5 w-5 text-slate-300" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-700" />;
    return (
      <span className="text-sm font-medium text-muted-foreground w-5 text-center">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
          <Trophy className="h-7 w-7 text-black" />
        </div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          Most active engineers based on real activity score
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">
            Loading rankings...
          </div>
        ) : profiles.length === 0 ? (
          <div className="p-12 text-center">
            <Flame className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No activity yet. Be the first to climb the ranks!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {profiles.map((profile, index) => (
              <Link
                key={profile.id}
                href={`/u/${profile.username}`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors ${
                  index < 3 ? "bg-gradient-to-r from-amber-500/5 to-transparent" : ""
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index)}
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-black font-bold text-sm shrink-0">
                  {profile.username?.[0]?.toUpperCase() || "?"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">
                      {profile.full_name || profile.username}
                    </span>
                    {index === 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        TOP
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    @{profile.username}
                    {profile.headline ? ` · ${profile.headline}` : ""}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-primary">
                    {profile.activity_score?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card/50 p-6 text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground mb-2">How scoring works</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>Create a project: +50 points</li>
          <li>Update a project: +10 points</li>
          <li>Receive a collaboration acceptance: +30 points</li>
          <li>Receive a review (4–5 stars): +25 points</li>
          <li>Receive a skill endorsement: +15 points</li>
          <li>Daily login streak: +5 points</li>
        </ul>
        <p className="mt-3 text-xs">
          Only activity from the last 90 days counts toward the current score.
        </p>
      </div>
    </div>
  );
}
