import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

export default function TikTokResultsPage() {
  const router = useRouter();
  const queryParam = router.query.query;
  const keyword = Array.isArray(queryParam) ? queryParam[0] : queryParam;

  return (
    <>
      <Head>
        <title>TikTok Concepts for {keyword ?? "your brand"}</title>
        <meta
          name="description"
          content="Preview the TikTok concepts generated from your brand keywords."
        />
      </Head>
      <div className="min-h-screen bg-[#111119] text-neutral-50">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
          <Link href="/" className="text-lg font-semibold text-emerald-300">
            ← Back home
          </Link>
          <Link
            href="/start"
            className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-300/20"
          >
            Try new keywords
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-24">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-300/70">
              TikTok concepts
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Ideas tailored to {keyword ? <span className="text-emerald-300">{keyword}</span> : "your keywords"}
            </h1>
            <p className="max-w-2xl text-base text-neutral-300">
              Save these as scripts, share with your social team, or refine your query to explore
              different angles. We mix trending hooks with your brand positioning so you don’t have to.
            </p>
          </div>

          <section className="grid gap-6 md:grid-cols-2">
            <ResultCard
              title="Hook + Script"
              description="Snappy intro, 30-second talking points, and CTA ready for filming."
            />
            <ResultCard
              title="Caption + Hashtags"
              description="Scroll-stopping caption with optimized hashtags and emoji to boost reach."
            />
            <ResultCard
              title="Voiceover Outline"
              description="Narration cues that match your brand tone with visual beat suggestions."
            />
            <ResultCard
              title="B-Roll Checklist"
              description="Shot list for B-roll that keeps production focused and on-message."
            />
          </section>

          <section className="flex flex-col gap-4 rounded-[40px] border border-emerald-300/20 bg-emerald-300/5 px-6 py-8 text-sm text-neutral-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Need more variants?</h2>
              <p className="text-neutral-300">
                Update your keywords and we’ll remix the assets instantly.
              </p>
            </div>
            <Link
              href="/start"
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-[#111119] transition hover:bg-emerald-300"
            >
              Generate more
            </Link>
          </section>
        </main>
      </div>
    </>
  );
}

type ResultCardProps = {
  title: string;
  description: string;
};

function ResultCard({ title, description }: ResultCardProps) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-neutral-300">{description}</p>
      <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200">
        Download example
        <span aria-hidden="true">↘</span>
      </button>
    </div>
  );
}
