import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* These meta tags help ensure SharedArrayBuffer works in browsers */}
        <meta httpEquiv="Cross-Origin-Embedder-Policy" content="require-corp" />
        <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 