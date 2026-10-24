import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Rocket,
  Trophy,
  Users,
  Zap,
  ArrowRight,
  Star,
  Code2,
  Cpu,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="absolute inset-0 bg-alive opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-300 mb-8">
            <Zap className="h-4 w-4" />
            <span>Activity ranks • Living CV • Real collaborations</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            Build. Rank.{" "}
            <span className="text-gradient">Get Noticed.</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
            The marketplace where engineering projects live. Showcase your work,
            collaborate with others, climb the leaderboard, and turn your profile
            into a powerful living CV.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-base px-8">
                Start Building Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" size="lg" className="gap-2 text-base">
                Explore Projects
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { label: "Projects", value: "2.4k+", icon: Code2 },
              { label: "Engineers", value: "1.8k+", icon: Users },
              { label: "Collaborations", value: "890+", icon: Rocket },
              { label: "Active this week", value: "320+", icon: Trophy },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-card/50 p-4 backdrop-blur"
              >
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Why engineers love{" "}
              <span className="text-gradient">EngiHub</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              More than a portfolio. A living system that rewards real work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Trophy,
                title: "Activity Ranking",
                desc: "Your profile ranks based on real activity — projects, collaborations, reviews, and consistency. Active accounts rise to the top.",
                color: "from-amber-400 to-orange-500",
              },
              {
                icon: Rocket,
                title: "Project Marketplace",
                desc: "Post ideas, find teammates, showcase completed work. Filter by tech stack, category, and status. Get hired from your projects.",
                color: "from-cyan-400 to-blue-500",
              },
              {
                icon: Star,
                title: "Living CV",
                desc: "Your public profile becomes a beautiful, shareable CV with activity graphs, skill endorsements, and project impact metrics.",
                color: "from-purple-400 to-pink-500",
              },
              {
                icon: Users,
                title: "Real Collaboration",
                desc: "Request to join projects, accept teammates, leave reviews. Build trust through actual work, not just claims.",
                color: "from-emerald-400 to-teal-500",
              },
              {
                icon: Cpu,
                title: "Skill Endorsements",
                desc: "Get endorsed by peers on specific skills. Endorsements boost your activity score and credibility.",
                color: "from-rose-400 to-red-500",
              },
              {
                icon: Zap,
                title: "Weekly Challenges",
                desc: "Community challenges keep you building. Climb weekly leaderboards and earn special badges.",
                color: "from-violet-400 to-indigo-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card p-6 card-hover"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-black mb-4`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-emerald-500/10 p-10 sm:p-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to make your work visible?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Create your free account, upload your first project, and start
              climbing the ranks. No credit card required.
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-8">
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
