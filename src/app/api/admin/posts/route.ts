import { NextResponse } from "next/server";
import { buildSlugFromTitle, listEditableBlogPosts, saveBlogPost } from "@/lib/admin-content";
import { getCurrentSession, isAdmin } from "@/lib/auth-store";

function requireAdminOrResponse(session: Awaited<ReturnType<typeof getCurrentSession>>) {
  if (!session) {
    return NextResponse.json({ error: "未登录。" }, { status: 401 });
  }

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "没有权限。" }, { status: 403 });
  }

  return null;
}

export async function GET() {
  const session = await getCurrentSession();
  const denied = requireAdminOrResponse(session);

  if (denied) {
    return denied;
  }

  const posts = await listEditableBlogPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  const denied = requireAdminOrResponse(session);

  if (denied) {
    return denied;
  }

  const body = (await request.json().catch(() => null)) as
    | {
        slug?: string;
        title?: string;
        description?: string;
        date?: string;
        updated?: string;
        authorName?: string;
        authorEmail?: string;
        tags?: string[];
        category?: string;
        cover?: string;
        featured?: boolean;
        draft?: boolean;
        content?: string;
      }
    | null;

  if (!body?.title || !body?.description || !body?.date || typeof body.content !== "string") {
    return NextResponse.json({ error: "标题、描述、日期和正文不能为空。" }, { status: 400 });
  }

  const slug = body.slug?.trim() || buildSlugFromTitle(body.title);

  await saveBlogPost({
    slug,
    title: body.title,
    description: body.description,
    date: body.date,
    updated: body.updated?.trim() || undefined,
    authorName: body.authorName?.trim() || undefined,
    authorEmail: body.authorEmail?.trim() || undefined,
    tags: Array.isArray(body.tags) ? body.tags : [],
    category: body.category?.trim() || "notes",
    cover: body.cover?.trim() || undefined,
    featured: body.featured === true,
    draft: body.draft === true,
    content: body.content,
  });

  return NextResponse.json({ slug });
}
