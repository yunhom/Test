import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import OrderStatusBadge from '@/components/shop/OrderStatusBadge';
import PayButton from './PayButton';
import CancelButton from './CancelButton';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return { title: `订单 #${(await params).id}` };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id: Number(id), userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  const statusSteps = ['pending', 'paid', 'shipped', 'completed'];
  const currentStep = order.status === 'cancelled' ? -1 : statusSteps.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">订单详情</h1>
        <Link
          href="/orders"
          className="text-sm text-primary hover:underline"
        >
          ← 返回订单列表
        </Link>
      </div>

      {/* 订单信息 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm text-gray-400 mr-2">订单号</span>
            <span className="font-bold text-gray-900">#{order.id}</span>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* 状态时间线 */}
        {order.status !== 'cancelled' && (
          <div className="flex items-center gap-2 py-4">
            {statusSteps.map((step, i) => {
              const labels: Record<string, string> = {
                pending: '待支付',
                paid: '已支付',
                shipped: '已发货',
                completed: '已完成',
              };
              const done = i <= currentStep;
              return (
                <div key={step} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        done ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </div>
                    <span
                      className={`text-xs mt-1 whitespace-nowrap ${
                        done ? 'text-primary' : 'text-gray-400'
                      }`}
                    >
                      {labels[step]}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        i < currentStep ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="py-4 text-center text-gray-400 text-sm">
            该订单已取消
          </div>
        )}
      </div>

      {/* 商品列表 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 font-medium">商品明细</div>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="px-6 py-4 flex items-center justify-between border-b border-gray-50"
          >
            <div>
              <Link
                href={`/products/${item.productId}`}
                className="font-medium text-gray-900 hover:text-primary transition"
              >
                {item.productName}
              </Link>
              <span className="text-gray-400 ml-2">×{item.quantity}</span>
            </div>
            <span className="text-gray-700">
              ¥{(item.productPrice * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="px-6 py-4 flex justify-between font-bold text-lg">
          <span>合计</span>
          <span className="text-danger">¥{order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        {order.status === 'pending' && (
          <>
            <PayButton orderId={order.id} />
            <CancelButton orderId={order.id} />
          </>
        )}
        {order.status === 'paid' && (
          <p className="text-sm text-gray-400">等待管理员发货...</p>
        )}
        {order.status === 'shipped' && (
          <p className="text-sm text-gray-400">商品已发货，请留意收货</p>
        )}
        <p className="text-sm text-gray-400 self-center">
          下单时间：{order.createdAt.toLocaleString('zh-CN')}
        </p>
      </div>
    </div>
  );
}
