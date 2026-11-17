import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../../test/renderApp";

describe("my bookshelf", () => {
  it("shows each read book as a spine link named 'Title by Author'", async () => {
    renderApp("/shelf/read", { as: "reader_a" });
    const shelf = await screen.findByRole("list", { name: "Read shelf" });
    const spine = within(shelf).getByRole("link", { name: "Jane Eyre by Charlotte Brontë" });
    expect(spine).toHaveAttribute("href", "/books/OL1095427W");
    expect(within(shelf).getAllByRole("link")).toHaveLength(18);
    expect(screen.getByText("18 books on the shelf")).toBeInTheDocument();
  });

  it("shows the most recently started book in the Currently reading card", async () => {
    renderApp("/shelf/read", { as: "reader_a" });
    const card = await screen.findByRole("link", { name: /Currently reading/ });
    expect(card).toHaveTextContent("Shirley");
  });

  it("offers import and add instead of an empty plank for a new member", async () => {
    renderApp("/shelf/read", { as: "friend_f" });
    expect(
      await screen.findByRole("heading", { name: "Your shelves are empty" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Import from Goodreads" })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Read shelf" })).not.toBeInTheDocument();
  });

  it("sends signed-out visitors to sign in", async () => {
    const { router } = renderApp("/shelf/read");
    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(router.state.location.search).toBe("?next=%2Fshelf%2Fread");
  });
});
