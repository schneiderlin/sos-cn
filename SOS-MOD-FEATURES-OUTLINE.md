# SOS-Mod Clojure REPL 功能大纲

> 本大纲整理了 sos-mod 项目中可以通过 Clojure REPL 调用的所有功能。

---

## 1. 人口与小人 (Humanoid)

### 查询功能
- `humanoid/all-entities` - 获取所有小人实体
- `humanoid/humanoid-info [entity]` - 获取小人的详细信息
  - 寿命、死亡日期、成年状态
  - 健康状态（危险、寒冷、受伤）
  - 姓名、职业类别
  - 友谊关系
- `humanoid/friendship-edn` - 导出所有友谊关系为 EDN 格式

---

## 2. 动物 (Animal)

### 查询功能
- `animal/all-animals` - 获取所有动物
- `animal/wild-animals` - 获取野生动物
- `animal/domesticated-animals` - 获取驯化动物
- `animal/animals-at-tile [tx ty]` - 获取指定瓦片上的动物
- `animal/animals-at-point [x y]` - 获取指定坐标的动物
- `animal/animals-near [entity radius]` - 获取附近动物
- `animal/animal-info [animal]` - 获取动物信息
- `animal/species-info [animal]` - 获取物种信息
- `animal/animal-resources [animal]` - 获取狩猎可获得的资源
- `animal/all-animal-species` - 获取所有动物物种

### 狩猎管理
- `animal/mark-animal-for-hunt [animal]` - 标记动物为狩猎目标
- `animal/unmark-animal-from-hunt [animal]` - 取消狩猎标记
- `animal/hunt-animals-in-area [tx ty radius]` - 标记区域内所有野生动物
- `animal/find-nearest-wild-animal [tx ty]` - 找到最近的野生动物

---

## 3. 建筑与房间 (Building/Room)

### 注册表访问
- `building/all-blueprints` - 获取所有房间蓝图
- `building/all-blueprint-imps` - 获取所有详细房间信息
- `building/blueprint-count` - 蓝图总数
- `building/blueprint-imp-count` - 详细房间总数

### 房间属性
- `building/blueprint-key [bp]` - 获取房间唯一键
- `building/room-name [room]` - 获取房间显示名称
- `building/room-desc [room]` - 获取房间描述
- `building/room-type [room]` - 获取房间类型
- `building/room-category-sub [room]` - 获取子类别
- `building/room-degrade-rate [room]` - 获取退化率
- `building/room-bonus [room]` - 获取加成信息

### 建造者 (Furnisher) 属性
- `building/room-furnisher [room]` - 获取房间建造者
- `building/furnisher-resource-count [furn]` - 资源数量
- `building/furnisher-resource [furn index]` - 指定索引资源
- `building/furnisher-uses-area? [furn]` - 是否使用区域建造
- `building/furnisher-must-be-indoors? [furn]` - 是否必须室内
- `building/furnisher-must-be-outdoors? [furn]` - 是否必须室外

### 工业生产属性
- `building/room-has-industries? [room]` - 是否有生产
- `building/room-industries [room]` - 获取生产列表
- `building/industry-inputs [ind]` - 获取输入资源
- `building/industry-outputs [ind]` - 获取输出资源
- `building/industry-resource-rate [ir]` - 获取生产速率

### 数据导出
- `building/room-icon-info [room]` - 获取房间图标信息
- `building/furnisher->map [furn]` - 转换为 Clojure map
- `building/industry->map [ind]` - 转换为生产信息 map
- `building/room-imp->map [room]` - 转换为完整房间信息 map

### 批量操作
- `building/all-rooms-as-maps` - 获取所有房间为 maps
- `building/rooms-by-category` - 按类别分组
- `building/rooms-by-type` - 按类型分组
- `building/production-rooms` - 获取所有生产房间
- `building/production-rooms-as-maps` - 获取生产房间为 maps

### 查询函数
- `building/find-room-by-key [key]` - 按键查找房间
- `building/find-rooms-by-type [type]` - 按类型查找
- `building/find-rooms-producing [resource-key]` - 查找生产特定资源的房间
- `building/find-rooms-consuming [resource-key]` - 查找消耗特定资源的房间

---

## 4. 仓库与储存 (Warehouse/Stockpile)

### 查询功能
- `warehouse/all-warehouses` - 获取所有仓库
- `warehouse/warehouse-info [warehouse]` - 获取仓库信息
- `warehouse/warehouse-position [warehouse]` - 获取仓库位置
- `warehouse/warehouse-in-area? [warehouse start-x start-y width height]` - 检查是否在区域内
- `warehouse/warehouses-in-area [start-x start-y width height]` - 获取区域内仓库

### 箱子查询
- `warehouse/crates-for-resource [warehouse resource]` - 获取特定资源箱子数
- `warehouse/crates-by-material [warehouse]` - 获取所有资源箱子数
- `warehouse/crates-by-material-named [warehouse]` - 获取箱子数（资源名为键）
- `warehouse/crates-by-material-warehouses [warehouses]` - 跨仓库聚合
- `warehouse/crates-by-material-all-warehouses` - 所有仓库聚合
- `warehouse/crates-by-material-in-area [start-x start-y width height]` - 区域内聚合

### 箱子分配设置
- `warehouse/get-crates-allocated-to-resource [warehouse resource]` - 查询分配
- `warehouse/get-crate-material-limit [warehouse resource]` - 查询单箱限制
- `warehouse/allocate-crates-to-resource-once [warehouse resource amount]` - 分配箱子
- `warehouse/set-crate-material-limit [warehouse resource amount]` - 设置单箱限制
- `warehouse/set-crate-material-limit-once [warehouse resource amount]` - 设置单箱限制（单次）
- `warehouse/get-crate-allocations [warehouse]` - 获取所有分配
- `warehouse/get-crate-material-limits [warehouse]` - 获取所有限制
- `warehouse/set-warehouse-single-material-once [warehouse resource]` - 只接受单一资源
- `warehouse/set-warehouse-materials-once [warehouse resources]` - 接受多种资源
- `warehouse/clear-warehouse-material-restrictions-once [warehouse]` - 清除所有限制

---

## 5. 资源 (Resource)

### 注册表访问
- `resource/all-resources` - 获取所有资源
- `resource/resource-count` - 资源总数
- `resource/get-resource [key]` - 按键获取资源
- `resource/stone` - 获取石头资源
- `resource/wood` - 获取木材资源
- `resource/livestock` - 获取牲畜资源

### 资源属性
- `resource/resource-key [res]` - 获取资源键
- `resource/resource-name [res]` - 获取资源名称
- `resource/resource-desc [res]` - 获取资源描述
- `resource/resource-category [res]` - 获取类别
- `resource/resource-degrade-speed [res]` - 获取腐烂速率
- `resource/resource-price-cap [res]` - 获取价格上限
- `resource/resource-price-mul [res]` - 获取价格乘数

### 资源组
- `resource/minable-list` - 获取所有可开采资源
- `resource/growable-list` - 获取所有可种植资源
- `resource/drink-list` - 获取所有饮品
- `resource/edible-list` - 获取所有食物
- `resource/edible? [res]` - 检查是否可食用
- `resource/drinkable? [res]` - 检查是否可饮用

### 数据导出
- `resource/resource->map [res]` - 转换为 map
- `resource/minable->map [m]` - 开采资源转换为 map
- `resource/growable->map [g]` - 种植资源转换为 map
- `resource/all-resources-as-maps` - 所有资源转换为 maps
- `resource/all-minables-as-maps` - 所有开采资源转换为 maps
- `resource/all-growables-as-maps` - 所有种植资源转换为 maps
- `resource/all-drinks-as-maps` - 所有饮品转换为 maps
- `resource/all-edibles-as-maps` - 所有食物转换为 maps

---

## 6. 科技 (Technology)

### 注册表访问
- `tech/all-techs` - 获取所有科技
- `tech/tech-count` - 科技总数
- `tech/all-trees` - 获取所有科技树
- `tech/tree-count` - 科技树数量
- `tech/all-costs` - 获取所有科技货币类型
- `tech/tech-info` - 获取科技系统信息

### 科技属性
- `tech/tech-key [tech]` - 获取科技键
- `tech/tech-name [tech]` - 获取科技名称
- `tech/tech-desc [tech]` - 获取科技描述
- `tech/tech-level-max [tech]` - 获取最大等级
- `tech/tech-cost-total [tech]` - 获取总成本
- `tech/tech-costs [tech]` - 获取成本列表
- `tech/tech-requirements [tech]` - 获取需求列表
- `tech/tech-boosters [tech]` - 获取加成

### 科技树属性
- `tech/tree-key [tree]` - 获取树键
- `tech/tree-name [tree]` - 获取树名称
- `tech/tree-techs [tree]` - 获取所有科技
- `tech/tree-rows [tree]` - 获取行数

### 数据导出
- `tech/tech->map [tech]` - 科技转换为 map
- `tech/tree->map [tree]` - 科技树转换为 map
- `tech/tree->map-full [tree]` - 完整科技树信息
- `tech/all-techs-as-maps` - 所有科技转换为 maps
- `tech/all-trees-as-maps` - 所有科技树转换为 maps
- `tech/all-trees-full` - 所有科技树完整信息

### 查询函数
- `tech/techs-by-tree` - 按树分组
- `tech/techs-with-no-requirements` - 无需求科技（根科技）
- `tech/techs-requiring [tech]` - 需要特定科技的科技

---

## 7. 种族 (Race)

### 注册表访问
- `race/all-races` - 获取所有种族
- `race/race-count` - 种族总数
- `race/playable-races` - 获取可玩种族
- `race/get-race [key]` - 按键获取种族

### 种族信息
- `race/race-name [race]` - 获取种族名称
- `race/race-desc [race]` - 获取种族描述
- `race/race-desc-long [race]` - 获取长描述
- `race/race-pros [race]` - 获取优势列表
- `race/race-cons [race]` - 获取劣势列表

### 物理属性
- `race/race-height [race]` - 获取高度
- `race/race-hitbox-size [race]` - 获取碰撞箱大小
- `race/race-adult-at [race]` - 获取成年天数
- `race/race-sleeps? [race]` - 是否睡觉
- `race/race-slave-price [race]` - 奴隶价格
- `race/race-raiding-value [race]` - 突袭价值

### 人口属性
- `race/race-pop-growth [race]` - 人口增长率
- `race/race-pop-max [race]` - 最大人口分数
- `race/race-immigration-rate [race]` - 移民率
- `race/race-climate-preferences [race]` - 气候偏好
- `race/race-terrain-preferences [race]` - 地形偏好

### 偏好与关系
- `race/race-preferred-foods [race]` - 偏好食物
- `race/race-preferred-drinks [race]` - 偏好饮品
- `race/race-most-hated [race]` - 最厌恶种族
- `race/race-relations [race]` - 所有种族关系

### 数据导出
- `race/race->map [race]` - 种族信息转换为 map
- `race/race->map-full [race]` - 完整种族信息
- `race/all-races-as-maps` - 所有种族转换为 maps
- `race/all-races-full` - 所有种族完整信息

### 查询函数
- `race/races-by-playability` - 按可玩性分组
- `race/races-sorted-by-slave-price` - 按奴隶价格排序
- `race/find-race-by-name [name]` - 按名称查找

---

## 8. 加成系统 (Booster)

### 注册表访问
- `booster/all-boostables` - 获取所有加成
- `booster/boostable-count` - 加成总数
- `booster/get-boostable [key]` - 按键获取加成
- `booster/all-collections` - 获取所有类别
- `booster/collection-count` - 类别数量

### 类别访问
- `booster/physics-category` - 物理加成类别
- `booster/battle-category` - 战斗加成类别
- `booster/behaviour-category` - 行为加成类别
- `booster/activity-category` - 活动加成类别
- `booster/civic-category` - 公民加成类别
- `booster/noble-category` - 贵族加成类别
- `booster/rooms-category` - 房间加成类别

### 特定加成
- `booster/physics-speed` - 速度加成
- `booster/physics-stamina` - 耐力加成
- `booster/physics-health` - 健康加成
- `booster/physics-death-age` - 寿命加成
- `booster/battle-offence` - 攻击加成
- `booster/battle-defence` - 防御加成
- `booster/behaviour-happiness` - 幸福度加成
- `booster/civic-immigration` - 移民加成

### 数据导出
- `booster/boostable->map [bo]` - 转换为 map
- `booster/category->map [cat]` - 类别转换为 map
- `booster/category->map-full [cat]` - 完整类别信息
- `booster/all-boostables-as-maps` - 所有加成转换为 maps
- `booster/all-categories-as-maps` - 所有类别转换为 maps
- `booster/all-categories-full` - 所有类别完整信息

### 查询函数
- `booster/boostables-by-category` - 按类别分组
- `booster/boostables-by-type` - 按类型分组（settlement/world）
- `booster/find-boostables-by-prefix [prefix]` - 按前缀查找
- `booster/physics-boostables` - 所有物理加成
- `booster/battle-boostables` - 所有战斗加成

---

## 9. 结构 (Structure)

### 注册表访问
- `structure/all-structures` - 获取所有结构
- `structure/structure-count` - 结构总数
- `structure/get-structure [key]` - 按键获取结构
- `structure/mud-structure` - 获取泥土结构

### 结构属性
- `structure/structure-key [s]` - 获取结构键
- `structure/structure-name [s]` - 获取结构名称
- `structure/structure-desc [s]` - 获取结构描述
- `structure/structure-name-wall [s]` - 获取墙壁名称
- `structure/structure-name-ceiling [s]` - 获取天花板名称
- `structure/structure-durability [s]` - 获取耐久度
- `structure/structure-construct-time [s]` - 获取建造时间
- `structure/structure-resource [s]` - 获取所需资源
- `structure/structure-resource-amount [s]` - 获取资源数量

### 数据导出
- `structure/structure->map [s]` - 转换为 map
- `structure/all-structures-as-maps` - 所有结构转换为 maps

### 查询函数
- `structure/find-structures-by-resource [resource-key]` - 按资源查找
- `structure/structure-by-durability` - 按耐久度排序
- `structure/structure-by-construct-time` - 按建造时间排序

---

## 10. 宗教 (Religion)

### 注册表访问
- `religion/all-religions` - 获取所有宗教
- `religion/religion-count` - 宗教总数
- `religion/religion-map` - 获取宗教 map
- `religion/get-religion [key]` - 按键获取宗教

### 宗教属性
- `religion/religion-key [rel]` - 获取宗教键
- `religion/religion-name [rel]` - 获取宗教名称
- `religion/religion-desc [rel]` - 获取宗教描述
- `religion/religion-deity [rel]` - 获取神祇名称
- `religion/religion-inclination [rel]` - 获取传播倾向
- `religion/religion-boosts [rel]` - 获取加成列表

### 对立关系
- `religion/religion-opposition [rel1 rel2]` - 获取两宗教对立值
- `religion/all-oppositions [rel]` - 获取所有对立关系
- `religion/get-opposition-matrix` - 获取完整对立矩阵

### 数据导出
- `religion/religion->map [rel]` - 转换为 map
- `religion/religion->map-basic [rel]` - 基本信息
- `religion/all-religions-as-maps` - 所有宗教转换为 maps
- `religion/all-religions-basic` - 所有宗教基本信息

### 查询函数
- `religion/religions-by-inclination` - 按传播倾向排序
- `religion/find-most-opposed [rel]` - 找到最对立的宗教
- `religion/find-least-opposed [rel]` - 找到最不对立的宗教

---

## 11. 农场 (Farm)

### 农场类型
- `farm/all-farm-types` - 获取所有农场类型
- `farm/all-farm-info` - 获取所有农场信息
- `farm/get-farm` - 获取第一个农场类型

### 地形分析
- `farm/get-fertility [tx ty]` - 获取指定瓦片土壤肥力
- `farm/get-average-fertility [start-x start-y width height]` - 获取区域平均肥力
- `farm/has-water-access? [tx ty]` - 检查是否有水源
- `farm/get-water-access-percentage [start-x start-y width height]` - 获取区域水源访问百分比
- `farm/get-farm-location-quality [center-x center-y width height]` - 获取农场位置质量

### 农场创建
- `farm/create-farm [center-x center-y width height & {:keys [...]}]` - 创建农场
- `farm/create-farm-once [...]` - 创建农场（单次更新）

### 农场管理
- `farm/all-farms` - 获取所有农场实例
- `farm/farm-at [x y]` - 获取指定位置的农场

---

## 12. 水井 (Well)

- `well/get-well` - 获取水井蓝图
- `well/create-well [center-x center-y & {:keys [...]}]` - 创建水井
- `well/create-well-once [...]` - 创建水井（单次更新）

---

## 13. 壁炉 (Hearth)

- `hearth/get-hearth` - 获取壁炉蓝图
- `hearth/create-hearth [center-x center-y width height & {:keys [...]}]` - 创建壁炉
- `hearth/create-hearth-once [...]` - 创建壁炉（单次更新）

---

## 14. 精炼厂 (Refiner)

- `refiner/find-refiner-by-key [key-name]` - 按键查找精炼厂
- `refiner/get-smelter` - 获取冶炼厂
- `refiner/all-refiner-types` - 获取所有精炼厂类型
- `refiner/all-refiner-info` - 获取所有精炼厂信息
- `refiner/create-refiner [refiner-type center-x center-y width height & {:keys [...]}]` - 创建精炼厂
- `refiner/create-refiner-once [...]` - 创建精炼厂（单次更新）
- `refiner/create-smelter-once [...]` - 创建冶炼厂（单次更新）
- `refiner/get-refiner-furniture-info [refiner-type]` - 获取精炼厂家具信息

---

## 15. 维护站 (Maintenance)

### 纯函数（可测试）
- `maintenance/find-edge-tiles [start-x start-y width height]` - 查找边缘瓦片
- `maintenance/calculate-door-position [start-x start-y width height & {:keys [...]}]` - 计算门位置
- `maintenance/calculate-workbench-positions [...]` - 计算工作台位置
- `maintenance/calculate-tool-positions [...]` - 计算工具位置
- `maintenance/calculate-occupied-tiles [furniture-positions item-width item-height]` - 计算占用瓦片
- `maintenance/find-door-position [...]` - 查找门位置
- `maintenance/select-tool-furniture-size [area-width area-height]` - 选择工具家具尺寸

### 维护站创建
- `maintenance/create-maintenance [center-x center-y width height & {:keys [...]}]` - 创建维护站
- `maintenance/create-maintenance-once [...]` - 创建维护站（单次更新）

### 维护站管理
- `maintenance/all-maintenance-stations` - 获取所有维护站
- `maintenance/maintenance-station-at [x y]` - 获取指定位置维护站
- `maintenance/maintenance-station-position [instance]` - 获取维护站位置
- `maintenance/is-auto-employ-enabled? [instance]` - 检查自动雇佣状态
- `maintenance/set-auto-employ [instance enabled]` - 设置自动雇佣
- `maintenance/set-auto-employ-once [instance enabled]` - 设置自动雇佣（单次）

---

## 16. 采集与清理 (Harvest/Clear)

### 清理功能
- `harvest/clear-wood-once [tx ty]` - 清理指定瓦片的树木
- `harvest/clear-stone-once [tx ty]` - 清理指定瓦片的石头
- `harvest/clear-wood-and-stone-once [tx ty]` - 清理指定瓦片的树木和石头
- `harvest/clear-wood-area-once [start-x start-y width height]` - 清理区域树木
- `harvest/clear-stone-area-once [start-x start-y width height]` - 清理区域石头
- `harvest/clear-wood-and-stone-area-once [start-x start-y width height]` - 清理区域树木和石头

### 采集功能
- `harvest/forage-crop-once [tx ty]` - 采集指定瓦片的野生作物
- `harvest/forage-crop-area-once [start-x start-y width height]` - 采集区域野生作物

---

## 17. 相机控制 (Camera)

- `tutorial1/get-game-window` - 获取游戏窗口
- `tutorial1/move-camera-to [x y]` - 移动相机到像素坐标
- `tutorial1/move-camera-to-tile [tile-x tile-y]` - 移动相机到瓦片坐标
- `tutorial1/move-camera-by [dx dy]` - 增量移动相机
- `tutorial1/move-camera-direction [direction & {:keys [speed]}]` - 方向移动（WASD）
- `tutorial1/get-zoom` - 获取当前缩放级别
- `tutorial1/set-zoom [level]` - 设置缩放级别
- `tutorial1/zoom-in` - 放大
- `tutorial1/zoom-out` - 缩小
- `tutorial1/zoom-by [delta]` - 缩放增量

---

## 18. 时间控制 (Time)

- `tutorial1/get-game-speed` - 获取游戏速度对象
- `tutorial1/set-time-speed [speed]` - 设置时间速度（0=暂停, 1=正常, 5=5x, 25=25x）
- `tutorial1/get-time-speed` - 获取当前时间速度
- `tutorial1/get-time-speed-target` - 获取目标速度
- `tutorial1/pause-time` - 暂停游戏
- `tutorial1/resume-time` - 恢复正常速度
- `tutorial1/toggle-pause` - 切换暂停状态
- `tutorial1/time-speed-0x` - 暂停（0x）
- `tutorial1/time-speed-1x` - 正常速度（1x）
- `tutorial1/time-speed-5x` - 快速（5x）
- `tutorial1/time-speed-25x` - 非常快（25x）

---

## 19. 家具检查 (Furniture Inspection)

- `tutorial1/get-furniture-data` - 获取家具数据实例
- `tutorial1/get-furniture-item [tx ty]` - 获取指定瓦片的家具项
- `tutorial1/get-furniture-tile [tx ty]` - 获取指定瓦片的家具瓦片
- `tutorial1/has-furniture? [tx ty]` - 检查是否有家具
- `tutorial1/has-crate? [tx ty]` - 是否有箱子
- `tutorial1/furniture-info [tx ty]` - 获取家具信息
- `tutorial1/scan-furniture-area [start-x start-y width height]` - 扫描区域家具
- `tutorial1/warehouse-furniture-info [center-x center-y width height]` - 获取仓库家具信息

---

## 20. 仓库创建 (Warehouse Creation)

### 纯函数（可测试）
- `tutorial1/find-edge-tiles [start-x start-y width height]` - 查找边缘瓦片
- `tutorial1/calculate-door-position [start-x start-y width height & {:keys [...]}]` - 计算门位置
- `tutorial1/calculate-furniture-positions [...]` - 计算家具位置
- `tutorial1/calculate-occupied-tiles [furniture-positions item-width item-height]` - 计算占用瓦片
- `tutorial1/find-door-position [...]` - 查找门位置

### 仓库创建
- `tutorial1/create-warehouse [center-x center-y width height & {:keys [...]}]` - 创建仓库
- `tutorial1/create-warehouse-once [...]` - 创建仓库（单次更新）

### 仓库信息
- `tutorial1/get-stockpile-room` - 获取仓库房间
- `tutorial1/get-stockpile-constructor` - 获取仓库建造者

### 其他
- `tutorial1/move-to-throne` - 移动相机到王座

---

## 21. REPL 工具 (REPL Utils)

### 字段访问
- `utils/get-field-value [instance field-name]` - 通过反射获取字段值

### 更新系统
- `utils/add-standalone-updater [key f]` - 添加独立更新函数
- `utils/remove-standalone-updater [key]` - 移除独立更新函数
- `utils/add-updater [key f]` - 添加更新函数（优先使用 InstanceScript）
- `utils/remove-updater [key]` - 移除更新函数
- `utils/update-once [f]` - 在下一个更新周期执行一次
- `utils/reset-standalone-updater` - 重置独立更新器状态

### 反射调用
- `utils/invoke-method [instance method-name & args]` - 通过反射调用方法

---

## 22. 公共工具 (Common)

- `common/array-list->vec [^LIST array-list]` - ArrayList 转换为 vector
- `common/array-list-resize->vec [^ArrayListResize array-list]` - 可调整 ArrayList 转换为 vector
- `common/focus [{:keys [cX cY]}]` - 聚焦到坐标
- `common/focus-entity [entity]` - 聚焦到实体
- `common/get-building-material [material-name]` - 获取建筑材料（WOOD/STONE）

---

## 23. 精灵与图标 (Sprite/Icon)

### 图标访问
- `sprite/room-icon [room]` - 获取房间图标
- `sprite/room-icon-big [room]` - 获取大图标（32x32）
- `sprite/icon-size [icon]` - 获取图标原始尺寸
- `sprite/icon-size-key [icon]` - 获取图标尺寸关键字（:small/:medium/:large）
- `sprite/icon-tile-index [icon]` - 获取图块索引
- `sprite/icon-is-composite? [icon]` - 检查是否为复合图标
- `sprite/room-icon-info [room]` - 获取房间图标完整信息

---

## 提取模块 (Extract)

以下模块用于从游戏数据中提取信息并导出为 JSON/EDN 文件：

### extract/type.clj - 类型数据
- `extract.type/extract-all-types` - 提取所有类型数据

### extract/common.clj - 公共提取
- 通用数据导出功能

### extract/tech.clj - 科技数据
- `extract.tech/extract-all-techs` - 提取所有科技数据

### extract/structure.clj - 结构数据
- `extract.structure/extract-all-structures` - 提取所有结构数据

### extract/religion.clj - 宗教数据
- `extract.religion/extract-all-religions` - 提取所有宗教数据

### extract/booster.clj - 加成数据
- `extract.booster/extract-all-boosters` - 提取所有加成数据

### extract/resource.clj - 资源数据
- `extract.resource/extract-all-resources` - 提取所有资源数据

### extract/building.clj - 建筑数据
- `extract.building/extract-all-buildings` - 提取所有建筑数据
- `extract.building/extract-building-icons` - 提取建筑图标

### extract/game_sprite.clj - 游戏精灵
- `extract.game-sprite/extract-game-sprites` - 提取游戏精灵数据

### extract/icon.clj - 图标
- `extract.icon/extract-icons` - 提取图标数据

---

## 建议文章顺序

1. **基础篇**
   - REPL 环境搭建与连接
   - 基础查询：资源、建筑、科技
   - 时间与相机控制

2. **人口篇**
   - 小人信息查询
   - 友谊关系导出

3. **建筑篇**
   - 房间查询与分类
   - 建筑创建（仓库、农场、水井等）
   - 家具放置逻辑

4. **经济篇**
   - 仓库管理与箱子分配
   - 资源与生产链

5. **世界篇**
   - 动物与狩猎
   - 地形与农场选址

6. **高级篇**
   - 更新循环与 update-once
   - 数据导出与 JSON 生成

7. **参考篇**
   - API 函数速查表
