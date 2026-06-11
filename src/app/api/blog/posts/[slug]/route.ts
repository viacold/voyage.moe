import { NextResponse } from "next/server";
import { saveBlogPost } from "@/lib/admin-content";
import { getCurrentSession } from "@/lib/auth-store";
import { canEditPost } from "@/lib/post-permissions";
import { getPostBySlugIncludingDrafts } from "@/lib/content";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getCurrentSession();
  const { slug } = await params;
  const post = await getPostBySlugIncludingDrafts(slug);

  if (!post) {
    return NextResponse.json({ error: "未找到文章。" }, { status: 404 });
  }

  if (!canEditPost(session, post)) {
    return NextResponse.json({ error: "没有权限。" }, { status: 403 });
  }

  return NextResponse.json({ post });
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getCurrentSession();
  const { slug } = await params;
  const post = await getPostBySlugIncludingDrafts(slug);

  if (!post) {
    return NextResponse.json({ error: "未找到文章。" }, { status: 404 });
  }

  if (!canEditPost(session, post)) {
    return NextResponse.json({ error: "没有权限。" }, { status: 403 });
  }

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
