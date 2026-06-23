import Script from "next/script";

export default function AdSense() {
  return (
    <Script
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6476019148864560"
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  );
}
