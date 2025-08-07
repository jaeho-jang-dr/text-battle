import type { Metadata } from "next";
import "./globals.css";
import AdminButton from "@/components/AdminButton";
import MobileNavigation from "@/components/MobileNavigation";

export const metadata: Metadata = {
  title: "Kid Text Battle",
  description: "동물 데이터베이스 프로젝트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <div className="app-container">
          {children}
          <MobileNavigation />
          <AdminButton />
        </div>
      </body>
    </html>
  );
}