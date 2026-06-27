'use client';

import { useState } from 'react';
import { createCategory } from '@/actions/category';
import { useRouter } from 'next/navigation';

export default function CategoryForm() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError('');
    setSuccess('');
    const result = await createCategory(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess('分类已添加');
      router.refresh();
      setTimeout(() => setSuccess(''), 3000);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-4">添加新分类</h3>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-success/10 text-success text-sm">{success}</div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类名称 *</label>
          <input
            name="name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <input
            name="description"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition cursor-pointer"
        >
          添加分类
        </button>
      </form>
    </div>
  );
}
