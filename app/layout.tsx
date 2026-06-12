import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '追番记录',
  description: '个人追番记录网站',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto py-3 flex items-center gap-6">
            <Link href="/" className="text-lg font-bold">追番记录</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">首页</Link>
              <Link href="/season" className="text-muted-foreground hover:text-foreground transition-colors">新番</Link>
              <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">搜索</Link>
              <Link href="/timeline" className="text-muted-foreground hover:text-foreground transition-colors">时间线</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
