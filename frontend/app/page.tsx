export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">

      <h1 className="text-5xl font-bold">
        EdgeSOC Demo Website
      </h1>

      <p className="text-lg">
        Security Monitoring Demonstration Platform
      </p>

      <div className="flex gap-4">

        <a
          href="/login"
          className="border px-4 py-2 rounded"
        >
          Login
        </a>

        <a
          href="/search"
          className="border px-4 py-2 rounded"
        >
          Search
        </a>

        <a
          href="/contact"
          className="border px-4 py-2 rounded"
        >
          Contact
        </a>

      </div>

    </main>
  );
}