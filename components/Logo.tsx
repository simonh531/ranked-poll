import { Righteous } from "next/font/google";

const righteous = Righteous({
  subsets: ["latin"],
  variable: "--font-righteous",
  weight: "400",
});

export default function Logo({
  className,
}: Readonly<{
  className?: string;
}>) {
  return (
    <div className={`${righteous.className} ${className || ""}`}>
      Ranked Poll
    </div>
  );
}
