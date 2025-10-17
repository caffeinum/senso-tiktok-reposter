import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function TikTokResultsPage() {
  const router = useRouter();
  const queryParam = router.query.query;
  const keyword = Array.isArray(queryParam) ? queryParam[0] : queryParam;
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const videos = [
    "https://api.apify.com/v2/key-value-stores/fPv7REDpL3IxnkKLr/records/video-jixiewang-20220520043751-7099673155060452654.mp4",
    "https://api.apify.com/v2/key-value-stores/fPv7REDpL3IxnkKLr/records/video-happyhome_-20220505183502-7094322616432954670.mp4",
    "https://api.apify.com/v2/key-value-stores/fPv7REDpL3IxnkKLr/records/video-jixiewang-20220520043751-7099673155060452654.mp4",
  ];

  const handleVideoSelect = (videoUrl: string) => {
    if (selectedVideos.includes(videoUrl)) {
      setSelectedVideos(selectedVideos.filter((v) => v !== videoUrl));
    } else if (selectedVideos.length < 3) {
      setSelectedVideos([...selectedVideos, videoUrl]);
    }
  };

  const handleGenerate = () => {
    if (selectedVideos.length === 3) {
      setShowProcessing(true);
      setTimeout(() => {
        setShowProcessing(false);
        setShowResult(true);
      }, 3000);
    }
  };

  if (showResult) {
    return (
      <>
        <Head>
          <title>Super Content - Generated Video</title>
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
                  setSelectedVideos([]);
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

  if (showProcessing) {
    return (
      <>
        <Head>
          <title>Super Content - Processing</title>
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
          </header>

          <main className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-6 py-32">
            <div className="space-y-8 text-center">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#d0d0d0] border-t-[#32e979]" />
              <div className="space-y-2">
                <h1 className="text-3xl font-normal text-[#595959]">
                  generating your tiktok...
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

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-24 pt-12">
          <div className="space-y-3">
            <h1 className="text-4xl font-normal leading-tight text-[#595959] sm:text-5xl">
              select 3 videos to remix
            </h1>
            <p className="max-w-2xl text-base text-[#595959]">
              choose exactly 3 videos and we'll generate a new tiktok based on your selections
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
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

            <aside className="flex flex-col gap-4">
              {videos.map((videoUrl, idx) => (
                <div
                  key={idx}
                  className="relative cursor-pointer"
                  onClick={() => handleVideoSelect(videoUrl)}
                >
                  <video
                    src={videoUrl}
                    loop
                    muted
                    playsInline
                    className={`h-[500px] w-[280px] rounded-2xl border-4 bg-black object-cover shadow-lg transition ${
                      selectedVideos.includes(videoUrl)
                        ? "border-[#32e979]"
                        : "border-[#d0d0d0]"
                    }`}
                  />
                  {selectedVideos.includes(videoUrl) && (
                    <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#32e979] text-sm font-bold text-white shadow-lg">
                      {selectedVideos.indexOf(videoUrl) + 1}
                    </div>
                  )}
                </div>
              ))}
            </aside>
          </div>

          <section className="mt-8 flex flex-col gap-4 rounded-3xl border border-[#d0d0d0] bg-white px-8 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#212121]">
                {selectedVideos.length === 3 ? "ready to generate!" : `${selectedVideos.length}/3 videos selected`}
              </h2>
              <p className="text-[#595959]">
                {selectedVideos.length === 3
                  ? "click generate to create your tiktok"
                  : "select 3 videos to continue"}
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={selectedVideos.length !== 3}
              className={`inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white shadow-lg transition ${
                selectedVideos.length === 3
                  ? "bg-[#32e979] hover:bg-[#22e58b]"
                  : "cursor-not-allowed bg-[#d0d0d0]"
              }`}
            >
              generate tiktok
            </button>
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
