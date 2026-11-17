/** Required credit: Open Library asks apps using its covers to link back. */
export function OpenLibraryCredit({ className }: { className?: string }) {
  return (
    <footer className={className}>
      Book data from <a href="https://openlibrary.org">Open Library</a>
    </footer>
  );
}
