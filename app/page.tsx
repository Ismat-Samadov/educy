export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Educy
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
          Modern Course Management System
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
          Building your application...
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-lg mb-2">👨‍💼 Admin</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Full system control</p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-lg mb-2">👨‍🏫 Instructor</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage courses & grades</p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-lg mb-2">🎓 Student</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Access materials & submit</p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-lg mb-2">🛡️ Moderator</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Content management</p>
          </div>
        </div>
      </div>
    </main>
  )
}
