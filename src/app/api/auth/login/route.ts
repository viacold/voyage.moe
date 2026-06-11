import { NextResponse } from "next/server";
import { setSessionCookie, signInAccount } from "@/lib/auth-store";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginBody | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "邮箱和密码不能为空。" }, { status: 400 });
  }

  try {
    const { session } = await signInAccount({
      email: body.email,
      password: body.password,
    });

    const response = NextResponse.json({ user: session });
    await setSessionCookie(response, session);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "登录失败。" },
      { status: 401 },
    );
  }
}
