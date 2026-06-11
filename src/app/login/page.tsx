import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

type LoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

export const metadata: Metadata = {
  title: "登录",
};

export default function LoginPage({ searchParams }: Readonly<LoginPageProps>) {
  return <AuthForm mode="login" nextPath={searchParams?.next} />;
}
