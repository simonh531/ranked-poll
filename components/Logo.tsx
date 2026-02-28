import { Righteous } from "next/font/google";

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-righteous",
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
