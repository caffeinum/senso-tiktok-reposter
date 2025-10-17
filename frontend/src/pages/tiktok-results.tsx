import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function TikTokResultsPage() {
  const router = useRouter();
  const queryParam = router.query.query;
  const keyword = Array.isArray(queryParam) ? queryParam[0] : queryParam;
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showUploadStep, setShowUploadStep] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [brandCopy, setBrandCopy] = useState("When you're trying to build something big without Apify");

  const videos = [
    "https://litter.catbox.moe/lf5lvwzhis0hd8py.mp4",
    "https://api.apify.com/v2/key-value-stores/fPv7REDpL3IxnkKLr/records/video-happyhome_-20220505183502-7094322616432954670.mp4",
    "https://api.apify.com/v2/key-value-stores/kTZXe4EZAUAwPUq0z/records/video-quangminh_-20251014230959-7561218578016472351.mp4",
  ];

  const handleVideoSelect = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  const handleContinueToUpload = () => {
    if (selectedVideo) {
      setShowUploadStep(true);
    }
  };

  const handleGenerate = () => {
    setShowProcessing(true);
  };

  useEffect(() => {
    if (showProcessing) {
      const timer = setTimeout(() => {
        setShowProcessing(false);
        setShowResult(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showProcessing]);

  if (showResult) {
    return (
      <>
        <Head>
          <title>Super Content - Generated Video</title>
          <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet" />
        </Head>
        <div className="min-h-screen bg-[#f9f9f9] text-[#595959]">
          <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-[#32e979]/30 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#32e979] to-[#22e58b] shadow-lg">
                  <svg width="22" height="23" viewBox="0 0 21.646 22.637" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 18.877 9.871 C 20.046 10.482 20.046 12.155 18.877 12.766 L 2.391 21.387 C 1.303 21.955 0 21.166 0 19.939 L 0 2.698 C 0 1.47 1.303 0.681 2.391 1.25 Z" fill="white" filter="drop-shadow(0px 2.72px 1px rgba(196, 196, 196, 1))"/>
                  </svg>
                </div>
              </div>
              <span style={{ fontFamily: 'Bangers, sans-serif' }} className="text-2xl italic text-[#212121]">SUPER CONTENT</span>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 pb-24 pt-12">
            <div className="space-y-3 text-center">
              <h1 className="text-4xl font-normal leading-tight text-[#595959] sm:text-5xl">
                your tiktok is ready!
              </h1>
              <p className="text-base text-[#595959]">
                download and share with your audience
              </p>
            </div>

            <video
              src="/output.mp4"
              controls
              autoPlay
              loop
              playsInline
              className="h-auto w-full max-w-[360px] rounded-2xl border border-[#d0d0d0] bg-black shadow-2xl"
            />

            <div className="flex gap-4">
              <button className="rounded-full bg-[#32e979] px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#22e58b]">
                download video
              </button>
              <button
                onClick={() => {
                  setShowResult(false);
                  setSelectedVideo(null);
                }}
                className="rounded-full border border-[#d0d0d0] bg-white px-8 py-3 text-sm font-semibold text-[#595959] transition hover:bg-[#f5f5f5]"
              >
                create another
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (showUploadStep) {
    return (
      <>
        <Head>
          <title>Super Content - Upload Logo</title>
          <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet" />
        </Head>
        <div className="min-h-screen bg-[#f9f9f9] text-[#595959]">
          <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-[#32e979]/30 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#32e979] to-[#22e58b] shadow-lg">
                  <svg width="22" height="23" viewBox="0 0 21.646 22.637" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 18.877 9.871 C 20.046 10.482 20.046 12.155 18.877 12.766 L 2.391 21.387 C 1.303 21.955 0 21.166 0 19.939 L 0 2.698 C 0 1.47 1.303 0.681 2.391 1.25 Z" fill="white" filter="drop-shadow(0px 2.72px 1px rgba(196, 196, 196, 1))"/>
                  </svg>
                </div>
              </div>
              <span style={{ fontFamily: 'Bangers, sans-serif' }} className="text-2xl italic text-[#212121]">SUPER CONTENT</span>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 pb-24 pt-12">
            <div className="space-y-3">
              <h1 className="text-4xl font-normal leading-tight text-[#595959] sm:text-5xl">
                upload your logo
              </h1>
              <p className="max-w-2xl text-base text-[#595959]">
                add your brand logo and customize the video copy
              </p>
            </div>

            <div className="space-y-6 rounded-3xl border border-[#d0d0d0] bg-white p-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#212121]">brand logo</label>
                <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-[#d0d0d0] bg-[#f9f9f9] p-12">
                  <img src="/apify_sdk.svg" alt="Apify logo" className="h-16" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#212121]">video copy</label>
                <textarea
                  value={brandCopy}
                  onChange={(e) => setBrandCopy(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-[#d0d0d0] bg-white px-4 py-3 text-[#212121] outline-none transition focus:border-[#595959]"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="rounded-full bg-[#32e979] px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#22e58b]"
            >
              generate branded video
            </button>
          </main>
        </div>
      </>
    );
  }

  if (showProcessing) {
    return (
      <>
        <Head>
          <title>Super Content - Processing</title>
          <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet" />
        </Head>
        <div className="min-h-screen bg-[#f9f9f9] text-[#595959]">
          <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-[#32e979]/30 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#32e979] to-[#22e58b] shadow-lg">
                  <svg width="22" height="23" viewBox="0 0 21.646 22.637" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 18.877 9.871 C 20.046 10.482 20.046 12.155 18.877 12.766 L 2.391 21.387 C 1.303 21.955 0 21.166 0 19.939 L 0 2.698 C 0 1.47 1.303 0.681 2.391 1.25 Z" fill="white" filter="drop-shadow(0px 2.72px 1px rgba(196, 196, 196, 1))"/>
                  </svg>
                </div>
              </div>
              <span style={{ fontFamily: 'Bangers, sans-serif' }} className="text-2xl italic text-[#212121]">SUPER CONTENT</span>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-6 py-32">
            <div className="space-y-8 text-center">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#d0d0d0] border-t-[#32e979]" />
              <div className="space-y-2">
                <h1 className="text-3xl font-normal text-[#595959]">
                  generating your branded video...
                </h1>
                <p className="text-sm text-[#595959]">
                  this will take a few seconds
                </p>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
        <Head>
          <title>Super Content - Results</title>
          <meta
            name="description"
            content="Preview the TikTok concepts generated from your brand keywords."
          />
          <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet" />
        </Head>
        <div className="min-h-screen bg-[#f9f9f9] text-[#595959]">
          <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-[#32e979]/30 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#32e979] to-[#22e58b] shadow-lg">
                  <svg width="22" height="23" viewBox="0 0 21.646 22.637" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 18.877 9.871 C 20.046 10.482 20.046 12.155 18.877 12.766 L 2.391 21.387 C 1.303 21.955 0 21.166 0 19.939 L 0 2.698 C 0 1.47 1.303 0.681 2.391 1.25 Z" fill="white" filter="drop-shadow(0px 2.72px 1px rgba(196, 196, 196, 1))"/>
                  </svg>
                </div>
              </div>
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

          <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-24 pt-12">
          <div className="space-y-3">
            <h1 className="text-4xl font-normal leading-tight text-[#595959] sm:text-5xl">
              select a video to remix
            </h1>
            <p className="max-w-2xl text-base text-[#595959]">
              choose one video and we'll generate a branded video based on your selection
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {videos.map((videoUrl, idx) => (
              <div
                key={idx}
                className="relative cursor-pointer"
                onClick={() => handleVideoSelect(videoUrl)}
              >
                <video
                  src={videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`h-[500px] w-[280px] rounded-2xl border-4 bg-black object-cover shadow-lg transition ${
                    selectedVideo === videoUrl
                      ? "border-[#32e979]"
                      : "border-[#d0d0d0]"
                  }`}
                />
                {selectedVideo === videoUrl && (
                  <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#32e979] text-sm font-bold text-white shadow-lg">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>

          <section className="mt-8 flex flex-col gap-4 rounded-3xl border border-[#d0d0d0] bg-white px-8 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#212121]">
                {selectedVideo ? "ready to continue!" : "no video selected"}
              </h2>
              <p className="text-[#595959]">
                {selectedVideo
                  ? "add your logo and customize the copy"
                  : "select a video to continue"}
              </p>
            </div>
            <button
              onClick={handleContinueToUpload}
              disabled={!selectedVideo}
              className={`inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white shadow-lg transition ${
                selectedVideo
                  ? "bg-[#32e979] hover:bg-[#22e58b]"
                  : "cursor-not-allowed bg-[#d0d0d0]"
              }`}
            >
              continue
            </button>
          </section>
        </main>
      </div>
    </>
  );
}


