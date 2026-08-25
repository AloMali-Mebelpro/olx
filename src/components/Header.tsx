import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-2xl font-extrabold tracking-tight text-emerald-600"
        >
          <span className="rounded-md bg-emerald-600 px-2 py-1 text-white">
            OB
          </span>
          <span>Объявления</span>
        </Link>

        <form
          action="/"
          className="ml-2 flex flex-1 items-center overflow-hidden rounded-full border border-zinc-300 focus-within:border-emerald-500 dark:border-zinc-700"
        >
          <input
            type="text"
            name="q"
            placeholder="Найти объявление..."
            className="w-full bg-transparent px-4 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Искать
          </button>
        </form>

        <Link
          href="/listing/new"
          className="whitespace-nowrap rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Разместить объявление
        </Link>
      </div>
    </header>
  );
}
