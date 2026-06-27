'use client';

import { useState } from 'react';
import { deleteProduct } from '@/actions/product';
import { useRouter } from 'next/navigation';

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    await deleteProduct(productId);
    router.refresh();
    setShowConfirm(false);
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
            <p className="text-sm text-gray-500 mb-6">
              确定要删除商品「{productName}」吗？此操作不可撤销。
            </p>
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
