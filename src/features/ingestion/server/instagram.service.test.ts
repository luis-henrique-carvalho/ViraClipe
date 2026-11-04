import { describe, it, expect } from "vitest";
import {
  extractInstagramUsername,
  fetchInstagramProfile,
} from "./instagram.service";

describe("instagram.service", () => {
  it("normaliza URLs completas do Instagram", () => {
    expect(
      extractInstagramUsername("https://www.instagram.com/favoritamodas/")
    ).toBe("favoritamodas");
    expect(
      extractInstagramUsername("https://instagram.com/favoritamodas?utm_source=ig")
    ).toBe("favoritamodas");
    expect(extractInstagramUsername("@favoritamodas")).toBe("favoritamodas");
    expect(extractInstagramUsername("favoritamodas")).toBe("favoritamodas");
  });

  it("retorna perfil e posts para um username", async () => {
    const result = await fetchInstagramProfile("@favoritamodas");
    expect(result.username).toBe("favoritamodas");
    expect(result.posts.length).toBeGreaterThan(0);
    expect(result.posts[0]).toHaveProperty("mediaUrl");
  });
});
