import type { Metadata } from "next";
import "./globals.css";
import AdminButton from "../components/AdminButton";
import { AuthProvider } from "../contexts/AuthContext";

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
      <body className="min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <AdminButton />
        </AuthProvider>
      </body>
    </html>
  );
}