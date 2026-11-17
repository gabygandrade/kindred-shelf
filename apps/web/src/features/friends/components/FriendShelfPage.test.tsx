import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../../test/renderApp";

describe("a friend's shelf", () => {
  it("never shows their private book, on the shelf or in the counts", async () => {
    renderApp("/friends/friend_b", { as: "reader_a" });
    const shelf = await screen.findByRole("list", { name: "Friend B's Read shelf" });
    expect(within(shelf).getAllByRole("link")).toHaveLength(5);
    expect(screen.queryByRole("link", { name: /Carmilla/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read (5)" })).toHaveAttribute("aria-current", "page");
  });

  it("shows the same 'not available' screen for a stranger and an unknown member", async () => {
    renderApp("/friends/stranger_e", { as: "reader_a" });
    expect(
      await screen.findByRole("heading", { name: "This shelf isn't available" }),
    ).toBeInTheDocument();
  });

  it("links spines to the friend's read-only book view", async () => {
    const { user } = renderApp("/friends/friend_b", { as: "reader_a" });
    await user.click(await screen.findByRole("link", { name: "The Time Machine by H. G. Wells" }));
    expect(await screen.findByRole("heading", { name: "The Time Machine" })).toBeInTheDocument();
    expect(screen.getByText("Friend B rated it 5 out of 5")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Your rating" })).not.toBeInTheDocument();
  });
});
