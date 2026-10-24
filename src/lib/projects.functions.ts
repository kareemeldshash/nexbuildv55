import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

export type Project = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  price: number;
  status: string;
  creatorName: string;
};

export type Profile = {
  userId: string;
  displayName: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  skills: string;
  projectCount: number;
};

type RawProject = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: string | number;
  status: string;
  creator_name: string | null;
};

function row(r: RawProject): Project {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    description: r.description,
    price: Number(r.price) || 0,
    status: r.status,
    creatorName: r.creator_name || "Creator",
  };
}

export const listApproved = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<RawProject>`
    select p.id, p.user_id, p.title, p.description, p.price, p.status,
           pr.display_name as creator_name
    from projects p
    left join profiles pr on pr.user_id = p.user_id
    where p.status = 'approved'
    order by p.created_at desc`;
  return rows.map(row);
});

export const getProject = createServerFn({ method: "GET" })
  .validator((id: string) => String(id || "").slice(0, 80))
  .handler(async ({ data: id }) => {
    const sql = await getSql();
    const rows = await sql<RawProject>`
      select p.id, p.user_id, p.title, p.description, p.price, p.status,
             pr.display_name as creator_name
      from projects p
      left join profiles pr on pr.user_id = p.user_id
      where p.id = ${id} and (p.status = 'approved')
      limit 1`;
    return rows[0] ? row(rows[0]) : null;
  });

export const listByCreator = createServerFn({ method: "GET" })
  .validator((userId: string) => String(userId || "").slice(0, 80))
  .handler(async ({ data: userId }) => {
    const sql = await getSql();
    const rows = await sql<RawProject>`
      select p.id, p.user_id, p.title, p.description, p.price, p.status,
             pr.display_name as creator_name
      from projects p
      left join profiles pr on pr.user_id = p.user_id
      where p.user_id = ${userId} and p.status = 'approved'
      order by p.created_at desc`;
    return rows.map(row);
  });

export const listCreators = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{
    user_id: string;
    display_name: string;
    headline: string | null;
    bio: string | null;
    location: string | null;
    skills: string;
    project_count: string | number;
  }>`
    select pr.user_id, pr.display_name, pr.headline, pr.bio, pr.location, pr.skills,
           count(p.id) as project_count
    from profiles pr
    left join projects p on p.user_id = pr.user_id and p.status = 'approved'
    group by pr.user_id, pr.display_name, pr.headline, pr.bio, pr.location, pr.skills
    order by count(p.id) desc, pr.display_name`;
  return rows.map((r) => ({
    userId: r.user_id,
    displayName: r.display_name,
    headline: r.headline,
    bio: r.bio,
    location: r.location,
    skills: r.skills,
    projectCount: Number(r.project_count) || 0,
  }));
});

export const getProfile = createServerFn({ method: "GET" })
  .validator((userId: string) => String(userId || "").slice(0, 80))
  .handler(async ({ data: userId }) => {
    const sql = await getSql();
    const rows = await sql<{
      user_id: string;
      display_name: string;
      headline: string | null;
      bio: string | null;
      location: string | null;
      skills: string;
    }>`select user_id, display_name, headline, bio, location, skills from profiles where user_id = ${userId} limit 1`;
    const r = rows[0];
    if (!r) return null;
    return {
      userId: r.user_id,
      displayName: r.display_name,
      headline: r.headline,
      bio: r.bio,
      location: r.location,
      skills: r.skills,
      projectCount: 0,
    } satisfies Profile;
  });

export const listMine = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<RawProject>`
      select p.id, p.user_id, p.title, p.description, p.price, p.status,
             pr.display_name as creator_name
      from projects p
      left join profiles pr on pr.user_id = p.user_id
      where p.user_id = ${context.userId}
      order by p.created_at desc`;
    return rows.map(row);
  });

export const myProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      user_id: string;
      display_name: string;
      headline: string | null;
      bio: string | null;
      location: string | null;
      skills: string;
    }>`select user_id, display_name, headline, bio, location, skills from profiles where user_id = ${context.userId} limit 1`;
    return rows[0]
      ? {
          userId: rows[0].user_id,
          displayName: rows[0].display_name,
          headline: rows[0].headline ?? "",
          bio: rows[0].bio ?? "",
          location: rows[0].location ?? "",
          skills: rows[0].skills ?? "",
        }
      : {
          userId: context.userId,
          displayName: "",
          headline: "",
          bio: "",
          location: "",
          skills: "",
        };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    displayName: string;
    headline: string;
    bio: string;
    location: string;
    skills: string;
  }) => ({
    displayName: String(input?.displayName ?? "").trim().slice(0, 60),
    headline: String(input?.headline ?? "").trim().slice(0, 120),
    bio: String(input?.bio ?? "").trim().slice(0, 600),
    location: String(input?.location ?? "").trim().slice(0, 80),
    skills: String(input?.skills ?? "").trim().slice(0, 160),
  }))
  .handler(async ({ context, data }) => {
    if (data.displayName.length < 2) throw new Error("Add your name.");
    const sql = await getSql();
    await sql`
      insert into profiles (user_id, display_name, headline, bio, location, skills, updated_at)
      values (${context.userId}, ${data.displayName}, ${data.headline}, ${data.bio}, ${data.location}, ${data.skills}, now())
      on conflict (user_id) do update set
        display_name = excluded.display_name,
        headline = excluded.headline,
        bio = excluded.bio,
        location = excluded.location,
        skills = excluded.skills,
        updated_at = now()`;
    return { ok: true };
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; description: string; price: number }) => {
    const title = String(input?.title ?? "").trim().slice(0, 120);
    const description = String(input?.description ?? "").trim().slice(0, 800);
    const price = Math.max(0, Math.min(100000, Number(input?.price) || 0));
    if (title.length < 2) throw new Error("Give the project a title.");
    return { title, description, price };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<{ user_id: string }>`select user_id from profiles where user_id = ${context.userId} limit 1`;
    if (!existing[0]) {
      await sql`insert into profiles (user_id, display_name, headline) values (${context.userId}, 'New creator', 'Engineering projects')`;
    }
    const id = crypto.randomUUID();
    await sql`insert into projects (id, user_id, title, description, price, status)
      values (${id}, ${context.userId}, ${data.title}, ${data.description}, ${data.price}, 'pending')`;
    return { id, status: "pending" as const };
  });
