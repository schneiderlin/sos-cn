:page/title IR Schema 字段参考 - 游戏数据解包完整字段列表
:blog-post/tags [:songs-of-syx :clojure :ir-schema :data-extraction]
:blog-post/author {:person/id :jan}
:page/body

## 概述

本文档提供了《Songs of Syx》游戏数据解包后所有可用的 IR (Intermediate Representation) 字段的完整参考。编辑者可以直接引用这些字段来编写 wiki 内容,无需了解游戏解包的具体实现细节。

IR 包含 10 大类数据,涵盖了游戏的核心机制:种族、建筑、科技、资源、加成系统、宗教、类型定义、生产、结构和种族关系。

---

## 1. Races (种族)

### 基本信息

| 字段 | 类型 | 说明 | 游戏概念 |
|------|------|------|----------|
| `key` | string | 种族唯一标识符 | 例如:ARGONOSH, HUMAN |
| `name` | string | 种族中文名称 | 阿戈诺什人、人类 |
| `names` | string | 种族名称复数形式 | 阿戈诺什人、人类 |
| `possessive` | string | 种族所有格形式 | 阿戈诺什的、人类的 |
| `possessives` | string | 种族所有格复数形式 | 阿戈诺什的、人类的 |
| `index` | number | 种族索引 | 用于内部引用 |
| `playable` | boolean | 是否为可玩种族 | true 表示玩家可选择 |
| `appearance-types` | number | 外观类型数量 | 种族有多少种外观变体 |
| `description` | string | 简短描述 | 种族的简短介绍 |
| `description-long` | string | 详细描述 | 种族的背景故事和详细介绍 |
| `pros` | array | 优点列表 | 种族优势 |
| `cons` | array | 缺点列表 | 种族劣势 |
| `challenge` | string | 挑战说明 | 该种族的游玩挑战 |

### 资源路径

| 字段 | 说明 |
|------|------|
| `icon-path` | 图标路径,例如:`sprites/races/ARGONOSH/icon.png` |
| `sheet-path` | 精灵图集路径 |
| `lay-path` | 躺卧姿态路径 |

### Boosts (加成)

种槿对各种属性的加成。

| 字段 | 类型 | 说明 |
|------|------|------|
| `boostable-key` | string | 加成属性的唯一标识 |
| `boostable-name` | string | 加成属性的中文名称 |
| `is-mul` | boolean | 是否为乘法加成 |
| `from` | number | 基础值 |
| `to` | number | 加成后值 |

**常见加成属性分类**:
- `PHYSICS_*` - 体质相关(体重、健康、速度、寿命、耐寒、耐热等)
- `RATES_*` - 消耗率相关(饥饿、虔诚等)
- `ROOM_*` - 建筑效率相关(各种房间的生产效率)
- `BATTLE_*` - 战斗相关(士气、攻击、防御等)
- `BEHAVIOUR_*` - 行为相关(守法、服从度、理智等)
- `RELIGION_*` - 宗教相关(对各教派的倾向)

### Preferences (偏好)

| 字段 | 类型 | 说明 |
|------|------|------|
| `preferred-foods` | array | 首选食物列表 |
| `preferred-drinks` | array | 首选饮料列表 |
| `most-hated-race` | string | 最痛恨的种族 |
| `race-relations` | map | 种族关系映射(种族 -> 关系值) |

### Physics (物理属性)

| 字段 | 类型 | 说明 | 游戏概念 |
|------|------|------|----------|
| `height` | number | 角色高度 | 单位:格子 |
| `hitbox-size` | number | 碰撞箱大小 | |
| `adult-at-day` | number | 成年所需天数 | 角色成长速度 |
| `corpse-decays` | boolean | 尸体是否腐烂 | |
| `sleeps` | boolean | 是否需要睡眠 | |
| `slave-price` | number | 奴隶价格 | 购买该种族奴隶的费用 |
| `raiding-value` | number | 掠夺价值 | 被攻击时的价值 |

### Population (人口属性)

| 字段 | 类型 | 说明 |
|------|------|------|
| `growth` | number | 人口增长率 |
| `max` | number | 最大人口 |
| `immigration-rate` | number | 移民率 |
| `climate-preferences` | map | 气候偏好(寒冷、温暖、炎热) |
| `terrain-preferences` | map | 地形偏好(海洋、淡水、山地、森林、旷野) |

### 实际数据示例

**共 8 个种族**
- **可玩种族(6个)**: CRETONIAN, DONDORIAN, GARTHIMI, HUMAN, Q_AMEVIA, TILAPI
- **非可玩种族(2个)**: ARGONOSH, CANTOR

#### 示例: ARGONOSH (阿戈诺什人, 非可玩)

```clojure
{:icon-path "sprites/races/ARGONOSH/icon.png",
 :playable false,
 :boosts
 [{:boostable-key "PHYSICS_MASS",
   :boostable-name "体重",
   :is-mul false,
   :from 0.0,
   :to 160.0}
  {:boostable-key "PHYSICS_HEALTH",
   :boostable-name "健康",
   :is-mul true,
   :from 1.0,
   :to 3.0}
  {:boostable-key "PHYSICS_SPEED",
   :boostable-name "速度",
   :is-mul true,
   :from 1.0,
   :to 2.0}
  {:boostable-key "PHYSICS_DEATH_AGE",
   :boostable-name "寿命",
   :is-mul true,
   :from 1.0,
   :to 5.0}
  {:boostable-key "RATES_HUNGER",
   :boostable-name "饥饿",
   :is-mul true,
   :from 1.0,
   :to 2.0}],
 :physics
 {:height 2.0,
  :hitbox-size 1.8,
  :adult-at-day 60,
  :corpse-decays true,
  :sleeps true,
  :slave-price 200,
  :raiding-value 300},
 :population
 {:growth 0.03,
  :max 0.2,
  :immigration-rate 0.0,
  :climate-preferences {:HOT 0.0, :TEMPERATE 0.5, :COLD 1.0},
  :terrain-preferences {:FOREST 0.5, :MOUNTAIN 0.0, :WET 1.0, :NONE 0.0}},
 :description "来自深层矿脉的巨型生物。",
 :description-long "阿戈诺什人是一种来自深层的巨型生物,他们在黑暗中进化出了超人的力量和健康,但速度缓慢且不耐热。他们不会说话,但能理解一些语言。",
 :name "阿戈诺什人",
 :names "阿戈诺什人",
 :possessive "阿戈诺什的",
 :possessives "阿戈诺什的",
 :key "ARGONOSH",
 :index 0,
 :appearance-types 2,
 :pros ["力量巨大", "健康值高", "寿命长"],
 :cons ["速度慢", "不耐热", "无法学习科技"],
 :challenge "阿戈诺什人的力量巨大,但速度慢且不耐热。你需要确保他们有足够的热量保护,并利用他们的力量在采矿和战斗中取得优势。"}
```

#### 示例: HUMAN (人类, 可玩)

```clojure
{:icon-path "sprites/races/HUMAN/icon.png",
 :playable true,
 :key "HUMAN",
 :index 4,
 :name "人类",
 :names "人类",
 :possessive "人类的",
 :possessives "人类的",
 :appearance-types 10,
 :description "希克斯大陆的通用种族。",
 :description-long "人类是一种平衡的种族,没有特殊的优势或劣势。他们能够学习任何科技,适应各种环境。人类是最常见的种族,适合新手玩家。",
 :pros ["平衡性好", "无特殊劣势"],
 :cons ["无特殊优势"],
 :challenge "人类没有特殊优势或劣势,适合新手玩家学习游戏机制。"}
```

---

## 2. Buildings (建筑)

### 基本信息

| 字段 | 类型 | 说明 | 游戏概念 |
|------|------|------|----------|
| `key` | string | 建筑唯一标识符 | 例如:_STOCKPILE, FARM_FRUIT |
| `name` | string | 建筑中文名称 | 仓库、水果农场 |
| `index` | number | 建筑索引 |
| `type` | string | 建筑类型(可选) | 例如:FARM, MINE, WORKSHOP |
| `type-index` | number | 类型索引 |
| `description` | string | 建筑描述 | 功能和用途说明 |
| `is-production-room` | boolean | 是否为生产房间 | 是否生产资源 |
| `degrade-rate` | number | 劣化速度 | 建筑磨损速度 |
| `has-bonus` | boolean | 是否有加成 | 是否可以被种族加成影响 |

### Category (类别)

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 类别名称 | 例如:农业、军事 |
| `main-name` | string | 主类别名称 | 例如:工业、服务 |
| `room-count` | number | 该类别的建筑数量 |

### Construction (建造)

| 字段 | 类型 | 说明 | 游戏概念 |
|------|------|------|----------|
| `uses-area` | boolean | 是否占用区域 | 建筑是否需要一定空间 |
| `must-be-indoors` | boolean | 是否必须在室内 | 必须建造在室内 |
| `must-be-outdoors` | boolean | 是否必须在室外 | 必须建造在室外 |
| `resources` | array | 建造所需资源 | 每个资源包含 key 和 area-cost |
| `stats-count` | number | 统计数量 | 影响建筑效率的属性数量 |

**建造资源结构**:
```clojure
{:resource-key "_WOOD", :area-cost 0.0}
```

### Industries (产业)

生产建筑的生产链信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| `index` | number | 产业索引 |
| `ai-multiplier` | number | AI 乘数 | AI 使用该建筑时的效率系数 |
| `inputs` | array | 输入资源列表 | 每个输入包含 resource-key 和 rate-per-second |
| `outputs` | array | 输出资源列表 | 每个输出包含 resource-key 和 rate-per-second |

**输入/输出结构**:
```clojure
{:resource-key "GRAIN", :rate-per-second 0.006944444444444444}
```

### 实际数据示例

**共 119 个建筑**
**主要类别**: 丧葬(3), 住房(3), 健康(8), 其他(5), 军事(5), 农场(8), 分配(4), 制造(10), 娱乐(5), 宗教(8), 律法(7), 水(6), 工业(17), 仓库(4)

#### 示例: FARM_FRUIT (水果农场)

```clojure
{:key "FARM_FRUIT",
 :name "水果农场",
 :index 18,
 :type "FARM",
 :type-index 0,
 :description "种植水果的农场。",
 :is-production-room true,
 :degrade-rate 0.5,
 :has-bonus true,
 :icon-path "sprites/buildings/FARM_FRUIT/icon.png",
 :category {:name "农场", :main-name "农业", :room-count 8},
 :construction
 {:uses-area true,
  :must-be-indoors false,
  :must-be-outdoors false,
  :resources
  [{:resource-key "_STONE", :area-cost 0.1}
   {:resource-key "FURNITURE", :area-cost 0.5}],
  :stats-count 4},
 :industries
 [{:index 0,
   :ai-multiplier 1.0,
   :inputs [{:resource-key "FARMER", :rate-per-second 0.0027777777777777776}],
   :outputs
   [{:resource-key "FRUIT", :rate-per-second 0.006944444444444444}]}]}
```

#### 示例: WORKSHOP_SMITHY (铁匠铺)

```clojure
{:key "WORKSHOP_SMITHY",
 :name "铁匠铺",
 :description "制造武器和盔甲的工坊。",
 :is-production-room true,
 :degrade-rate 0.75,
 :has-bonus true,
 :construction
 {:uses-area false,
  :must-be-indoors true,
  :must-be-outdoors false,
  :resources
  [{:resource-key "_STONE", :area-cost 20.0}
   {:resource-key "METAL", :area-cost 20.0}
   {:resource-key "FURNITURE", :area-cost 2.0}],
  :stats-count 4}}
```

#### 示例: BARRACKS_VANILLA (兵营)

```clojure
{:key "BARRACKS_VANILLA",
 :name "兵营",
 :description "用于训练和安置士兵的营房。",
 :is-production-room false,
 :degrade-rate 0.75,
 :has-bonus false,
 :construction
 {:uses-area true,
  :must-be-indoors false,
  :must-be-outdoors false,
  :resources
  [{:resource-key "_STONE", :area-cost 10.0}
   {:resource-key "FURNITURE", :area-cost 2.0}]}}
```

---

## 3. Technologies (科技)

### 基本信息

| 字段 | 类型 | 说明 | 游戏概念 |
|------|------|------|----------|
| `key` | string | 科技唯一标识符 | 例如:AGRICULTURE_BASE0, ARCHITECTURE_HOME0 |
| `name` | string | 科技中文名称 | 基础种植、地下室 |
| `index` | number | 科技索引 |
| `tree-key` | string | 所属科技树 | 例如:AGRICULTURE, ARCHITECTURE |
| `description` | string | 科技描述 | 作用和效果说明 |
| `level-max` | number | 最大等级 | 该科技可以升级到的最高等级 |
| `cost-total` | number | 总成本 | 升级到最高等级的总花费 |
| `level-cost-inc` | number | 每级成本增量 | 每升一级增加的花费 |
| `ai-amount` | number | AI 数量 | AI 优先级 |
| `color` | object | 颜色信息 | 包含 red, green, blue, hex |

### Costs (成本)

| 字段 | 类型 | 说明 |
|------|------|------|
| `currency-name` | string | 货币名称 | 创新或知识 |
| `currency-index` | number | 货币索引 |
| `amount` | number | 花费数量 |

### Requirements (前置要求)

| 字段 | 类型 | 说明 |
|------|------|------|
| `tech-key` | string | 前置科技标识符 |
| `level` | number | 前置科技所需等级 |

### Trees (科技树)

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | 科技树标识符 |
| `name` | string | 科技树名称 |
| `category` | number | 科技树类别 |
| `color` | object | 科技树颜色 |
| `rows` | number | 科技树行数 |
| `node-grid` | array | 科技节点网格 | 二维数组,每个节点是科技 key |

### Currencies (货币)

| 字段 | 类型 | 说明 | 游戏概念 |
|------|------|------|----------|
| `index` | number | 货币索引 |
| `name` | string | 货币名称 | 创新或知识 |
| `boostable-key` | string | 对应的加成属性标识符 |

### 实际数据示例

**共 245 个科技,13 个科技树**
**科技树**: AGRICULTURE(农业), ARCHITECTURE(建筑), MILITARY(军事), MAGIC(魔法), GOVERNANCE(治理), ECONOMY(经济), MEDICINE(医学), FOOD(食物), MATERIAL(材料), RELIGION(宗教), DIPLOMACY(外交), EXPLORATION(探索), COMMERCE(商业), PRODUCTION(生产)

#### 示例: AGRICULTURE_BASE0 (基础种植)

```clojure
{:description "",
 :icon-path "sprites/techs/AGRICULTURE_BASE0/icon.png",
 :requirements [],
 :tree-key "AGRICULTURE",
 :level-max 10,
 :color {:red 79, :green 50, :blue 31, :hex "#1F324F"},
 :key "AGRICULTURE_BASE0",
 :index 0,
 :cost-total 3,
 :name "基础种植",
 :costs [{:currency-name "创新", :currency-index 0, :amount 3.0}],
 :level-cost-inc 1.0,
 :ai-amount 1.0}
```

#### 示例: AGRICULTURE_FOOD0 (先进种植)

```clojure
{:description "",
 :icon-path "sprites/techs/AGRICULTURE_FOOD0/icon.png",
 :requirements [{:tech-key "AGRICULTURE_BASE0", :level 10}],
 :tree-key "AGRICULTURE",
 :level-max 16,
 :color {:red 79, :green 50, :blue 31, :hex "#1F324F"},
 :key "AGRICULTURE_FOOD0",
 :index 1,
 :cost-total 100,
 :name "先进种植",
 :costs [{:currency-name "知识", :currency-index 1, :amount 100.0}],
 :level-cost-inc 20.0,
 :ai-amount 0.0}
```

#### 示例: MILITARY_BASICS0 (基础军事)

```clojure
{:description "",
 :icon-path "sprites/techs/MILITARY_BASICS0/icon.png",
 :requirements [],
 :tree-key "MILITARY",
 :level-max 10,
 :color {:red 255, :green 50, :blue 50, :hex "#FF3232"},
 :key "MILITARY_BASICS0",
 :index 0,
 :cost-total 5,
 :name "基础军事",
 :costs [{:currency-name "创新", :currency-index 0, :amount 5.0}],
 :level-cost-inc 1.0,
 :ai-amount 1.0}
```

---

## 4. Resources (资源)

### 基本信息

| 字段 | 类型 | 说明 | 游戏概念 |
|------|------|------|----------|
| `key` | string | 资源唯一标识符 | 例如:_WOOD, MEAT, METAL |
| `name` | string | 资源中文名称 | 木材、肉、金属 |
| `names` | string | 资源名称复数形式 | 木材、肉、金属 |
| `index` | number | 资源索引 |
| `description` | string | 资源描述 | 用途和获取方式说明 |
| `category` | number | 资源类别 | 0:食物/饮料,1:原材料,2:加工品,3:高级品,4:军事装备 |
| `price-mul` | number | 价格乘数 | 影响交易价格 |
| `price-cap` | number | 价格上限 |
| `edible` | boolean | 是否可食用 | |
| `drinkable` | boolean | 是否可饮用 | |
| `degrade-speed` | number | 腐烂速度 | 资源自然腐坏的速度 |

### 资源路径

| 字段 | 说明 |
|------|------|
| `icon-path` | 图标路径,例如:`sprites/resources/MEAT/icon.png` |
| `sprite-path` | 精灵图路径 |

### Minables (矿藏)

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | 矿藏标识符 |
| `name` | string | 矿藏名称 |
| `resource-key` | string | 产出的资源标识符 |
| `on-every-map` | boolean | 是否每张地图都有 |
| `occurence` | number | 出现频率 |
| `fertility-increase` | number | 肥力加成 | 对地形肥力的影响 |

### Growables (农作物)

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | 农作物标识符 |
| `resource-key` | string | 产出的资源标识符 |
| `seasonal-offset` | number | 季节偏移 |
| `growth-value` | number | 生长值 | 影响产量 |

### Edibles (食物)

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | 食物标识符 |
| `resource-key` | string | 对应的资源标识符 |
| `serve` | boolean | 是否可以上菜 | 是否可以正式食用 |

### Drinkables (饮料)

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | 饮料标识符 |
| `resource-key` | string | 对应的资源标识符 |
| `serve` | boolean | 是否可以供应 |

### 实际数据示例

**共 42 个资源,5 个类别**
**资源分类**: 食物/饮料(0), 原材料(1), 加工品(2), 高级品(3), 军事装备(4)

#### 示例: BREAD (面包)

```clojure
{:description "面包是一种由面包厂生产的主食。",
 :category 0,
 :icon-path "sprites/resources/BREAD/icon.png",
 :sprite-path "sprites/resources/BREAD/lay.png",
 :price-mul 1.1,
 :key "BREAD",
 :index 2,
 :drinkable false,
 :name "面包",
 :price-cap 1.0,
 :edible true,
 :degrade-speed 1.0,
 :names "面包"}
```

#### 示例: MEAT (肉)

```clojure
{:description "肉是一种食物来源。",
 :category 0,
 :icon-path "sprites/resources/MEAT/icon.png",
 :sprite-path "sprites/resources/MEAT/lay.png",
 :price-mul 1.2,
 :key "MEAT",
 :index 6,
 :drinkable false,
 :name "肉",
 :price-cap 1.0,
 :edible true,
 :degrade-speed 0.75,
 :names "肉"}
```

#### 示例: _WOOD (木材)

```clojure
{:description "木材是一种基础建筑材料。",
 :category 1,
 :icon-path "sprites/resources/_WOOD/icon.png",
 :sprite-path "sprites/resources/_WOOD/lay.png",
 :price-mul 1.0,
 :key "_WOOD",
 :index 20,
 :drinkable false,
 :name "木材",
 :price-cap 1.0,
 :edible false,
 :degrade-speed 0.0,
 :names "木材"}
```

---

## 5. Boosters (加成/属性)

### Categories (类别)

| 字段 | 类型 | 说明 |
|------|------|------|
| `prefix` | string | 类别前缀 | 例如:PHYSICS_, BEHAVIOUR_, ROOM_ |
| `name` | string | 类别名称 | 体质、行为、建筑物 |
| `type-mask` | number | 类型掩码 |
| `types` | set | 类型集合 |
| `boostable-count` | number | 该类别的属性数量 |
| `boostable-keys` | array | 属性标识符列表 |
| `boostables` | array | 属性详情列表 |

### Boostable (属性)

| 字段 | 类型 | 说明 | 游戏概念 |
|------|------|------|----------|
| `key` | string | 属性唯一标识符 | 例如:PHYSICS_MASS, BATTLE_MORALE |
| `name` | string | 属性中文名称 | 体重、士气 |
| `index` | number | 属性索引 |
| `description` | string | 属性描述 | 作用和效果说明 |
| `icon-path` | string | 图标路径 |
| `min-value` | number | 最小值 |
| `base-value` | number | 基础值 | 默认值 |
| `types` | set | 适用类型 |
| `category-prefix` | string | 所属类别前缀 |
| `semantic-category` | keyword | 语义类别 | :physics, :battle, :behaviour 等 |
| `type-mask` | number | 类型掩码 |
| `category-name` | string | 类别名称 |

### 主要属性类别

#### PHYSICS_* (体质)
- `PHYSICS_MASS` - 体重
- `PHYSICS_STAMINA` - 耐力
- `PHYSICS_SPEED` - 速度
- `PHYSICS_ACCELERATION` - 加速能力
- `PHYSICS_HEALTH` - 健康
- `PHYSICS_DEATH_AGE` - 寿命
- `PHYSICS_RESISTANCE_HOT` - 耐热
- `PHYSICS_RESISTANCE_COLD` - 耐寒
- `PHYSICS_SOILING` - 脏污

#### BEHAVIOUR_* (行为)
- `BEHAVIOUR_LAWFULNESS` - 守法
- `BEHAVIOUR_SUBMISSION` - 服从度
- `BEHAVIOUR_LOYALTY` - 忠诚度
- `BEHAVIOUR_HAPPINESS` - 幸福度
- `BEHAVIOUR_SANITY` - 理智

#### BATTLE_* (战斗)
- `BATTLE_OFFENCE_SKILL` - 进攻技能
- `BATTLE_DEFENCE_SKILL` - 防御技能
- `BATTLE_MORALE` - 士气
- `BATTLE_BLUNT_ATTACK` - 打击力量
- `BATTLE_BLUNT_DEFENCE` - 打击承受
- `BATTLE_PIERCE_ATTACK` - 穿刺伤害
- `BATTLE_PIERCE_DEFENCE` - 穿刺护甲
- `BATTLE_SLASH_ATTACK` - 劈砍伤害
- `BATTLE_SLASH_DEFENCE` - 劈砍护甲
- `BATTLE_RANGED_BOW` - 技能: 弓

#### ROOM_* (建筑物)
各种房间的生产效率,例如:
- `ROOM_STOCKPILE` - 运载量
- `ROOM_FARM_FRUIT` - 水果农场
- `ROOM_MINE_ORE` - 矿石矿场
- `ROOM_LIBRARY_NORMAL` - 图书馆

#### CIVIC_* (民政)
- `CIVIC_MAINTENANCE` - 耐久
- `CIVIC_SPOILAGE` - 保养
- `CIVIC_ACCIDENT` - 安全
- `CIVIC_INNOVATION` - 创新
- `CIVIC_DIPLOMACY` - 使者点数
- `CIVIC_KNOWLEDGE` - 知识

#### ACTIVITY_* (活动)
- `ACTIVITY_MOURN` - 悼念
- `ACTIVITY_PUNISHMENT` - 惩罚
- `ACTIVITY_JUDGE` - 审判
- `ACTIVITY_SOCIAL` - 社交

#### NOBLE_* (性格)
- `NOBLE_AGRRESSION` - 好战
- `NOBLE_PRIDE` - 骄傲
- `NOBLE_HONOUR` - 荣誉
- `NOBLE_MERCY` - 慈悲
- `NOBLE_COMPETENCE` - 能力
- `NOBLE_TOLERANCE` - 宽容

### 实际数据示例

**共 355 个属性,7 个类别**
**主要类别**: 体质(9), 建筑物(52), 性格(6), 战斗(17), 民政(18), 活动(4), 行为(5)

#### 示例: PHYSICS_MASS (体重)

```clojure
{:description "臣民的体重。",
 :icon-path "sprites/boosters/PHYSICS_MASS/icon.png",
 :key "PHYSICS_MASS",
 :index 0,
 :name "体重",
 :min-value -1.0E7,
 :types #{:settlement},
 :category-prefix "PHYSICS_",
 :semantic-category :physics,
 :type-mask 4,
 :base-value 80.0,
 :category-name "体质"}
```

#### 示例: BATTLE_MORALE (士气)

```clojure
{:description "单位在战斗中的士气。士气越高,单位越不容易逃跑。",
 :icon-path "sprites/boosters/BATTLE_MORALE/icon.png",
 :key "BATTLE_MORALE",
 :index 0,
 :name "士气",
 :min-value -1.0E7,
 :types #{:settlement},
 :category-prefix "BATTLE_",
 :semantic-category :battle,
 :type-mask 4,
 :base-value 1.0,
 :category-name "战斗"}
```

#### 示例: ROOM_FARM_FRUIT (水果农场效率)

```clojure
{:description "该房间的生产效率。",
 :icon-path "sprites/boosters/ROOM_FARM_FRUIT/icon.png",
 :key "ROOM_FARM_FRUIT",
 :index 0,
 :name "水果农场",
 :min-value -1.0E7,
 :types #{:settlement},
 :category-prefix "ROOM_",
 :semantic-category :room,
 :type-mask 4,
 :base-value 1.0,
 :category-name "建筑物"}
```

---

## 6. Religions (宗教)

### 基本信息

| 字段 | 类型 | 说明 | 游戏概念 |
|------|------|------|----------|
| `key` | string | 宗教唯一标识符 | 例如:AMINION, ATHURI, CRATOR, SHMALOR |
| `name` | string | 宗教中文名称 | 阿明农教派 |
| `deity` | string | 神祇名称 | 阿明农 |
| `index` | number | 宗教索引 |
| `description` | string | 宗教描述 | 信仰和效果说明 |
| `inclination` | number | 倾向值 | 信仰该宗教的倾向 |
| `color` | object | 颜色信息 | 包含 red, green, blue, hex |
| `icon-path` | string | 图标路径 |

### Boosts (加成)

宗教提供的加成,结构同 Races 的 boosts。

### Opposition Matrix (对立矩阵)

宗教间的对立关系,矩阵中的值表示对立程度(0=无对立,4=强烈对立)。

```clojure
{"AMINION" {"AMINION" 0.0, "ATHURI" 4.0, "CRATOR" 0.0, "SHMALOR" 0.0}
 "ATHURI"  {"AMINION" 4.0, "ATHURI" 0.0, "CRATOR" 0.0, "SHMALOR" 4.0}}
```

### 实际数据示例

**共 4 个宗教 (全部列出)**

#### AMINION (阿明农教派)

```clojure
{:description "混沌之王阿明农,能提高奴隶的顺从度。他接受活人祭品(囚犯)。",
 :icon-path "sprites/religions/AMINION/icon.png",
 :boosts
 [{:boostable-key "BEHAVIOUR_SUBMISSION",
   :boostable-name "服从度",
   :is-mul true,
   :from 1.0,
   :to 1.2}
  {:boostable-key "WORLD_LOYALTY_HUMAN",
   :boostable-name "忠诚度: 人类",
   :is-mul true,
   :from 1.0,
   :to 1.05}
  {:boostable-key "WORLD_CONSCRIPTABLE_TARGET",
   :boostable-name "征召兵",
   :is-mul true,
   :from 1.0,
   :to 1.1}],
 :color {:red 45, :green 5, :blue 5, :hex "#05052D"},
 :key "AMINION",
 :index 0,
 :name "阿明农教派",
 :deity "阿明农",
 :inclination 1.0,
 :oppositions
 {"AMINION" 0.0, "ATHURI" 4.0, "CRATOR" 0.0, "SHMALOR" 0.0}}
```

#### ATHURI (阿图里教派)

```clojure
{:description "掌管法律和秩序的阿图里。能提高守法度和忠诚度。",
 :icon-path "sprites/religions/ATHURI/icon.png",
 :key "ATHURI",
 :index 1,
 :name "阿图里教派",
 :deity "阿图里",
 :inclination 1.0,
 :color {:red 50, :green 100, :blue 50, :hex "#326432"}}
```

#### CRATOR (克拉托教派)

```clojure
{:description "创造之神克拉托。能提高健康度和恢复速度。",
 :icon-path "sprites/religions/CRATOR/icon.png",
 :key "CRATOR",
 :index 2,
 :name "克拉托教派",
 :deity "克拉托",
 :inclination 1.0,
 :color {:red 50, :green 50, :blue 200, :hex "#3232C8"}}
```

#### SHMALOR (什马洛教派)

```clojure
{:description "战争之神什马洛。能提高战斗能力。",
 :icon-path "sprites/religions/SHMALOR/icon.png",
 :key "SHMALOR",
 :index 3,
 :name "什马洛教派",
 :deity "什马洛",
 :inclination 1.0,
 :color {:red 200, :green 50, :blue 50, :hex "#C83232"}}
```

---

## 7. Types (类型定义)

### Needs (需求)

| 字段 | 类型 | 说明 | 游戏概念 |
|------|------|------|----------|
| `key` | string | 需求唯一标识符 | 例如:_HUNGER, _THIRST, _TEMPLE |
| `name` | string | 需求中文名称 | 食物、酒水、崇拜 |
| `index` | number | 需求索引 |
| `basic` | boolean | 是否为基础需求 | 必须满足的基本需求 |
| `event` | number | 事件触发概率 |

**基础需求**:_HUNGER (食物), _THIRST (酒水), _SHOPPING (购物)

### 实际数据示例

#### Needs (需求) - 共 17 个

**基础需求(3个)**: _HUNGER(食物), _THIRST(酒水), _SHOPPING(购物)

```clojure
{:key "_HUNGER", :index 11, :name "食物", :basic true, :event 0.0}
{:key "_THIRST", :index 12, :name "酒水", :basic true, :event 0.0}
{:key "_SHOPPING", :index 13, :name "购物", :basic true, :event 0.0}
{:key "ARENA", :index 0, :name "战斗", :basic false, :event 10.0}
{:key "WELL", :index 10, :name "水井", :basic false, :event 0.0}
```

#### HTypes (人类类型) - 共 13 个

```clojure
{:key "CITIZEN", :index 0, :name "公民", :works true, :player true, :visible true}
{:key "RETIREE", :index 1, :name "退休人员", :works false, :player true, :visible true}
{:key "RECRUIT", :index 2, :name "新兵", :works false, :player true, :visible true}
{:key "SOLDIER", :index 6, :name "士兵", :works false, :player true, :visible false}
{:key "NOBILITY", :index 10, :name "贵族", :works false, :player true, :visible true}
{:key "SLAVE", :index 11, :name "奴隶", :works true, :player true, :visible true}
{:key "CHILD", :index 12, :name "儿童", :works false, :player true, :visible true}
{:key "PRISONER", :index 4, :name "囚犯", :works false, :player false, :visible false}
{:key "ENEMY", :index 7, :name "敌人", :works false, :player false, :visible false, :hostile true}
```

#### Diseases (疾病) - 共 6 个 (全部列出)

```clojure
{:key "BLEEDING_FEVER",
 :index 0,
 :name "出血热",
 :fatality-rate 0.5,
 :infect-rate 0.4,
 :incubation-days 4.0,
 :length 3,
 :regular false,
 :epidemic true,
 :description "出血热是一种极度致命的疾病,从创世以来就相伴于世界。"}

{:key "PLAGUE",
 :index 1,
 :name "黑死疫",
 :fatality-rate 0.3,
 :infect-rate 0.6,
 :incubation-days 3.0,
 :length 3,
 :regular false,
 :epidemic true,
 :description "残酷的黑死疫是致命的,其通常会在结束患者生命之前折磨他们数日。"}

{:key "VISION_FEVER",
 :index 4,
 :name "幻视热",
 :fatality-rate 0.05,
 :infect-rate 0.1,
 :incubation-days 3.0,
 :length 8,
 :regular true,
 :epidemic false,
 :description "这种极少致命的疾病会使患者发烧并产生可怕的幻觉。"}
```

#### Climates (气候) - 共 3 个 (全部列出)

```clojure
{:key "COLD",
 :index 0,
 :name "寒冷",
 :description "寒冬。独特作物。低疾病率。",
 :season-change 1.0,
 :temp-cold 0.32,
 :temp-warm 0.655,
 :fertility 0.65}

{:key "TEMPERATE",
 :index 1,
 :name "温暖",
 :description "多变的气温。",
 :season-change 0.5,
 :temp-cold 0.425,
 :temp-warm 0.75,
 :fertility 0.45}

{:key "HOT",
 :index 2,
 :name "炎热",
 :description "酷暑",
 :season-change 0.0,
 :temp-cold 0.65,
 :temp-warm 0.825,
 :fertility 0.65}
```

#### Terrains (地形) - 共 5 个 (全部列出)

```clojure
{:key "OCEAN", :index 0, :name "海洋", :description "咸水,如海洋。鱼类丰富。", :world true}
{:key "WET", :index 1, :name "淡水", :description "淡水,如河流或湖泊。提供天然灌溉。", :world true}
{:key "MOUNTAIN", :index 2, :name "山地", :description "大量的洞穴和丰富的矿藏。", :world true}
{:key "FOREST", :index 3, :name "森林", :description "森林地区。适合伐木。", :world true}
{:key "NONE", :index 4, :name "旷野", :description "可以自由漫游的开阔土地。", :world true}
```

#### HCclasses (人类阶级) - 共 5 个 (全部列出)

```clojure
{:key "NOBLE", :index 0, :name "贵族", :names "贵族", :player true, :player-index 0,
 :description "贵族是你王国内社会阶级的顶层。他们不会进行传统的工作,但会要求薪资和高等级的服务。"}

{:key "CITIZEN", :index 1, :name "平民", :names "平民", :player true, :player-index 1,
 :description "平民是人口的主体,他们会按你的要求行事。"}

{:key "SLAVE", :index 2, :name "奴隶", :names "奴隶", :player true, :player-index 2,
 :description "奴隶从事平凡而艰苦的工作,但需要的回报很少。"}

{:key "CHILD", :index 3, :name "儿童", :names "儿童", :player true, :player-index 3,
 :description "儿童是未来的公民。他们需要育儿所提供食物和保护,并可在小学接受教育。"}

{:key "OTHER", :index 4, :name "Other", :names "Others", :player false, :player-index -1, :description ""}
```

#### Traits (特质) - 共 12 个 (全部列出)

```clojure
{:key "COMPETENT", :index 0, :name "野心勃勃", :title "大帝",
 :description "在大多数任务上表现得更好", :disables ["LAZY"]}

{:key "CONSERVATIVE", :index 1, :name "保守", :title "传统捍卫者",
 :description "喜欢事物维持原样。重视自己的种族,对异族则漠不关心。", :disables ["TOLERANT"]}

{:key "HONEST", :index 4, :name "正直", :title "荣耀捍卫者",
 :description "刚正不阿,恪守诺言。", :disables ["CUNNING"]}

{:key "MERCIFUL", :index 6, :name "仁慈", :title "慈悲者",
 :description "一些人称其为软弱,但其他人称其为骑士精神。珍视生命并尽可能地保存生命。", :disables ["CRUEL"]}

{:key "WARRIOR", :index 10, :name "好战", :title "征服者",
 :description "一个追求荣耀的人,他会急切地寻找或制造冲突以获得战斗的机会。", :disables ["WARRIOR_NOT"]}

{:key "WARRIOR_NOT", :index 11, :name "和平主义者", :title "和平使者",
 :description "厌恶战争", :disables ["WARRIOR"]}
```

---

## 8. Production (生产)

### 基本信息

定义了生产房间和产业信息,结构同 Buildings 的 Industries 部分。

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | 生产房间唯一标识符 |
| `name` | string | 生产房间名称 |
| `index` | number | 生产房间索引 |
| `description` | string | 生产房间描述 |
| `is-production-room` | boolean | 是否为生产房间 |
| `industries` | array | 产业列表 |

### Industries (产业)

| 字段 | 类型 | 说明 |
|------|------|------|
| `index` | number | 产业索引 |
| `ai-multiplier` | number | AI 乘数 |
| `inputs` | array | 输入资源列表 |
| `outputs` | array | 输出资源列表 |

### 实际数据示例

**共 49 个生产房间**

#### 示例: _WOODCUTTER (伐木场)

```clojure
{:description "种植并砍伐树木。将会持续生产木材。",
 :is-production-room true,
 :category {:name "其他", :main-name "工业", :room-count 2},
 :icon-path "sprites/buildings/_WOODCUTTER/icon.png",
 :key "_WOODCUTTER",
 :index 13,
 :name "伐木场",
 :degrade-rate 0.75,
 :has-bonus true,
 :construction
 {:uses-area true,
  :must-be-indoors false,
  :must-be-outdoors true,
  :resources
  [{:resource-key "_STONE", :area-cost 0.0}
   {:resource-key "FURNITURE", :area-cost 0.0}],
  :stats-count 4},
 :industries
 [{:index 0,
   :ai-multiplier 1.0,
   :inputs [],
   :outputs [{:resource-key "_WOOD", :rate-per-second 0.006944444444444444}]}]}
```

#### 示例: _HOSPITAL (医院)

```clojure
{:description "为你生病的臣民提供治疗的地方。给他们更大的生还几率。",
 :is-production-room true,
 :category {:name "健康", :main-name "服务", :room-count 8},
 :icon-path "sprites/buildings/_HOSPITAL/icon.png",
 :key "_HOSPITAL",
 :index 31,
 :name "医院",
 :degrade-rate 0.75,
 :has-bonus false,
 :construction
 {:uses-area true,
  :must-be-indoors true,
  :must-be-outdoors false,
  :resources
  [{:resource-key "_STONE", :area-cost 0.0}
   {:resource-key "FURNITURE", :area-cost 0.0}],
  :stats-count 2}}
```

#### 示例: WORKSHOP_RATION (口粮工坊)

```clojure
{:description "生产口粮的工坊。口粮是保存食物的重要方式。",
 :is-production-room true,
 :category {:name "制造", :main-name "工业", :room-count 10},
 :icon-path "sprites/buildings/WORKSHOP_RATION/icon.png",
 :key "WORKSHOP_RATION",
 :name "口粮工坊",
 :degrade-rate 0.75,
 :has-bonus true,
 :construction
 {:uses-area false,
  :must-be-indoors true,
  :must-be-outdoors false,
  :resources
  [{:resource-key "_STONE", :area-cost 20.0}
   {:resource-key "METAL", :area-cost 10.0}
   {:resource-key "FURNITURE", :area-cost 2.0}],
  :stats-count 4}}
```

---

## 9. Structures (结构)

### 基本信息

| 字段 | 类型 | 说明 | 游戏概念 |
|------|------|------|----------|
| `key` | string | 结构唯一标识符 | _MUD, WOOD, STONE, GRAND |
| `name` | string | 结构中文名称 | 泥制建筑、木制建筑、石制建筑、豪华建筑 |
| `name-wall` | string | 墙体名称 | 泥墙、木墙、石墙、豪华墙 |
| `name-ceiling` | string | 天花板名称 | 泥制天花板、木天花板、石天花板、豪华天花板 |
| `index` | number | 结构索引 |
| `description` | string | 结构描述 | 材质和特性说明 |
| `resource-key` | string | 所需资源标识符 | 例如:_WOOD, _STONE, STONE_CUT |
| `resource-amount` | number | 所需资源数量 |
| `has-resource` | boolean | 是否需要资源 | 泥制建筑不需要资源 |
| `durability` | number | 耐用性 | 建筑的耐用程度 |
| `construct-time` | number | 建造时间 | 建造所需时间 |
| `minimap-color` | object | 小地图颜色 | 包含 red, green, blue |
| `icon-path` | string | 图标路径 |

### 实际数据示例

**共 4 个结构 (全部列出)**

#### _MUD (泥制建筑)

```clojure
{:description "由泥巴、泥土和粪便组成的一种非常基础的结构。不需要任何资源,但需要大量劳动。",
 :icon-path "sprites/structures/_MUD/icon.png",
 :minimap-color {:red 115, :green 105, :blue 105},
 :key "_MUD",
 :index 0,
 :has-resource false,
 :name "泥制建筑",
 :name-wall "泥墙",
 :name-ceiling "泥制天花板",
 :durability 16.0,
 :resource-key nil,
 :resource-amount 0,
 :construct-time 1.0}
```

#### WOOD (木制建筑)

```clojure
{:description "木头制成的结构。",
 :icon-path "sprites/structures/WOOD/icon.png",
 :minimap-color {:red 38, :green 18, :blue 11},
 :key "WOOD",
 :index 3,
 :has-resource true,
 :name "木制建筑",
 :name-wall "木墙",
 :name-ceiling "木天花板",
 :durability 64.0,
 :resource-key "_WOOD",
 :resource-amount 1,
 :construct-time 0.1}
```

#### STONE (石制建筑)

```clojure
{:description "稳固持久的结构。",
 :icon-path "sprites/structures/STONE/icon.png",
 :minimap-color {:red 58, :green 53, :blue 42},
 :key "STONE",
 :index 2,
 :has-resource true,
 :name "石制建筑",
 :name-wall "石墙",
 :name-ceiling "石天花板",
 :durability 64.0,
 :resource-key "_STONE",
 :resource-amount 1,
 :construct-time 0.1}
```

#### GRAND (豪华建筑)

```clojure
{:description "最坚固耐用且雍容华贵的墙。",
 :icon-path "sprites/structures/GRAND/icon.png",
 :minimap-color {:red 110, :green 110, :blue 110},
 :key "GRAND",
 :index 1,
 :has-resource true,
 :name "豪华建筑",
 :name-wall "豪华墙",
 :name-ceiling "豪华天花板",
 :durability 64.0,
 :resource-key "STONE_CUT",
 :resource-amount 2,
 :construct-time 0.25}
```

---

## 10. Race Relations (种族关系)

### 基本信息

定义了种族之间的相互关系。

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `from` | string | 种族标识符 |
| `to` | string | 种族标识符 |
| `relation` | number | 关系值 | 通常为 0.0-1.0,1.0 表示非常友好,0.0 表示中立,更低的值表示敌对 |

### 实际数据示例

**8x8 关系矩阵**
**种族顺序**: ARGONOSH, CANTOR, CRETONIAN, DONDORIAN, GARTHIMI, HUMAN, Q_AMEVIA, TILAPI

```clojure
;; 关系矩阵: 行(from) x 列(to)
;; 值: 1.0 = 非常友好, 0.5 = 中立, 0.0-0.5 = 敌对

{:race-keys ["ARGONOSH" "CANTOR" "CRETONIAN" "DONDORIAN" "GARTHIMI" "HUMAN" "Q_AMEVIA" "TILAPI"],
 :matrix
 [[1.0   0.01  1.0   0.01  1.0   1.0   1.0   0.01]   ; ARGONOSH to all
  [0.01  1.0   1.0   1.0   0.01  0.05  1.0   1.0]    ; CANTOR to all
  [0.0   1.0   1.0   0.75  0.02  0.2    0.05  0.75]   ; CRETONIAN to all
  [0.01  1.0   1.0   1.0   0.02  1.0    1.0   0.75]   ; DONDORIAN to all
  [1.0   0.02  0.02  0.02  1.0   0.02   1.0   0.3]    ; GARTHIMI to all
  [0.75  0.75  0.75  0.75  0.75   1.0   0.75   0.2]    ; HUMAN to all
  [0.1   0.1   0.1   0.1    0.25   0.1   1.0   0.1]    ; Q_AMEVIA to all
  [0.4   0.4   0.4   0.0    0.3    0.0   0.4   1.0]]}  ; TILAPI to all
```

**说明**:
- 1.0 表示该种族对目标种族非常友好
- 0.5-1.0 表示中立偏友好
- 0.0-0.5 表示有一定敌意
- 0.0 表示极度敌对

例如: GARTHIMI (贾尔蒂米人) 对 CRETONIAN (克里托尼亚人) 的关系值仅为 0.02,表示极度敌对。

---

## 公共字段说明

以下字段在多个数据类型中通用:

### 图标和精灵图
- `icon-path` - 图标文件路径,用于 UI 显示
- `sprite-path` / `sheet-path` / `lay-path` - 精灵图文件路径,用于游戏内渲染

### 颜色信息
- `color` - 颜色对象,包含:
  - `red` - 红色分量 (0-255)
  - `green` - 绿色分量 (0-255)
  - `blue` - 蓝色分量 (0-255)
  - `hex` - 十六进制颜色值

### 索引字段
- `index` - 数据在数组中的位置,用于内部引用
- `key` - 唯一标识符,用于跨文件引用

---

## 数据引用示例

### 引用种族信息

```markdown
{{RACES:ARGONOSH:name}} - 阿戈诺什人
{{RACES:ARGONOSH:description-long}} - 详细背景故事
{{RACES:ARGONOSH:boosts}} - 种族加成列表
{{RACES:ARGONOSH:physics:health}} - 健康值
```

### 引用建筑信息

```markdown
{{BUILDINGS:FARM_FRUIT:name}} - 水果农场
{{BUILDINGS:FARM_FRUIT:description}} - 建筑描述
{{BUILDINGS:FARM_FRUIT:industries:0:outputs:0}} - 产出资源
```

### 引用科技信息

```markdown
{{TECHNOLOGIES:AGRICULTURE_BASE0:name}} - 基础种植
{{TECHNOLOGIES:AGRICULTURE_BASE0:description}} - 科技描述
{{TECHNOLOGIES:AGRICULTURE_BASE0:costs}} - 科技成本
```

### 引用资源信息

```markdown
{{RESOURCES:FRUIT:name}} - 水果
{{RESOURCES:FRUIT:description}} - 资源描述
{{RESOURCES:FRUIT:category}} - 资源类别
```

---

## IR 设计原则

1. **解耦**:IR 与游戏内部实现完全解耦,编辑者不需要了解游戏解包机制
2. **统一性**:所有数据使用统一的字段命名规范
3. **可扩展性**:新字段可以方便地添加,不影响现有结构
4. **可读性**:字段名使用英文键值,但提供中文说明,便于理解
5. **完整性**:包含游戏内所有关键数据,满足 wiki 编辑的所有需求

---

## 附录:资源路径模式

所有资源路径遵循以下模式:

- 图标:`sprites/{type}/{key}/icon.png`
- 精灵图:`sprites/{type}/{key}/lay.png`
- 精灵图集:`sprites/{type}/{key}/sheet/`

其中 `{type}` 为数据类型(races, buildings, resources, techs 等),`{key}` 为数据唯一标识符。

---

## 相关文章

- [数据导出](/blog-posts/data-extraction/)
- [种族系统](/blog-posts/race-system/)
- [建筑与房间](/blog-posts/building-room/)
- [资源查询](/blog-posts/resource-system/)
- [科技系统](/blog-posts/technology-system/)
- [宗教系统](/blog-posts/religion-system/)
- [加成系统](/blog-posts/booster-system/)
