export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border rounded-lg shadow p-6 space-y-4">
        <h1 className="text-lg font-semibold">Authentication Error</h1>
        <p className="text-sm text-gray-600">Sign in failed. You may not have admin access or a configuration issue occurred.</p>
        <a href="/auth/signin" className="text-blue-600 text-sm hover:underline">Try again</a>
      </div>
    </div>
  )
}