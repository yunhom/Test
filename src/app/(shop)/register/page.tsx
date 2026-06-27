'use client';

import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { register } from '@/actions/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const [error, setError] = useState('');

  if (!loading && user) {
    redirect('/');
  }

  async function handleSubmit(formData: FormData) {
    setError('');
    const result = await register(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-8">注册</h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
              placeholder="请输入用户名"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
              placeholder="请输入邮箱"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
              placeholder="请输入密码（至少6位）"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition cursor-pointer"
          >
            注册
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          已有账号？
          <Link href="/login" className="text-primary hover:underline ml-1">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
