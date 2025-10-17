import fs from "fs/promises";
import Head from "next/head";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import path from "path";

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
  return (
    <>
      <Head>
        <div dangerouslySetInnerHTML={{ __html: headHtml }} />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
