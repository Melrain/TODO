# shadcn/ui 组件管理指南

## 项目状态

✅ 项目已经配置并使用了 shadcn/ui！

当前配置：
- **样式**: New York
- **React Server Components**: 已启用
- **图标库**: Lucide React
- **主题**: 支持深色/浅色模式

## 已安装的组件

项目已经安装了以下 shadcn/ui 组件：
- Button, Card, Dialog, Select, Input, Textarea
- Badge, Dropdown Menu, Label
- Skeleton, Empty
- 以及其他 50+ 组件

## 添加新组件

使用以下命令添加新的 shadcn/ui 组件：

```bash
# 添加单个组件
npx shadcn@latest add [component-name]

# 示例：添加 Alert 组件
npx shadcn@latest add alert

# 示例：添加 Table 组件
npx shadcn@latest add table

# 示例：添加 Tabs 组件
npx shadcn@latest add tabs
```

## 更新现有组件

更新组件到最新版本：

```bash
# 更新所有组件
npx shadcn@latest diff

# 更新特定组件
npx shadcn@latest add [component-name] --overwrite
```

## 查看可用组件

访问 [shadcn/ui 官网](https://ui.shadcn.com/docs/components) 查看所有可用组件。

## 常用组件推荐

以下组件可能对项目有用：

```bash
# 表单相关
npx shadcn@latest add form
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group

# 数据展示
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add accordion

# 反馈
npx shadcn@latest add alert
npx shadcn@latest add toast
npx shadcn@latest add progress

# 导航
npx shadcn@latest add breadcrumb
npx shadcn@latest add pagination
```

## 组件位置

所有 shadcn/ui 组件位于：
```
components/ui/
```

## 使用示例

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
```

## 自定义主题

主题颜色在 `app/globals.css` 中定义，使用 CSS 变量：
- `--background`
- `--foreground`
- `--primary`
- 等等...

## 更多信息

- [shadcn/ui 文档](https://ui.shadcn.com)
- [组件列表](https://ui.shadcn.com/docs/components)
- [主题定制](https://ui.shadcn.com/themes)
