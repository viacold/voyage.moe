import { getPublishedPosts } from "@/lib/content";
import { buildRssXml } from "@/lib/rss";

export async function GET() {
  const posts = await getPublishedPosts();

  return new Response(buildRssXml(posts), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
