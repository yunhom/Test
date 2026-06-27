'use client';

import { useState } from 'react';
import { createProduct, updateProduct } from '@/actions/product';
import type { Product, Category } from '@prisma/client';

interface Props {
  product?: Product;
  categories: Category[];
}

export default function ProductForm({ product, categories }: Props) {
  const [error, setError] = useState('');
  const isEdit = !!product;

  async function handleSubmit(formData: FormData) {
    setError('');
    const result = isEdit
      ? await updateProduct(product!.id, formData)
      : await createProduct(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">商品名称 *</label>
          <input
            name="name"
            defaultValue={product?.name}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
          <select
            name="categoryId"
            defaultValue={product?.categoryId}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
          >
            <option value="">请选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">价格 (¥) *</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={product?.price}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">库存 *</label>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">图片URL</label>
        <input
          name="imageUrl"
          type="url"
          defaultValue={product?.imageUrl || ''}
          placeholder="https://..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">商品描述 *</label>
        <textarea
          name="description"
          defaultValue={product?.description}
          required
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition cursor-pointer"
        >
          {isEdit ? '保存修改' : '创建商品'}
        </button>
        <a
          href="/admin/products"
          className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
        >
          取消
        </a>
      </div>
    </form>
  );
}
