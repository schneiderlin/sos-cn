:page/title 导出游戏中的配置, 数值, 图标等
:blog-post/tags [:songs-of-syx]
:blog-post/author {:person/id :jan}
:page/body

## 为什么要导出

可以用来写 wiki 的时候引用, [游戏资源] -> [结构化数据] -> [wiki 页面].
这篇文章介绍的是 [游戏资源] -> [结构化数据] 的部分. 有这些结构化还可以作为 AI 的上下文.
可以直接让 AI 读, 也可以做成 datalog 数据库, AI 可以用更高级的查询语言找他想要的信息. 甚至是微调一个类似 functiongemma 的小模型, main agent 只通过自然语言和他交互, 就能获取游戏数据.

## 1. Resources 导出

资源是游戏中的所有物品/材料 - 从原材料(石头、木头)到加工产品(面包、工具).

### Java 类

```
init.resources.RESOURCES     - 资源注册表(静态访问)
init.resources.RESOURCE      - 单个资源(继承自 INFO)
init.resources.Minable       - 可开采资源
init.resources.Growable      - 可种植作物
init.resources.ResGDrink     - 可饮用资源
init.resources.ResGEat       - 可食用资源
init.resources.Sprite        - 资源精灵图
util.info.INFO               - 名称、描述
```

### RESOURCE 字段

| Field | Method | Type | Description |
|-------|--------|------|-------------|
| key | `.key` | String | ID (e.g., "BREAD") |
| index | `.index()` | int | 索引 |
| name | `.name` (INFO) | CharSequence | 显示名称 |
| names | `.names` (INFO) | CharSequence | 复数名称 |
| desc | `.desc` (INFO) | CharSequence | 描述 |
| category | `.category` | int | 类别 0-9 |
| degradeSpeed | `.degradeSpeed()` | double | 腐坏率/年 |
| priceCapDef | `.priceCapDef` | double | 默认 price cap |
| priceMulDef | `.priceMulDef` | double | 默认 price mul |
| icon | `.icon()` | Icon | 图标 |

### 输出示例

```edn
{:resources
 [{:key "BREAD"
   :name "Bread"
   :names "Bread"
   :description "Basic food..."
   :category 2
   :degrade-speed 0.01
   :price-cap 1.0
   :price-mul 1.0
   :edible true
   :drinkable false}
  ;; ...
  ]}
```

## 2. Races 导出

种族是可以在定居点中生活的不同物种,每个种族都有独特的特征.

### Java 类

```
init.race.RACES           - 种族注册表
init.race.Race            - 单个种族
init.race.RaceInfo        - 名称、描述、优缺点
init.race.Physics         - 物理属性(身高、碰撞箱、年龄)
init.race.RacePopulation  - 人口动态
init.race.RaceStats       - 统计数据
init.race.RacePreferrence - 食物、饮料、结构偏好
init.race.bio.Bio         - 传记描述
```

### Race 字段

| Field | Method | Type | Description |
|-------|--------|------|-------------|
| key | `.key()` | String | ID (e.g., "HUMAN") |
| index | `.index()` | int | 索引 |
| playable | `.playable` | boolean | 是否可玩 |
| name | `.info.name` | CharSequence | 显示名称 |
| desc | `.info.desc` | CharSequence | 描述 |
| height | `.physics.height()` | double | 身高 |
| growth | `.population.growth` | double | 人口增长率 |
| climate prefs | `.population.climate(c)` | double | 气候偏好 |

## 3. Technologies 导出

科技是解锁各种增益和房间的研究树.

### Java 类

| Class | Package | Description |
|-------|---------|-------------|
| `TECHS` | `init.tech` | 静态注册表 |
| `TECH` | `init.tech` | 单个科技 |
| `TechTree` | `init.tech` | 科技树分组 |
| `TechCost` | `init.tech` | 成本条目 |
| `TechCurrency` | `init.tech` | 货币类型 |

### Tech 字段

| Field | Method | Type | Description |
|-------|--------|------|-------------|
| key | `.key()` | String | ID (e.g., "CIVIL_SLAVE") |
| name | `.name` | CharSequence | 显示名称 |
| desc | `.desc` | CharSequence | 描述 |
| level-max | `.levelMax()` | int | 最大等级 |
| cost-total | `.costTotal()` | double | 总成本 |
| tree | `.tree().key` | String | 所属科技树 |

## 4. Buildings/Rooms 导出

建筑在游戏内称为"房间",包括所有可放置的结构.

### Java 类

- `settlement.room.main.ROOMS` - 主注册表
- `settlement.room.main.RoomBlueprintImp` - 实现类
- `settlement.room.main.furnisher.Furnisher` - 建造信息
- `settlement.room.industry.module.Industry` - 生产信息

### 建筑类别

| 类别 | 示例 |
|------|------|
| Agriculture | Farm, Fishery, Pasture, Orchard |
| Industry | Mine, Refiner, Workshop, Woodcutter |
| Services | Tavern, Bath, Market, Arena |
| Government | Guard, Prison, Court, School |
| Health | Hospital, Physician, Asylum |

### Building 字段

| Property | Type | Description |
|----------|------|-------------|
| key | String | 唯一 ID (e.g., "FARM") |
| name | String | 显示名称 |
| type | String | 房间类型 |
| degrade-rate | Double | 腐坏率 |
| inputs | LIST | 输入资源 |
| outputs | LIST | 输出资源 |

## 5. Boosters 导出

Boosters (Boostables) 是影响游戏各方面的属性修正.

### Boostable 类别

| 类别 | 数量 | 描述 |
|------|------|------|
| Physics | 9 | 物理属性(速度、健康、耐力) |
| Battle | 25+ | 战斗属性(攻击、防御、士气) |
| Behaviour | 5 | 行为特征(守法、忠诚、幸福) |
| Civic | 15+ | 城市管理(维护、腐败、移民) |
| Activity | 4 | 活动率(哀悼、惩罚) |
| Noble | 6 | 人格特质(攻击性、骄傲) |
| Rooms | 150+ | 建筑特定增益 |

## 6. Religion 导出

宗教是影响人口幸福感和派系关系信仰系统.

### Java 类

| Class | Package | Description |
|-------|---------|-------------|
| `RELIGIONS` | `init.religion` | 静态注册表 |
| `Religion` | `init.religion` | 单个宗教 |

### Religion 字段

| Property | Type | Description |
|----------|------|-------------|
| key | String | 唯一 ID (e.g., "CRATOR") |
| name | String | 显示名称 |
| deity | CharSequence | 神名 |
| inclination | double | 传播率 (0-1) |
| opposition | map | 与其他宗教的冲突度 |

### 宗教冲突矩阵

冲突值定义了两个宗教之间的对立程度:
- `0.0` = 相同宗教(无冲突)
- `0.5` = 中度对立
- `1.0` = 最大对立

## 7. Structures 导出

结构是用于墙壁、地板和天花板的建筑材料.

### 结构类型

| Key | Name | Durability | Resource |
|-----|------|------------|----------|
| `_MUD` | Mud | 5.0 | 无 |
| `_WOOD` | Wood | 10.0 | 2 Wood |
| `_STONE` | Stone | 20.0 | 4 Stone |

### Structure 字段

| Property | Type | Description |
|----------|------|-------------|
| key | String | 唯一 ID |
| name | String | 显示名称 |
| durability | Double | 结构耐久性 |
| constructTime | Double | 建造时间 |
| resource | RESOURCE | 所需资源 |
| resAmount | Integer | 资源数量 |

## 8. Types & Enums 导出

游戏常量,包括地形、气候、疾病、特质、需求等.

### 类型类别

| 类别 | Java 类 | 数量 | 描述 |
|------|---------|------|------|
| Terrains | `TERRAINS` | 5 | 地理地形类型 |
| Climates | `CLIMATES` | 3 | 气候区域 |
| Diseases | `DISEASES` | 变化 | 疾病 |
| Traits | `TRAITS` | 变化 | 性格特质 |
| Needs | `NEEDS` | 变化 | 服务需求 |
| HClasses | `HCLASSES` | 5 | 社会阶层 |
| HTYPES | `HTYPES` | 13 | 详细主体类别 |

### 固定地形

| Key | Name | Description |
|-----|------|-------------|
| `OCEAN` | Ocean | 盐水, 鱼类丰富 |
| `WET` | Fresh Water | 河流/湖泊, 粘土/鱼类 |
| `MOUNTAIN` | Mountain | 洞穴, 矿物 |
| `FOREST` | Forest | 森林区域, 木材 |
| `NONE` | Open Land | 默认开放地形 |

### 气候

| Key | Name | Seasonal Change | Fertility |
|-----|------|-----------------|-----------|
| `COLD` | Cold | High | Low |
| `TEMPERATE` | Temperate | Medium | Medium |
| `HOT` | Warm | Low | High |

