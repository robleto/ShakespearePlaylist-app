// Admin section shell (inside (admin) route group)
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-semibold">ShakesFind Admin</h1>
          <nav className="text-sm space-x-4">
            <a href="/admin" className="hover:underline">Review</a>
            <a href="/admin/sources" className="hover:underline">Sources</a>
            <a href="/admin/tools" className="hover:underline">Tools</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8" id="admin-main">
        {children}
      </main>
    </div>
  )
}
