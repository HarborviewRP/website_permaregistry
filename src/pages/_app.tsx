import { AppProps } from "next/app";
import Head from "next/head";
import Layout from "src/components/layout";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const renderWithLayout =
    (Component as any).getLayout ||
    function (page: any) {
      return (
        <>
          <Head>
            <meta charSet="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, shrink-to-fit=no"
            />
            <meta
              property="og:image"
              content="/public/vercel.svg"
              key="og-image"
            />
            <link rel="icon" href="/public/vercel.svg" />
            <meta property="og:image:width" content="64" />
            <meta property="og:image:height" content="64" />
            <title>HRP - Perma Death Registry</title>
            <link rel="icon" type="image/x-icon" href="https://cdn.discordapp.com/attachments/557354039344496669/1091551857224188054/Site-logo.ico" />
          </Head>
          <Layout user={null}>{page}</Layout>
        </>
      );
    };
  return renderWithLayout(<Component {...pageProps} />);
  // return (
  //   <>
  //     <Head>
  //       <meta charSet="utf-8" />
  //       <meta
  //         name="viewport"
  //         content="width=device-width, initial-scale=1, shrink-to-fit=no"
  //       />
  //       <meta property="og:image" content="/public/vercel.svg" key="og-image" />
  //       <link rel="icon" href="/public/vercel.svg" />
  //       <meta property="og:image:width" content="64" />
  //       <meta property="og:image:height" content="64" />
  //     </Head>
  //     <Layout>
  //       <Component {...pageProps} />
  //     </Layout>
  //   </>
  // );
}
