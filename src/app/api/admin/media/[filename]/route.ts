import { NextResponse } from "next/server";
import { getCurrentSession, isAdmin } from "@/lib/auth-store";
import { deleteMediaAsset } from "@/lib/media-library";

function requireAdminOrResponse(session: Awaited<ReturnType<typeof getCurrentSession>>) {
  if (!session) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "没有权限。" }, { status: 403 });
  }

  return null;
}

type RouteParams = {
  params: Promise<{ filename: string }>;
};

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await getCurrentSession();
  const denied = requireAdminOrResponse(session);

  if (denied) {
    return denied;
  }

  const { filename } = await params;
  const result = await deleteMediaAsset(filename);
  return NextResponse.json({ result });
}
