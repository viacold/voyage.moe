"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <button
      className="auth-submit"
      type="button"
      disabled={isSigningOut}
      onClick={async () => {
        setIsSigningOut(true);

        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          router.replace("/");
          router.refresh();
        } finally {
          setIsSigningOut(false);
        }
      }}
    >
      {isSigningOut ? "退出中..." : "退出登录"}
    </button>
  );
}
