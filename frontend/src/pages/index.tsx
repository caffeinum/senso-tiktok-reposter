import Head from "next/head";
import { useEffect, useState } from "react";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = "airia-anon-user-id";
    const existingId = window.sessionStorage.getItem(storageKey);

    if (existingId) {
      setUserId(existingId);
      return;
    }

    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    window.sessionStorage.setItem(storageKey, generated);
    setUserId(generated);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !userInput.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/airia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          userInput: userInput.trim(),
        }),
      });

      const data = (await res.json()) as
        | { success: true; data: unknown }
        | { success: false; error: string; details?: unknown };

      if (!res.ok || !data.success) {
        const message =
          "error" in data
            ? data.error
            : "Unexpected error while contacting the Airia proxy.";
        setError(message);
        if ("details" in data) {
          // surface extra context for debugging
          console.warn("Airia error details:", data.details);
        }
        return;
      }

      setResponse(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error contacting /api/airia",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Airia Agent Playground</title>
        <meta
          name="description"
          content="Anonymous session playground for the Airia pipeline"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-neutral-950 px-4 py-16 text-neutral-50">
        <div className="w-full max-w-2xl space-y-8">
          <header className="space-y-2 text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Airia Agent Playground
            </h1>
            <p className="text-neutral-300">
              Enter a prompt, we’ll proxy it through the configured Airia
              pipeline, and stream the structured response back to you. A fresh
              anonymous session ID is generated per browser session so you can
              test multi-turn behaviour safely.
            </p>
          </header>

          <section className="rounded-lg border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/40 backdrop-blur">
            <div className="mb-4 text-sm text-neutral-300">
              Session ID:{" "}
              <code className="rounded bg-black/50 px-2 py-1 text-xs text-emerald-300">
                {userId ?? "initialising..."}
              </code>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-200">
                User input
                <textarea
                  value={userInput}
                  onChange={(event) => setUserInput(event.target.value)}
                  placeholder="Ask the agent something..."
                  className="min-h-[140px] rounded-md border border-white/10 bg-black/40 p-3 text-base text-neutral-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !userInput.trim() || !userId}
                className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40"
              >
                {isSubmitting ? "Sending to Airia…" : "Send to Airia agent"}
              </button>
            </form>

            {error && (
              <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </p>
            )}

            {response !== null && (
              <div className="mt-6 space-y-2">
                <h2 className="text-lg font-semibold text-neutral-100">
                  Response
                </h2>
                <pre className="max-h-80 overflow-auto rounded-md border border-white/10 bg-black/60 p-4 text-xs leading-relaxed text-neutral-100">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </section>

          <footer className="text-center text-sm text-neutral-500">
            Requests are proxied through <code>/api/airia</code> to keep your API
            key on the server. Rotate anonymous IDs by refreshing the tab.
          </footer>
        </div>
      </main>
    </>
  );
}
