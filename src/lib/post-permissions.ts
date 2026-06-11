import type { AuthSessionUser } from "./auth-types";
import type { BlogPost } from "./content";

export function canEditPost(session: AuthSessionUser | null, post: Pick<BlogPost, "authorEmail"> | null) {
  if (!session || !post) {
    return false;
  }

  if (session.role === "admin") {
    return true;
  }

  return Boolean(post.authorEmail && post.authorEmail === session.email);
}
