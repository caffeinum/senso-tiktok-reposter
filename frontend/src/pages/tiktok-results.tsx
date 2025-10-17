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
        <title>Super Content - Results</title>
        <meta
          name="description"
          content="Preview the TikTok concepts generated from your brand keywords."
        />
      </Head>
      <div className="min-h-screen bg-[#f9f9f9] text-[#595959]">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-[#32e979]/30 blur-xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#32e979] to-[#22e58b] shadow-lg">
                <div className="flex h-0 w-0 border-y-[8px] border-l-[14px] border-y-transparent border-l-white" style={{ marginLeft: '3px' }} />
              </div>
            </div>
            <span className="font-['Bangers'] text-2xl italic text-[#212121]">SUPER CONTENT</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#595959] md:flex">
            <a href="#" className="transition hover:text-[#212121]">
              Why Super Content?
            </a>
            <a href="#" className="transition hover:text-[#212121]">
              Product
            </a>
            <a href="#" className="transition hover:text-[#212121]">
              Pricing
            </a>
            <a href="#" className="transition hover:text-[#212121]">
              Resources
            </a>
            <a href="#" className="text-[#212121] transition hover:text-[#595959]">
              login
            </a>
            <a href="#" className="rounded-full bg-[#32e979] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#22e58b]">
              Sign Up
            </a>
          </nav>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-24 pt-12">
          <div className="space-y-3">
            <h1 className="text-4xl font-normal leading-tight text-[#595959] sm:text-5xl">
              Results for: {keyword ? <span className="text-[#212121]">{keyword}</span> : "your keywords"}
            </h1>
            <p className="max-w-2xl text-base text-[#595959]">
              here are your generated tiktok concepts. save them, share with your team, or try new keywords to explore different angles.
            </p>
          </div>

          <section className="grid gap-6 md:grid-cols-2">
            <ResultCard
              title="Hook + Script"
              description="snappy intro, 30-second talking points, and cta ready for filming."
            />
            <ResultCard
              title="Caption + Hashtags"
              description="scroll-stopping caption with optimized hashtags and emoji to boost reach."
            />
            <ResultCard
              title="Voiceover Outline"
              description="narration cues that match your brand tone with visual beat suggestions."
            />
            <ResultCard
              title="B-Roll Checklist"
              description="shot list for b-roll that keeps production focused and on-message."
            />
          </section>

          <section className="mt-8 flex flex-col gap-4 rounded-3xl border border-[#d0d0d0] bg-white px-8 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#212121]">need more variants?</h2>
              <p className="text-[#595959]">
                update your keywords and we'll remix the assets instantly.
              </p>
            </div>
            <Link
              href="/start"
              className="inline-flex items-center justify-center rounded-full bg-[#32e979] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#22e58b]"
            >
              generate more
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
    <div className="rounded-3xl border border-[#d0d0d0] bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-[#212121]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#595959]">{description}</p>
      <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#32e979] transition hover:text-[#22e58b]">
        download example
        <span aria-hidden="true">↘</span>
      </button>
    </div>
  );
}
