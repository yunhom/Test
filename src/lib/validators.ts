import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符').max(20, '用户名最多20个字符'),
  email: z.string().email('请输入有效邮箱'),
  password: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
});

export const loginSchema = z.object({
  email: z.string().email('请输入有效邮箱'),
  password: z.string().min(1, '请输入密码'),
});

export const productSchema = z.object({
  name: z.string().min(1, '请输入商品名称').max(100, '商品名称最多100个字符'),
  description: z.string().min(1, '请输入商品描述'),
  price: z.coerce.number().positive('价格必须大于0'),
  stock: z.coerce.number().int('库存必须为整数').nonnegative('库存不能为负数'),
  imageUrl: z.string().url('请输入有效URL').optional().or(z.literal('')),
  categoryId: z.coerce.number().int().positive('请选择分类'),
});

export const categorySchema = z.object({
  name: z.string().min(1, '请输入分类名称').max(50, '分类名称最多50个字符'),
  description: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
