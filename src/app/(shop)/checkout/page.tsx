'use client';

import { useAuth } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';
import { useState, useTransition } from 'react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';
import WechatPayModal from '@/components/shop/WechatPayModal';
import { createOrder } from '@/actions/order';

type WechatPayInfo = {
  payNo: string;
  amount: number;
  orderId: number;
};

function CheckoutContent() {
  const { items, totalAmount, loading, refresh } = useCart();
  const [payInfo, setPayInfo] = useState<WechatPayInfo | null>(null);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        const result = await createOrder();

        if (result?.error) {
          setError(result.error);
          return;
        }

        if (result?.order && result?.wechatPay) {
          setPayInfo({
            payNo: result.wechatPay.payNo,
            amount: result.wechatPay.amount,
            orderId: result.order.id,
          });
          await refresh();
        } else {
          setError('创建订单失败，请重试');
        }
      } catch (err) {
        setError('系统错误: ' + String(err));
      }
    });
  }

  function handlePayClose() {
    // 先导航再清状态：导航会卸载组件，避免 setPayInfo(null) 触发 redirect('/cart')
    const orderId = payInfo?.orderId;
    if (orderId) {
      router.push(`/orders/${orderId}`);
    } else {
      setPayInfo(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // 订单已创建正在显示支付弹窗时，不重定向
  if (items.length === 0 && !payInfo) {
    redirect('/cart');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">确认订单</h1>

      {/* 商品明细 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 font-medium text-gray-900">
          商品明细
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className="px-6 py-4 flex items-center justify-between border-b border-gray-50"
          >
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900">{item.product.name}</span>
              <span className="text-gray-400 ml-2">×{item.quantity}</span>
            </div>
            <span className="text-gray-700 shrink-0 ml-4">
              ¥{(item.product.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* 金额汇总 */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex justify-between text-lg font-bold">
          <span>合计</span>
          <span className="text-danger">¥{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* 支付方式 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h3 className="font-medium text-gray-900 mb-4">支付方式</h3>
        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#07C160] bg-green-50/30">
          <div className="w-10 h-10 bg-[#07C160] rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">微信支付</div>
            <div className="text-xs text-gray-400">微信安全支付</div>
          </div>
          <svg className="w-5 h-5 text-[#07C160]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm">
          {error}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <Link
          href="/cart"
          className="flex-1 py-3 text-center border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition"
        >
          返回购物车
        </Link>
        <form onSubmit={handleSubmit} className="flex-1">
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-[#07C160] text-white rounded-xl font-medium hover:bg-[#06AD56] disabled:opacity-50 transition cursor-pointer"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                创建订单...
              </span>
            ) : (
              '微信支付'
            )}
          </button>
        </form>
      </div>

      {/* 微信支付弹窗 */}
      {payInfo && (
        <WechatPayModal
          payInfo={payInfo}
          onClose={handlePayClose}
        />
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    redirect('/login');
  }

  return (
    <CartProvider>
      <CheckoutContent />
    </CartProvider>
  );
}
