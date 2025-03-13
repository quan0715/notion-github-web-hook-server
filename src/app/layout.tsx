import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Webhook 配置驗證工具",
  description: "驗證 GitHub 和 Notion 的 Webhook 配置",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <div className="container mx-auto p-4 max-w-6xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Webhook 配置驗證工具</h1>
            <p className="text-gray-500">
              驗證您的 GitHub 和 Notion 配置是否正確設置
            </p>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
