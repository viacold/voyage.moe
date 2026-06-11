import { NextResponse } from "next/server";
import {
  listEditableBlogPostRevisions,
  restoreBlogPostRevision,
} from "@/lib/admin-content";
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
  const revisions = await listEditableBlogPostRevisions(slug);
  return NextResponse.json({ revisions });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getCurrentSession();
  const denied = requireAdminOrResponse(session);

  if (denied) {
    return denied;
  }

  const { slug } = await params;
  const body = (await request.json().catch(() => null)) as { revisionId?: string } | null;

  if (!body?.revisionId) {
    return NextResponse.json({ error: "缺少版本 ID。" }, { status: 400 });
  }

  const result = await restoreBlogPostRevision(slug, body.revisionId);
  return NextResponse.json(result);
}
