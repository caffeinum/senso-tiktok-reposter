import fs from "fs/promises";
import Head from "next/head";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import path from "path";
import { useEffect } from "react";

type Props = {
  headHtml: string;
  bodyHtml: string;
};

const BASE_URL = "https://top-tasks-865976.framer.app";

export const getStaticProps: GetStaticProps<Props> = async () => {
  const filePath = path.join(process.cwd(), "public", "reference", "2.html");
  const rawHtml = await fs.readFile(filePath, "utf8");

  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  const headHtml = headMatch?.[1] ?? "";
  let bodyHtml = bodyMatch?.[1] ?? "";

  bodyHtml = bodyHtml.replace(new RegExp(`${BASE_URL}/2`, "g"), "/start");
  bodyHtml = bodyHtml.replace(new RegExp(`${BASE_URL}/?`, "g"), "/");

  return {
    props: {
      headHtml,
      bodyHtml,
    },
  };
};

export default function StartPage({
  headHtml,
  bodyHtml,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const containers = Array.from(
      document.querySelectorAll<HTMLElement>(".framer-1nu9mg4-container"),
    );

    containers.forEach((container) => {
      if (container.dataset.keywordHydrated === "true") return;

      container.innerHTML = "";
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Add keywords (comma separated)";
      input.setAttribute("aria-label", "Brand keywords");
      input.style.width = "100%";
      input.style.padding = "18px 24px";
      input.style.borderRadius = "999px";
      input.style.border = "1px solid rgba(33, 33, 33, 0.1)";
      input.style.backgroundColor = "rgba(255,255,255,0.8)";
      input.style.boxShadow =
        "inset 0 1px 2px rgba(0,0,0,0.04), 0 8px 18px rgba(33,33,33,0.08)";
      input.style.fontFamily = "'Inter', sans-serif";
      input.style.fontSize = "16px";
      input.style.fontWeight = "500";
      input.style.color = "#212121";
      input.style.outline = "none";
      input.style.transition = "border 120ms ease, box-shadow 120ms ease";

      input.addEventListener("focus", () => {
        input.style.border = "1px solid rgba(33, 33, 33, 0.3)";
        input.style.boxShadow =
          "0 0 0 3px rgba(50, 233, 121, 0.35), 0 12px 24px rgba(33,33,33,0.12)";
      });
      input.addEventListener("blur", () => {
        input.style.border = "1px solid rgba(33, 33, 33, 0.1)";
        input.style.boxShadow =
          "inset 0 1px 2px rgba(0,0,0,0.04), 0 8px 18px rgba(33,33,33,0.08)";
      });

      container.appendChild(input);
      container.dataset.keywordHydrated = "true";
    });
  }, [bodyHtml]);

  return (
    <>
      <Head>
        <div dangerouslySetInnerHTML={{ __html: headHtml }} />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
