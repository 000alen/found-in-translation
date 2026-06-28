import { Source_Serif_4 } from "next/font/google";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-poetry",
  display: "swap",
});

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`reader-layout w-full max-w-none ${sourceSerif.variable}`}>
      {children}
    </div>
  );
}
