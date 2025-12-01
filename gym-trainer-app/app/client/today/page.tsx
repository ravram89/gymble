export default function HomePage() {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gymble</h1>
          <p className="text-lg text-gray-300 mb-8">
            A nimble way for trainers to manage clients, workouts, and live sessions.
          </p>
  
          <div className="flex gap-4 justify-center">
            <a
              href="/trainer/dashboard"
              className="rounded-lg bg-blue-600 px-5 py-2 font-semibold hover:bg-blue-500"
            >
              Go to Trainer Dashboard
            </a>
            <a
              href="/client/today"
              className="rounded-lg border border-gray-500 px-5 py-2 font-semibold hover:border-white"
            >
              Client View
            </a>
          </div>
        </div>
      </main>
    );
  }
  