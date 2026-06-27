'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { wechatPayOrder } from '@/actions/order';
import { useRouter } from 'next/navigation';

type WechatPayInfo = {
  payNo: string;
  amount: number;
  orderId: number;
};

type Props = {
  payInfo: WechatPayInfo;
  onClose: () => void;
  redirectTo?: string;
};

export default function WechatPayModal({ payInfo, onClose, redirectTo }: Props) {
  const [step, setStep] = useState<'qrcode' | 'paying' | 'success' | 'failed'>('qrcode');
  const [countdown, setCountdown] = useState(300); // 5分钟倒计时
  const [error, setError] = useState('');
  const router = useRouter();

  // 倒计时
  useEffect(() => {
    if (step !== 'qrcode') return;
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, countdown]);

  // 使用 payNo 作为种子生成确定性 QR 码图案，避免 re-render 闪烁
  const qrDots = useMemo(() => {
    const seed = hashString(payInfo.payNo);
    return Array.from({ length: 120 }).map((_, i) => {
      const row = Math.floor(i / 14);
      const col = i % 14;
      const isCorner =
        (row < 5 && col < 5) ||
        (row < 5 && col > 8) ||
        (row > 8 && col < 5);
      if (isCorner) return null;

      const pseudoRandom = ((seed * (i + 1) * 7919) % 10000) / 10000;
      const x = 40 + col * 10 + pseudoRandom * 4;
      const y = 6 + row * 14 + (1 - pseudoRandom) * 4;
      const size = pseudoRandom > 0.4 ? 6 : 3;
      const fill = pseudoRandom > 0.5 ? '#07C160' : '#1a1a1a';
      return <rect key={i} x={x} y={y} width={size} height={size} fill={fill} rx={0.5} />;
    });
  }, [payInfo.payNo]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 模拟扫码支付
  const handleSimulatePay = useCallback(async () => {
    setStep('paying');
    setError('');

    // 模拟支付处理延迟
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = await wechatPayOrder(payInfo.orderId);
    if (result?.error) {
      setError(result.error);
      setStep('failed');
    } else {
      setStep('success');
      setTimeout(() => {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push(`/orders/${payInfo.orderId}`);
        }
      }, 1500);
    }
  }, [payInfo.orderId, redirectTo, router]);

  // 超时处理
  useEffect(() => {
    if (countdown === 0 && step === 'qrcode') {
      setStep('failed');
      setError('二维码已过期，请重新下单');
    }
  }, [countdown, step]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#07C160] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            <span className="text-white font-medium">微信支付</span>
          </div>
          {step === 'qrcode' && (
            <button onClick={onClose} className="text-white/80 hover:text-white text-sm cursor-pointer">
              取消
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'qrcode' && (
            <>
              {/* 金额 */}
              <div className="text-center mb-6">
                <div className="text-sm text-gray-400 mb-1">支付金额</div>
                <div className="text-4xl font-bold text-gray-900">
                  ¥{payInfo.amount.toFixed(2)}
                </div>
              </div>

              {/* 模拟二维码 */}
              <div className="flex justify-center mb-6">
                <div className="relative w-56 h-56 border-4 border-[#07C160] rounded-2xl p-3 bg-white">
                  {/* 二维码图案 */}
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* 定位图案 - 三个角 */}
                    {[[0, 0], [160, 0], [0, 160]].map(([x, y], i) => (
                      <g key={i} transform={`translate(${x},${y})`}>
                        <rect x="0" y="0" width="40" height="40" fill="#07C160" rx="4" />
                        <rect x="6" y="6" width="28" height="28" fill="white" rx="2" />
                        <rect x="12" y="12" width="16" height="16" fill="#07C160" rx="1" />
                      </g>
                    ))}

                    {/* 数据点 - 由种子确定性生成 */}
                    {qrDots}

                    {/* 中心微信logo */}
                    <rect x="85" y="85" width="30" height="30" fill="#07C160" rx="4" />
                    <circle cx="100" cy="95" r="5" fill="white" />
                    <path
                      d="M88 105 Q95 98 100 105 Q105 98 112 105"
                      stroke="white"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* 过期遮罩 */}
                  <div className="absolute inset-0 bg-black/5 rounded-2xl pointer-events-none" />
                </div>
              </div>

              {/* 提示信息 */}
              <div className="text-center space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4 text-[#07C160]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m4-6c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z" />
                  </svg>
                  <span>请使用微信扫一扫付款</span>
                </div>
                <div className="text-xs text-gray-400">
                  二维码有效期 <span className="text-warning">{formatTime(countdown)}</span>
                </div>
              </div>

              {/* 模拟支付按钮 */}
              <button
                onClick={handleSimulatePay}
                className="w-full py-3 bg-[#07C160] text-white rounded-xl font-medium hover:bg-[#06AD56] transition cursor-pointer text-lg"
              >
                确认支付 ¥{payInfo.amount.toFixed(2)}
              </button>
              <p className="text-xs text-gray-300 text-center mt-2">
                * 演示环境，点击按钮模拟扫码支付
              </p>
            </>
          )}

          {step === 'paying' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 border-4 border-[#07C160] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <p className="text-gray-600 font-medium">正在支付...</p>
              <p className="text-sm text-gray-400 mt-1">请稍候</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-[#07C160] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-900 font-bold text-lg">支付成功</p>
              <p className="text-sm text-gray-400 mt-1">正在跳转订单详情...</p>
            </div>
          )}

          {step === 'failed' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-900 font-bold text-lg">支付失败</p>
              <p className="text-sm text-gray-400 mt-1">{error || '请重试'}</p>
              <div className="mt-6 flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    setStep('qrcode');
                    setCountdown(300);
                    setError('');
                  }}
                  className="px-6 py-2 bg-[#07C160] text-white rounded-lg hover:bg-[#06AD56] transition cursor-pointer"
                >
                  重新支付
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 简单的字符串哈希（确定性，用于 QR 码种子）
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
