# 数据可视化系统文档

## 概述

本项目的数据可视化系统通过 HTML 注释标记和 D3.js 实现了自动化的表格数据可视化。无需手动编写图表代码，只需在 Markdown 表格前后添加特殊注释标记，系统会自动解析表格数据并渲染对应的图表。

## 系统架构

```
┌─────────────────┐
│   Markdown 文档  │
│   (表格 + 标记)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  D3.js 渲染引擎  │
│  (解析 + 渲染)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   交互式图表     │
│   (用户可见)     │
└─────────────────┘
```

## 标记语法

### 基本格式

```html
<!-- VISUALIZATION: <id> type="<图表类型>" data="<数据ID>" -->

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 值1 | 值2 | 值3 |

<!-- END-VISUALIZATION -->
```

### 参数说明

- `VISUALIZATION`: 必须关键字
- `<id>`: 可视化唯一标识符（如：basic-info, physical-attributes）
- `type`: 图表类型
  - `grouped-bar`: 分组柱状图（多指标对比）
  - `radar-chart`: 雷达图（多维属性对比）
  - `bar`: 普通柱状图（默认）
- `data`: 数据标识符（用作容器 ID）

### 示例

```html
<!-- VISUALIZATION: population-dynamics type="grouped-bar" data="race-population-dynamics" -->

| 种族 | 增长率 | 最大人口 | 移民率 |
|------|--------|----------|--------|
| 人类 | 0.075 | 0.9 | 1.5 |

<!-- END-VISUALIZATION -->
```

## 数据解析机制

### 单元格值解析规则

系统自动识别并转换以下数据格式：

| 格式示例 | 解析结果 | 类型 |
|---------|---------|------|
| `3x` | `{ type: 'multiply', value: 3, raw: '3x' }` | 乘法加成 |
| `+240` | `{ type: 'add', value: 240, raw: '+240' }` | 加法加成 |
| `0.5` | `0.5` | 数值 |
| `✓` / `√` | `true` | 布尔 |
| `是` | `true` | 布尔（中文） |
| `...` / `—` | `null` | 空值 |
| （空字符串） | `null` | 空值 |

### 表格结构要求

1. **第一行必须是表头**：定义列名
2. **第一列通常为标签列**：如"种族"
3. **后续列为数值列**：待可视化的数据

## 图表类型

### 1. 分组柱状图 (grouped-bar)

**用途**：多指标对比，每个指标独立显示为一行水平条形图

**适用场景**：
- 种族基本属性对比（身高、价格、成年时间）
- 人口动态对比（增长率、最大人口、移民率）
- 物理属性对比（体重、速度、健康等）

**特点**：
- 每个指标单独一个小卡片
- 按数值自动排序（降序）
- 支持正负值显示
- 可玩种族用绿色标记，不可玩种族用灰色标记
- 渐变色进度条

**示例效果**：
```
┌─────────────────────────────┐
│ 身高                         │
├─────────────────────────────┤
│ ● 阿戈诺什 |████████████| 12.0│
│ ○ 坎特巨人 |███████████▉| 12.0│
│ ○ 蒂拉皮   |████████▊   |  7.0│
└─────────────────────────────┘
```

### 2. 雷达图 (radar-chart)

**用途**：多维属性对比，展示不同种族在多个维度上的平衡

**适用场景**：
- 核心属性加成分析（体重、健康、速度等）
- 战斗属性对比
- 经济价值评估

**特点**：
- 多维度同时展示
- 适合对比相对能力
- 颜色区分不同种族
- 半透明填充便于重叠对比

### 3. 普通柱状图 (bar)

**用途**：标准柱状图，适用于简单数值对比

**适用场景**：
- 单一指标对比
- 时间序列数据
- 简单的分组对比

**特点**：
- 经典柱状图布局
- 支持分组显示
- 颜色区分不同类别

## 技术实现

### 文件结构

```
resources/public/
├── js/
│   └── race-visualizations.js    # 核心可视化引擎
└── css/
    └── visualizations.css        # 样式定义（可选）

content/blog-posts/
└── race-data-visualization.md   # 包含可视化标记的文档
```

### 核心函数

#### `window.RaceVisualizations.init()`

- 启动函数，页面加载时自动调用
- 查找所有可视化标记
- 逐个渲染图表

#### `findMarkers()`

- 正则表达式查找 HTML 中的 `VISUALIZATION` 注释
- 解析参数（type, data 等）
- 关联标记后的表格
- 保存表格备份用于回退

#### `parseTableData(table)`

- 提取表头和数据行
- 解析单元格值（数字、字符串、对象）
- 返回结构化数据：`{ headers: [...], data: [...] }`

#### `parseCellValue(value)`

- 根据格式自动转换数据类型
- 支持 `3x`、`+240`、`✓` 等特殊格式
- 处理空值和占位符

#### `renderVisualization(marker)`

- 路由到对应的渲染函数
- 隐藏原始表格
- 创建图表容器
- 插入回退按钮

#### `renderGroupedBarChart(container, tableData)`

- 渲染分组柱状图
- 为每个数值列创建独立卡片
- 自动排序和百分比计算
- 应用渐变色彩

#### `renderRadarChart(container, tableData)`

- 渲染雷达图
- 计算极坐标
- 绘制网格、轴、数据区域
- 添加图例和标签

### 回退机制

每个可视化图表都包含"查看原始表格"按钮：

```javascript
addFallbackButton(container, marker) {
  // 切换图表/表格显示状态
  btn.onclick = () => {
    if (marker.table.style.display === 'none') {
      marker.table.style.display = 'table';
      container.style.display = 'none';
    } else {
      marker.table.style.display = 'none';
      container.style.display = 'block';
    }
  };
}
```

## 使用指南

### 添加新的可视化

1. **在 Markdown 文档中插入标记和表格**：

```html
<!-- VISUALIZATION: my-chart type="grouped-bar" data="my-data" -->

| 种族 | 属性A | 属性B | 属性C |
|------|-------|-------|-------|
| 种族1 |  10   |  20   |  30   |
| 种族2 |  15   |  25   |  35   |

<!-- END-VISUALIZATION -->
```

2. **确保 D3.js 已加载**：

```html
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="/js/race-visualizations.js"></script>
```

3. **刷新页面，图表自动渲染**

### 自定义图表样式

修改 `renderGroupedBarChart` 中的样式定义：

```javascript
// 修改卡片背景
chartCard.style.cssText = `
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 20px;
`;

// 修改颜色
getMetricColor(index) {
  const colors = [
    '#f59e0b', // 自定义颜色
    '#3b82f6',
    // ...
  ];
  return colors[index % colors.length];
}
```

### 数据格式化

在 `formatValue()` 函数中添加自定义格式化规则：

```javascript
formatValue: function(value) {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  // 添加自定义规则
  if (value % 1 === 0) {
    return value.toString();
  }
  return value.toFixed(2);
}
```

## 设计原则

### 1. 非侵入式
- 使用 HTML 注释标记，不破坏原始内容
- 可选功能，不影响无 JavaScript 环境

### 2. 渐进增强
- 表格始终存在，作为回退方案
- JavaScript 加载失败时仍可查看数据

### 3. 可维护性
- 单一职责：每个渲染函数负责一种图表类型
- 数据驱动：所有样式从数据生成

### 4. 用户友好
- 直观的进度条显示
- 自动排序突出关键数据
- 一键切换图表/表格

## 常见问题

### Q1: 图表没有显示？

**可能原因**：
1. D3.js 未加载（检查浏览器控制台错误）
2. 标记格式错误（检查 `VISUALIZATION` 拼写）
3. 表格数据为空（检查表格结构）

**解决方法**：
```javascript
// 浏览器控制台运行
console.log(window.RaceVisualizations);
window.RaceVisualizations.init();
```

### Q2: 数值显示不正确？

**检查数据格式**：
- 确保使用正确的格式：`3x`、`+240`、`0.5`
- 避免中文标点符号
- 检查 `parseCellValue()` 逻辑

### Q3: 如何添加新的图表类型？

1. 在 `renderVisualization()` 添加路由：
```javascript
if (chartType === 'my-new-type') {
  this.renderMyNewChart(container, tableData);
}
```

2. 实现渲染函数：
```javascript
renderMyNewChart: function(container, tableData) {
  // 自定义渲染逻辑
}
```

## 技术栈

- **D3.js v7**: 数据可视化核心库
- **Vanilla JavaScript**: 无框架依赖
- **HTML5**: 标准注释标记
- **CSS3**: 渐变、动画、网格布局

## 扩展计划

### 短期
- [ ] 支持热力图（heatmap）
- [ ] 支持网络图（force-directed graph）
- [ ] 添加数据筛选功能
- [ ] 添加图表导出功能

### 长期
- [ ] 支持 Chart.js 作为替代引擎
- [ ] 实现响应式设计优化
- [ ] 添加图表交互（悬停提示、缩放）
- [ ] 支持实时数据更新

## 参考资料

- [D3.js 官方文档](https://d3js.org/)
- [项目文件位置](resources/public/js/race-visualizations.js)
- [示例文档](content/blog-posts/race-data-visualization.md)

## 更新日志

- 2026-01-18: 初始文档创建
- 2026-01-18: 记录 grouped-bar 和 radar-chart 实现
