import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

const presetIdeas = [
  "#ai",
  "#marketingmagic",
  "#launchday",
  "#founderstory",
  "#tiktoktrend",
  "#behindthescenes",
];

export default function StartPage() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keywords.trim();
    if (!trimmed) return;
    router.push(`/tiktok-results?query=${encodeURIComponent(trimmed)}`);
  };

  const handlePresetClick = (value: string) => {
    setKeywords((prev) =>
      prev.includes(value) ? prev : (prev ? `${prev}, ${value}` : value),
    );
  };

  return (
    <>
      <Head>
        <title>Super Content · Start</title>
        <meta
          name="description"
          content="Tell us about your brand and we’ll spin up on-brand TikTok content."
        />
      </Head>
      <div className="min-h-screen bg-[#f9f9f9] text-[#212121]">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
          <div>
            <p className="font-['Bangers'] text-3xl text-[#212121]">Super Content</p>
            <span className="mt-1 block h-1 w-16 rounded-full bg-[#212121]" />
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#3f3f3f] sm:flex">
            <a href="/" className="transition hover:text-[#212121]">
              Home
            </a>
            <a href="#" className="transition hover:text-[#212121]">
              Pricing
            </a>
            <a href="#" className="transition hover:text-[#212121]">
              Examples
            </a>
            <a href="#" className="rounded-full bg-white px-4 py-2 text-[#212121] shadow-sm shadow-black/10 transition hover:shadow-md">
              Log in
            </a>
          </nav>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-24">
          <section className="rounded-[120px] border border-black/5 bg-[#32e979] p-12 shadow-[inset_0_-12px_30px_rgba(0,0,0,0.05)]">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div className="space-y-6">
                <p className="text-center text-3xl font-semibold leading-snug text-[#595959] md:text-left md:text-[32px]">
                  Give me some keywords related to your brand:
                </p>
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="e.g. AI newsletter, B2B, weekly tips"
                    value={keywords}
                    onChange={(event) => setKeywords(event.target.value)}
                    className="w-full rounded-full border border-black/10 bg-white/90 px-6 py-4 pr-16 text-lg font-medium text-[#212121] shadow-[0_12px_30px_rgba(33,33,33,0.12)] outline-none transition focus:border-[#212121]"
                  />
                  <button
                    type="submit"
                    aria-label="Generate TikTok ideas"
                    className="absolute right-1 top-1 inline-flex h-[54px] w-[54px] items-center justify-center rounded-full bg-white text-2xl text-[#212121] shadow-[0_10px_20px_rgba(33,33,33,0.18)] transition hover:-translate-y-0.5"
                  >
                    ↑
                  </button>
                </form>
                <div className="flex flex-wrap gap-2 pt-2 text-sm text-[#3f3f3f]">
                  {presetIdeas.map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => handlePresetClick(idea)}
                      className="rounded-full border border-white/70 bg-white/80 px-3 py-1 font-medium shadow-sm transition hover:border-white hover:bg-white"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative mx-auto hidden w-[260px] max-w-full justify-self-center lg:block">
                <div className="absolute inset-x-0 top-10 mx-auto h-[420px] w-[220px] rounded-[60px] bg-white shadow-[0_40px_60px_rgba(33,33,33,0.18)]" />
                <img
                  src="https://framerusercontent.com/images/QIdkACY4Dt8WlAjV77XVUpQIFbM.png"
                  alt="Preview of generated social content"
                  className="relative z-10 mx-auto w-[240px] rounded-[70px] shadow-[0_30px_60px_rgba(33,33,33,0.22)]"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-6 rounded-[60px] border border-black/5 bg-white/80 p-8 shadow-[0_16px_40px_rgba(33,33,33,0.08)] md:grid-cols-3">
            <Card
              title="1. Tell us your vibe"
              description="Drop keywords, tone, and goals. Add examples if you have specific campaigns in mind."
            />
            <Card
              title="2. We remix for TikTok"
              description="Our TikTok agent drafts scripts, captions, and audio cues tailored to your brand."
            />
            <Card
              title="3. Export & iterate"
              description="Download scripts or push to your team with notes. Update keywords anytime to refresh ideas."
            />
          </section>
        </main>
      </div>
    </>
  );
}

type CardProps = {
  title: string;
  description: string;
};

function Card({ title, description }: CardProps) {
  return (
    <div className="space-y-3 rounded-[40px] border border-black/5 bg-white px-6 py-8 shadow-[0_10px_30px_rgba(33,33,33,0.08)]">
      <h3 className="text-xl font-semibold text-[#212121]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#3f3f3f]">{description}</p>
    </div>
  );
}
