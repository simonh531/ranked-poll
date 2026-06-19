import {
  Html, Head, Main, NextScript,
} from 'next/document';

const description = 'Instantly create and share ranked vote polls! Learn about ranked voting and its uses. Free and no sign up needed! Open Source!';

const structuredData = {
  __html: `{
    "@context" : "http://schema.org",
    "@type" : "Organization",
    "logo" : "https://rankedpoll.com/android-chrome-512x512.png",
    "url" : "https://rankedpoll.com",
    "name" : "Ranked Poll",
    "description" : "${description}",
    "email" : "contact@rankedpoll.com"
  }`,
};

function Document() {
  return (
    <Html>
      <Head>
        <meta charSet="UTF-8" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather&family=Open+Sans:wght@400;700&family=Righteous&display=swap" rel="stylesheet" />
        <meta property="og:site_name" content="Ranked Poll" key="ogsitename" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="description" key="description" content={description} />
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={structuredData} />
        {/* <meta property="og:image" content={previewImage} key="ogimage" /> */}
        <meta property="og:url" content="rankedpoll.com" key="ogurl" />
        <meta property="og:title" content="Ranked Poll" key="ogtitle" />
        <meta property="og:description" content={description} key="ogdesc" />
        <link rel="canonical" href="https://rankedpoll.com" key="canonical" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;
