import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../../test/renderApp";

describe("the open-book view", () => {
  it("shows the rating as five labeled star buttons and saves a new one", async () => {
    const { user } = renderApp("/books/OL1095427W", { as: "reader_a" });
    const rating = await screen.findByRole("group", { name: "Your rating" });
    expect(within(rating).getByRole("button", { name: "5 stars" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(within(rating).getByRole("button", { name: "3 stars" }));
    expect(await within(rating).findByRole("button", { name: "3 stars" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Read in 17 days · Mar 2 – Mar 19, 2026")).toBeInTheDocument();
  });

  it("moves a book between shelves with a radio group", async () => {
    const { user } = renderApp("/books/OL1095427W", { as: "reader_a" });
    const shelf = await screen.findByRole("group", { name: "Shelf" });
    expect(within(shelf).getByRole("radio", { name: "Read" })).toBeChecked();

    await user.click(within(shelf).getByRole("radio", { name: "Reading" }));
    expect(await within(shelf).findByRole("radio", { name: "Reading" })).toBeChecked();
    expect(screen.queryByRole("group", { name: "Your rating" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Back to Reading" })).toBeInTheDocument();
  });

  it("marks a book private", async () => {
    const { user } = renderApp("/books/OL1095427W", { as: "reader_a" });
    const checkbox = await screen.findByRole("checkbox", { name: "Keep this book private" });
    await user.click(checkbox);
    expect(await screen.findByRole("checkbox", { name: "Keep this book private" })).toBeChecked();
  });

  it("draws a generated cover when the book has none", async () => {
    renderApp("/books/OL1095397W", { as: "reader_a" });
    expect(await screen.findByRole("img", { name: "Cover of Shirley" })).toHaveTextContent(
      "Shirley",
    );
  });
});
