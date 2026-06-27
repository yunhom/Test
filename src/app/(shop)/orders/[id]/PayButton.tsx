'use client';

import { useState } from 'react';
import WechatPayModal from '@/components/shop/WechatPayModal';

export default function PayButton({ orderId, amount }: { orderId: number; amount: number }) {
  const [showModal, setShowModal] = useState(false);

  const payInfo = {
    payNo: `WX${orderId}`,
    amount,
    orderId,
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-2.5 bg-[#07C160] text-white rounded-xl font-medium hover:bg-[#06AD56] transition cursor-pointer"
      >
        微信支付
      </button>

      {showModal && (
        <WechatPayModal
          payInfo={payInfo}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
