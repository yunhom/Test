'use client';

import { useState } from 'react';
import { deleteCategory } from '@/actions/category';
import { useRouter } from 'next/navigation';

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  productCount,
}: {
  categoryId: number;
  categoryName: string;
  productCount: number;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleDelete() {
    setError('');
    const result = await deleteCategory(categoryId);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
      setShowConfirm(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-danger hover:underline text-xs cursor-pointer"
      >
        删除
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 mx-4 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">确认删除</h3>
            <p className="text-sm text-gray-500 mb-2">
              确定要删除分类「{categoryName}」吗？
            </p>
            {productCount > 0 && (
              <p className="text-sm text-warning mb-4">
                该分类下有 {productCount} 件商品，请先将商品移至其他分类。
              </p>
            )}
            {error && (
              <p className="text-sm text-danger mb-4">{error}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-danger text-white rounded-lg hover:bg-red-600 cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
