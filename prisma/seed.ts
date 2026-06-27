import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 创建管理员用户
  const adminHash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@minimall.com' },
    update: {},
    create: {
      email: 'admin@minimall.com',
      username: 'admin',
      passwordHash: adminHash,
      role: 'admin',
    },
  });

  // 创建示例分类
  const categories = await Promise.all([
    prisma.category.create({ data: { name: '电子产品', description: '手机、电脑、数码配件' } }),
    prisma.category.create({ data: { name: '服装鞋帽', description: '男装、女装、鞋子、帽子' } }),
    prisma.category.create({ data: { name: '食品饮料', description: '零食、饮料、生鲜' } }),
    prisma.category.create({ data: { name: '家居用品', description: '家具、厨具、家纺' } }),
  ]);

  // 创建示例商品
  const products = [
    { name: '无线蓝牙耳机', description: '高音质降噪蓝牙耳机，续航24小时，佩戴舒适', price: 299, stock: 100, imageUrl: 'https://picsum.photos/seed/earphone/400/400', categoryId: categories[0].id },
    { name: '机械键盘', description: '青轴机械键盘，RGB背光，87键紧凑设计', price: 459, stock: 50, imageUrl: 'https://picsum.photos/seed/keyboard/400/400', categoryId: categories[0].id },
    { name: '男士休闲T恤', description: '纯棉圆领短袖T恤，多色可选，舒适透气', price: 89, stock: 200, imageUrl: 'https://picsum.photos/seed/tshirt/400/400', categoryId: categories[1].id },
    { name: '运动跑鞋', description: '轻便透气跑步鞋，减震防滑，适合日常运动', price: 359, stock: 80, imageUrl: 'https://picsum.photos/seed/shoes/400/400', categoryId: categories[1].id },
    { name: '有机坚果礼盒', description: '每日坚果混合装，750g，含核桃、杏仁、腰果等', price: 128, stock: 150, imageUrl: 'https://picsum.photos/seed/nuts/400/400', categoryId: categories[2].id },
    { name: '不锈钢保温杯', description: '316不锈钢保温杯，500ml，12小时保温，便携设计', price: 79, stock: 300, imageUrl: 'https://picsum.photos/seed/cup/400/400', categoryId: categories[3].id },
    { name: '手机充电器快充', description: '65W氮化镓快充头，兼容多种协议，小巧便携', price: 149, stock: 120, imageUrl: 'https://picsum.photos/seed/charger/400/400', categoryId: categories[0].id },
    { name: '女士帆布包', description: '大容量帆布单肩包，简约时尚，日常通勤必备', price: 169, stock: 90, imageUrl: 'https://picsum.photos/seed/bag/400/400', categoryId: categories[1].id },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ 种子数据已创建：管理员用户、4 个分类、8 个商品');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
