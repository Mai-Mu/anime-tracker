'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
        个人中心
      </Link>
      <span className="text-muted-foreground">|</span>
      <button
        onClick={handleLogout}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        登出
      </button>
    </div>
  );
}
