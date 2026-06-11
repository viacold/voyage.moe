import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

type RegisterPageProps = {
  searchParams?: {
    next?: string;
  };
};

export const metadata: Metadata = {
  title: "注册",
};

export default function RegisterPage({ searchParams }: Readonly<RegisterPageProps>) {
  return <AuthForm mode="register" nextPath={searchParams?.next} />;
}
