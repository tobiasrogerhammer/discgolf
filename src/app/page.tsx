export default function Home() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-[var(--header-color)]">DiscGolf</h1>
      <div className="grid grid-cols-1 gap-3">
        <a href="/new" className="btn btn-primary">New game</a>
        <a href="/stats" className="btn btn-outline">My stats</a>
        <a href="/profile" className="btn btn-outline">Profile & friends</a>
      </div>
    </main>
  );
}
