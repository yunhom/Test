'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/actions/auth';
import { useState, useCallback } from 'react';

const navItems = [
  { href: '/admin', label: '仪表盘', icon: '📊' },
  { href: '/admin/products', label: '商品管理', icon: '📦' },
  { href: '/admin/categories', label: '分类管理', icon: '🏷️' },
  { href: '/admin/orders', label: '订单管理', icon: '📋' },
];

export default function AdminSidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      window.location.href = '/';
    }
  }, []);

  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-gray-900 text-white flex flex-col z-40">
      <div className="px-6 py-5 border-b border-gray-800">
        <Link href="/admin" className="text-lg font-bold">
          迷你商城 后台
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        <hr className="my-2 border-gray-800" />
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
        >
          <span>🏪</span>
          <span>返回商城</span>
        </Link>
      </nav>

      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{username}</span>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs text-gray-500 hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            {loggingOut ? '退出中...' : '退出'}
          </button>
        </div>
      </div>
    </aside>
  );
}
