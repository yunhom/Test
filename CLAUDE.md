# Mini Mall（迷你商城）

微型电商演示项目，覆盖完整的电商核心流程：商品浏览 → 注册登录 → 购物车 → 下单支付 → 订单管理 → 后台管理。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16 |
| 语言 | TypeScript | 5 |
| ORM | Prisma | 5 |
| 数据库 | SQLite | — |
| 样式 | TailwindCSS | 4 |
| 密码 | bcryptjs | 3 |
| 校验 | Zod | 4 |

## 项目结构

```
mini_mall/
├── prisma/
│   ├── schema.prisma          # 7 个模型：User/Category/Product/CartItem/Order/OrderItem/Session
│   └── seed.ts                # 管理员 + 4 个分类 + 8 个示例商品
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 根布局：<html> + <body> + ToastProvider
│   │   ├── (shop)/            # 用户端路由组
│   │   │   ├── layout.tsx     # AuthProvider + CartProvider + Navbar + Footer
│   │   │   ├── page.tsx       # 首页（Hero + 分类 + 推荐商品）
│   │   │   ├── products/      # 商品列表（?search=&category=&page=）/ 商品详情
│   │   │   ├── cart/          # 购物车
│   │   │   ├── checkout/      # 结算确认 → 模拟支付
│   │   │   ├── orders/        # 订单列表 / 订单详情 + 支付/取消
│   │   │   ├── login/         # 登录
│   │   │   └── register/      # 注册
│   │   └── admin/             # 后台管理
│   │       ├── layout.tsx     # requireAdmin() + AdminSidebar + AdminHeader
│   │       ├── page.tsx       # 仪表盘（统计卡片 + 最近订单）
│   │       ├── login/         # 管理员登录
│   │       ├── products/      # 商品 CRUD（列表/新建/编辑）
│   │       ├── categories/    # 分类管理（列表 + 行内新增）
│   │       └── orders/        # 订单管理（状态筛选 + 详情 + 状态更新）
│   ├── actions/               # Server Actions（'use server'）
│   │   ├── auth.ts            # login, register, logout, getCurrentUser
│   │   ├── cart.ts            # addToCart, removeFromCart, updateQuantity, getCart, clearCart
│   │   ├── order.ts           # createOrder, payOrder, cancelOrder, getOrders, getOrder, updateOrderStatus
│   │   ├── product.ts         # createProduct, updateProduct, deleteProduct
│   │   └── category.ts        # createCategory, updateCategory, deleteCategory
│   ├── lib/
│   │   ├── prisma.ts          # PrismaClient 全局单例（globalThis 缓存）
│   │   ├── auth.ts            # hashPassword, verifyPassword, createSession, validateSession, requireAuth, requireAdmin
│   │   ├── cookie.ts          # session_token cookie 读写（httpOnly, SameSite=Lax, 7天）
│   │   └── validators.ts      # Zod schemas（register, login, product, category）
│   ├── context/
│   │   ├── AuthContext.tsx     # 用户状态，登录/登出后 refresh()
│   │   ├── CartContext.tsx     # 购物车状态，挂载时 getCart()，变更后 refresh()
│   │   └── ToastContext.tsx    # toast 通知队列（3秒自动消失）
│   ├── components/
│   │   ├── layout/            # Navbar（购物车数量徽标 + 用户下拉菜单）, Footer, AdminSidebar, AdminHeader
│   │   ├── shop/              # ProductCard, ProductGrid, ProductSearch, CategoryFilter,
│   │   │                        AddToCartButton, CartItemRow, CartSummary, OrderCard, OrderStatusBadge
│   │   ├── admin/             # ProductForm, ProductTable, DeleteProductButton
│   │   └── ui/                # Pagination
│   ├── middleware.ts           # /admin/* 路由保护：检查 session cookie，无则重定向
│   └── types/index.ts         # 共享类型定义
```

## 架构设计

### Server / Client 边界

默认 Server Component。仅以下情况加 `'use client'`：
- 需要 `useState/useEffect/useContext`
- 有事件处理（onClick/onSubmit/onChange）
- 需要浏览器 API

Server 页面直接 `await prisma.model.findMany()` 查库，不经过 API Route 中转。Client 页面通过 Server Actions 写数据。

### 数据流

```
Server Components  ──直接查库──→  Prisma  ──→  SQLite
Client Components  ──Server Actions──→  Prisma  ──→  SQLite
                   ←──redirect/refresh──
```

搜索/筛选/分页通过 URL searchParams 传递（`?search=&category=&page=`），页面自动重新渲染。

### 认证

1. 注册/登录 → bcrypt 哈希 → 创建 Session 行 → 设 httpOnly cookie `session_token`
2. 每次请求：`validateSession()` 读 cookie → 查 Session 表 → 校验过期时间
3. 登出：删 Session 行 + 清 cookie
4. 管理端：middleware 检查 cookie 存在 → Server Component 调 `requireAdmin()` 验证 role

### 订单状态流转

```
pending ──支付──→ paid ──发货──→ shipped ──收货──→ completed
   │                 │
   └──取消──→ cancelled  ←──取消──┘
```

- `createOrder` 使用 Prisma 事务：创建订单 → 扣库存 → 清购物车（原子操作）
- 取消订单恢复库存
- OrderItem 冗余 productName/productPrice，保证历史数据准确

### 购物车

- 数据库持久化 + React Context 双层同步
- `CartItem` 使用 `@@unique([userId, productId])`，重复加购只更新数量
- 每次增删改：先调 Server Action 写库 → 再 `refresh()` 拉最新数据

## 数据库

Provider: SQLite，连接串 `DATABASE_URL="file:./dev.db"`

```
User       id, email@unique, username@unique, passwordHash, role[customer|admin], timestamps
Category   id, name@unique, description?, timestamps
Product    id, name, description, price:Float, stock:Int, imageUrl?, categoryId→Category, timestamps
CartItem   id, userId→User, productId→Product, quantity, @@unique([userId,productId])
Order      id, userId→User, status[pending|paid|shipped|completed|cancelled], totalAmount, timestamps
OrderItem  id, orderId→Order, productId→Product, productName, productPrice, quantity
Session    id@uuid, userId→User, expiresAt, createdAt
```

## 常用命令

```bash
npm run dev          # 启动开发服务器（localhost:3000）
npm run build        # 生产构建
npm run db:push      # 同步 schema 到 SQLite
npm run db:seed      # 运行种子数据
npm run db:studio    # Prisma Studio 可视化管理
npx prisma generate  # 重新生成 Prisma Client
```

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@minimall.com | admin123 |
| 用户 | 自行注册 | — |

## 关键约定

- UI 文本：中文；代码标识符：英文
- 所有表单提交前通过 Zod schema 校验，返回 `{ error: string }` 或 void
- `redirect()` 用于 Server Action 成功后的页面跳转
- `revalidatePath()` 用于数据变更后刷新相关页面缓存
- `searchParams` 在 Next.js 16 中为 `Promise<T>`，需 `await`
- 图片使用 URL 方式存储，`<Image unoptimized>` 避免外部 URL 优化报错，带 `onError` 回退
- TailwindCSS 4 使用 CSS-first 配置（`@theme` 在 globals.css），无 tailwind.config.js
- Prisma 锁定 v5，v6+ 有破坏性变更需要 adapter

<!-- superpowers-zh:begin (do not edit between these markers) -->
# Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（20 个 skills）。

## 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **测试先于实现** — 写代码前先写测试（TDD）
4. **验证先于完成** — 声称完成前必须运行验证命令

## 可用 Skills

Skills 位于 `.claude/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。在实现之前先探索用户意图、需求和设计。
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **dispatching-parallel-agents**: 当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **executing-plans**: 当你有一份书面实现计划需要在单独的会话中执行，并设有审查检查点时使用
- **finishing-a-development-branch**: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 当在当前会话中执行包含独立任务的实现计划时使用
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 在实现任何功能或修复 bug 时使用，在编写实现代码之前
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发，或在执行实现计划之前使用——通过原生工具或 git worktree 回退机制确保隔离工作区存在
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在宣称工作完成、已修复或测试通过之前使用，在提交或创建 PR 之前——必须运行验证命令并确认输出后才能声称成功；始终用证据支撑断言
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 当你有规格说明或需求用于多步骤任务时使用，在动手写代码之前
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

## 如何使用

当任务匹配某个 skill 时，使用 `Skill` 工具加载对应 skill 并严格遵循其流程。绝不要用 Read 工具读取 SKILL.md 文件。

如果你认为哪怕只有 1% 的可能性某个 skill 适用于你正在做的事情，你必须调用该 skill 检查。
<!-- superpowers-zh:end -->
