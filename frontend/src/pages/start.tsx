import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function StartPage() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keywords.trim();
    if (!trimmed) return;
    router.push(`/tiktok-results?query=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      <Head>
        <title>Super Content</title>
        <meta
          name="description"
          content="Tell us about your brand and we'll spin up on-brand TikTok content."
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

        <main className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-6 py-32">
          <h1 className="mb-12 text-center text-4xl font-normal leading-tight text-[#595959] md:text-5xl">
            Give me some keywords related to your brand:
          </h1>
          
          <form onSubmit={handleSubmit} className="relative w-full max-w-3xl">
            <input
              type="text"
              placeholder=""
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              className="w-full rounded-full border border-[#d0d0d0] bg-white px-8 py-5 pr-20 text-lg text-[#212121] shadow-sm outline-none transition focus:border-[#595959] focus:shadow-md"
            />
            <button
              type="submit"
              aria-label="Submit keywords"
              className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-[#212121] shadow-md transition hover:bg-[#f5f5f5]"
            >
              ↑
            </button>
          </form>
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
