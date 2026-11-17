import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { db, setSessionUserId } from "../../../mocks/db";
import { renderApp } from "../../../test/renderApp";
import { createImport, fetchImportJob } from "../api";

async function finishedImport(): Promise<string> {
  const jobId = await createImport(new Blob(["Title,Author\nCarmilla,Le Fanu\n"]));
  let job = await fetchImportJob(jobId);
  while (job.status !== "done") job = await fetchImportJob(jobId);
  return jobId;
}

describe("import results", () => {
  it("lists unmatched rows and fixes one by picking the right book", async () => {
    const reader = db.users.find((u) => u.username === "reader_a");
    if (!reader) throw new Error("fixture missing");
    setSessionUserId(reader.userId);
    const jobId = await finishedImport();

    const { user } = renderApp(`/imports/${jobId}`, { as: "reader_a" });
    const row = (await screen.findByRole("heading", { name: "Carmilla (Kindle Edition)" })).closest(
      "li",
    );
    if (!row) throw new Error("row not rendered");

    await user.click(within(row).getByRole("button", { name: "Find the right book" }));
    await user.click(
      await within(row).findByRole("button", { name: "Use Carmilla by Sheridan Le Fanu" }),
    );
    expect(await within(row).findByText("Fixed ✓")).toBeInTheDocument();
  });
});
