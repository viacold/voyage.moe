import { describe, expect, test } from "vitest";
import { canEditPost } from "./post-permissions";

describe("post permissions", () => {
  test("lets admins edit every post", () => {
    expect(
      canEditPost(
        {
          id: "acct_1",
          name: "Admin",
          email: "admin@voyage.moe",
          role: "admin",
        },
        { authorEmail: "writer@voyage.moe" },
      ),
    ).toBe(true);
  });

  test("lets the author edit their own post", () => {
    expect(
      canEditPost(
        {
          id: "acct_2",
          name: "Writer",
          email: "writer@voyage.moe",
          role: "member",
        },
        { authorEmail: "writer@voyage.moe" },
      ),
    ).toBe(true);
  });

  test("blocks other members from editing", () => {
    expect(
      canEditPost(
        {
          id: "acct_3",
          name: "Reader",
          email: "reader@voyage.moe",
          role: "member",
        },
        { authorEmail: "writer@voyage.moe" },
      ),
    ).toBe(false);
  });
});
