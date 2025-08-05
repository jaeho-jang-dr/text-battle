import type { Metadata } from "next";
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
      <head>
        <style>{`
          * {
            box-sizing: border-box;
            padding: 0;
            margin: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
          }
        `}</style>
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <AdminButton />
        </AuthProvider>
      </body>
    </html>
  );
}