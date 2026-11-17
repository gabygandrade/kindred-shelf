/** The search page (/search): find a book on Open Library and put it on a shelf. */
import { useSearchParams } from "react-router";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../../../components/QueryStates";
import { TextField } from "../../../components/TextField";
import { useMyBooks } from "../../shelf/hooks/useMyBooks";
import { useBookSearch } from "../hooks/useBookSearch";
import styles from "./SearchPage.module.css";
import { SearchResultItem } from "./SearchResultItem";

/** Search Open Library and put a book on a shelf. The query lives in the URL (?q=) so Back works. */
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const search = useBookSearch(q);
  const { data: myBooks } = useMyBooks();

  return (
    <>
      <PageHeader title="Add a book" subtitle="Search by title, author or ISBN." />
      <form
        role="search"
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          const raw = new FormData(event.currentTarget).get("q");
          const value = typeof raw === "string" ? raw.trim() : "";
          setParams(value ? { q: value } : {});
        }}
      >
        <TextField
          className={styles.field}
          label="Search books"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="e.g. Jane Eyre"
          autoFocus
        />
        <Button type="submit">Search</Button>
      </form>

      {!q ? null : search.isPending ? (
        <LoadingState label="Searching Open Library…" />
      ) : search.error ? (
        <ErrorState error={search.error} onRetry={() => void search.refetch()} />
      ) : search.data.length === 0 ? (
        <EmptyState title={`No books found for "${q}"`}>
          Check the spelling, or try just the title or the author's last name.
        </EmptyState>
      ) : (
        <section aria-label="Search results">
          <p className={styles.summary} role="status">
            {search.data.length === 1 ? "1 result" : `${search.data.length} results`}
          </p>
          <ul className={styles.results}>
            {search.data.map((result) => (
              <SearchResultItem
                key={result.olKey}
                result={result}
                current={myBooks?.find((b) => b.work.olKey === result.olKey)}
              />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
