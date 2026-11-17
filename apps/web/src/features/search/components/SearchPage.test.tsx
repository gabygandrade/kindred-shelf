import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../../test/renderApp";

describe("search and add", () => {
  it("adds a book to Read, offers a rating, and lets you skip it", async () => {
    const { user } = renderApp("/search?q=carmilla", { as: "reader_a" });
    const add = await screen.findByRole("group", { name: "Add Carmilla to a shelf" });
    await user.click(within(add).getByRole("button", { name: "Read" }));

    expect(await screen.findByText("Added to Read. How was it?")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Rate Carmilla" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(screen.getByRole("link", { name: "On your Read shelf" })).toHaveAttribute(
      "href",
      "/books/OL2895536W",
    );
  });

  it("shows a retry message when Open Library is down", async () => {
    renderApp("/search?q=offline", { as: "reader_a" });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Open Library isn't responding");
    expect(within(alert).getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("says when nothing matches", async () => {
    renderApp("/search?q=zzzz", { as: "reader_a" });
    expect(
      await screen.findByRole("heading", { name: 'No books found for "zzzz"' }),
    ).toBeInTheDocument();
  });
});
