'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { logout } from '@/actions/auth';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, loading } = useAuth();
  const { itemCount } = useCart();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-primary">
            迷你商城
          </Link>
          <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900 transition">
            全部商品
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative text-sm text-gray-600 hover:text-primary transition"
          >
            购物车
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-4 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {loading ? (
            <div className="w-16 h-8 bg-gray-100 animate-pulse rounded" />
          ) : user ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-primary transition cursor-pointer"
              >
                <span className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                  {user.username[0].toUpperCase()}
                </span>
                <span>{user.username}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMenu(false)}
                  >
                    我的订单
                  </Link>
                  <button
                    onClick={() => { setShowMenu(false); logout(); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm text-gray-600 hover:text-primary transition">
                登录
              </Link>
              <Link
                href="/register"
                className="text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
