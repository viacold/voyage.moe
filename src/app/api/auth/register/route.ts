import { NextResponse } from "next/server";
import { setSessionCookie, registerAccount } from "@/lib/auth-store";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RegisterBody | null;

  if (!body?.name || !body?.email || !body?.password) {
    return NextResponse.json({ error: "姓名、邮箱和密码不能为空。" }, { status: 400 });
  }

  try {
    const { session } = await registerAccount({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    const response = NextResponse.json({ user: session });
    await setSessionCookie(response, session);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "注册失败。" },
      { status: 400 },
    );
  }
}
