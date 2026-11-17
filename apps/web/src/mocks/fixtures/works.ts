/** The books in the mock catalog: public-domain works with real Open Library data. */
import type { Work } from "@kindred/shared";

// Public-domain works. Keys, page counts and cover ids are real Open Library
// data (fetched 2026-11-16); first-publish years are corrected where Open
// Library reports an edition's year instead.
function work(
  olKey: string,
  title: string,
  author: string,
  firstPublishYear: number,
  pageCount: number | null,
  coverId: number | null,
  subjects: string[] = [],
): Work {
  return { olKey, title, authors: [author], firstPublishYear, pageCount, coverId, subjects };
}

export const WORKS = {
  pride: work("OL66554W", "Pride and Prejudice", "Jane Austen", 1813, 351, 14348537, ["Romance"]),
  dorianGray: work("OL8193416W", "The Picture of Dorian Gray", "Oscar Wilde", 1890, 246, 14314858),
  wuthering: work("OL21177W", "Wuthering Heights", "Emily Brontë", 1847, 318, 12818862),
  emma: work("OL66513W", "Emma", "Jane Austen", 1815, 457, 9278312),
  frankenstein: work("OL450063W", "Frankenstein", "Mary Shelley", 1818, 240, 12356249, ["Horror"]),
  sense: work("OL66562W", "Sense and Sensibility", "Jane Austen", 1811, 352, 9278292),
  treasure: work("OL24034W", "Treasure Island", "Robert Louis Stevenson", 1883, 248, 13859660),
  dracula: work("OL85892W", "Dracula", "Bram Stoker", 1897, 384, 12216503, ["Horror"]),
  littleWomen: work("OL29983W", "Little Women", "Louisa May Alcott", 1868, 422, 8775559),
  secretGarden: work(
    "OL69612W",
    "The Secret Garden",
    "Frances Hodgson Burnett",
    1911,
    256,
    12622062,
  ),
  greatExpectations: work(
    "OL8721462W",
    "Great Expectations",
    "Charles Dickens",
    1861,
    482,
    13322313,
  ),
  annaKarenina: work("OL267096W", "Anna Karenina", "Leo Tolstoy", 1878, 660, 2560652),
  persuasion: work("OL66544W", "Persuasion", "Jane Austen", 1817, 268, 12824691),
  gatsby: work("OL468431W", "The Great Gatsby", "F. Scott Fitzgerald", 1925, 185, 10590366),
  janeEyre: work("OL1095427W", "Jane Eyre", "Charlotte Brontë", 1847, 480, 8235363),
  timeMachine: work("OL52267W", "The Time Machine", "H. G. Wells", 1895, 120, 9009316),
  mobyDick: work("OL102749W", "Moby-Dick", "Herman Melville", 1851, 453, 10544254),
  northanger: work("OL66534W", "Northanger Abbey", "Jane Austen", 1817, 251, 12567961),
  copperfield: work("OL8662242W", "David Copperfield", "Charles Dickens", 1850, 742, 1048892),
  roomWithAView: work("OL88813W", "A Room with a View", "E. M. Forster", 1908, 204, 1748132),
  monteCristo: work(
    "OL36287W",
    "The Count of Monte Cristo",
    "Alexandre Dumas",
    1844,
    599,
    14566393,
  ),
  warAndPeace: work("OL267171W", "War and Peace", "Leo Tolstoy", 1869, 696, 12621906),
  middlemarch: work("OL20867W", "Middlemarch", "George Eliot", 1871, 783, 252882),
  ageOfInnocence: work("OL98491W", "The Age of Innocence", "Edith Wharton", 1920, 348, 11196262),
  mrsDalloway: work("OL39349W", "Mrs Dalloway", "Virginia Woolf", 1925, 224, 6397580),
  carmilla: work("OL2895536W", "Carmilla", "Sheridan Le Fanu", 1872, 90, 973851),
  invisibleMan: work("OL52266W", "The Invisible Man", "H. G. Wells", 1897, 170, 6419199),
  // Cover and page count removed on purpose: exercises the generated cover and default spine width.
  shirley: work("OL1095397W", "Shirley", "Charlotte Brontë", 1849, null, null),
} satisfies Record<string, Work>;

export const ALL_WORKS: Work[] = Object.values(WORKS);
