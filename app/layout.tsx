import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "동물 친구들 배틀! 🦁",
  description: "귀여운 동물 친구들과 함께하는 재미있는 텍스트 배틀 게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-kid-cream to-kid-blue/20`}>
        {children}
      </body>
    </html>
  );
}