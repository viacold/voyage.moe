import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-store";
import { listMediaAssets, saveMediaAsset } from "@/lib/media-library";

function requireSessionOrResponse(session: Awaited<ReturnType<typeof getCurrentSession>>) {
  if (!session) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  return null;
}

export async function GET() {
  const session = await getCurrentSession();
  const denied = requireSessionOrResponse(session);

  if (denied) {
    return denied;
  }

  const media = await listMediaAssets();
  return NextResponse.json({ media });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  const denied = requireSessionOrResponse(session);

  if (denied) {
    return denied;
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请选择要上传的图片文件。" }, { status: 400 });
  }

  const asset = await saveMediaAsset(file);
  return NextResponse.json({ asset });
}
