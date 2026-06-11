import { NextResponse } from "next/server";
import { deleteBlogPost, getEditableBlogPost, saveBlogPost } from "@/lib/admin-content";
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

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getCurrentSession();
  const denied = requireAdminOrResponse(session);

  if (denied) {
    return denied;
  }

  const { slug } = await params;
  const post = await getEditableBlogPost(slug);

  if (!post) {
    return NextResponse.json({ error: "未找到文章。" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getCurrentSession();
  const denied = requireAdminOrResponse(session);

  if (denied) {
    return denied;
  }

  const { slug } = await params;
  const body = (await request.json().catch(() => null)) as
    | {
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

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getCurrentSession();
  const denied = requireAdminOrResponse(session);

  if (denied) {
    return denied;
  }

  const { slug } = await params;
  await deleteBlogPost(slug);
  return NextResponse.json({ ok: true });
}
