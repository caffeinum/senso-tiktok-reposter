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
        <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-[#f9f9f9] text-[#595959]">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Super Content" className="h-16 w-16" />
            <span style={{ fontFamily: 'Bangers, sans-serif' }} className="text-2xl italic text-[#212121]">SUPER CONTENT</span>
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
            <a href="#" className="transition hover:text-[#212121]">
              Book a demo
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
          <h1 className="mb-12 text-center text-[40px] font-normal leading-tight text-[#595959] md:text-[56px]">
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
