/**
 * 种族数据可视化 - D3.js POC 版本
 * 功能：查找 HTML 注释标记，解析表格数据，用 D3.js 渲染图表
 */

window.RaceVisualizations = {
  /**
   * 初始化函数
   */
  init: function() {
    console.log('=== RaceVisualizations 初始化 ===');

    if (typeof d3 === 'undefined') {
      console.error('D3.js 未加载');
      return;
    }

    const markers = this.findMarkers();
    console.log(`找到 ${markers.length} 个可视化标记`);

    markers.forEach((marker, index) => {
      console.log(`\n处理标记 ${index + 1}: ${marker.type}`);
      this.renderVisualization(marker);
    });

    console.log('=== RaceVisualizations 完成 ===');
  },

  /**
   * 查找所有可视化标记
   */
  findMarkers: function() {
    const html = document.body.innerHTML;
    const regex = /<!--\s*VISUALIZATION:\s*([^\s]+)\s+(.+?)\s*-->/g;
    const markers = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      const markerType = match[1];
      const optionsStr = match[2];
      const options = this.parseOptions(optionsStr);

      const table = this.findNextTableAfter(match.index, html);

      markers.push({
        type: markerType,
        options: options,
        table: table,
        fallback: table ? table.cloneNode(true) : null
      });
    }

    return markers;
  },

  /**
   * 解析选项字符串
   */
  parseOptions: function(optionsStr) {
    const options = {};
    const regex = /(\w+)="([^"]*)"/g;
    let match;

    while ((match = regex.exec(optionsStr)) !== null) {
      options[match[1]] = match[2];
    }

    return options;
  },

  /**
   * 在 HTML 注释位置之后查找第一个 table 元素
   * 通过遍历 DOM 找到标记后最近的表格
   */
  findNextTableAfter: function(searchIndex, html) {
    const tables = document.querySelectorAll('table');

    if (tables.length === 0) {
      return null;
    }

    // 从 HTML 字符串中提取标记后的位置
    const markerEndIndex = html.indexOf('-->', searchIndex);
    if (markerEndIndex === -1) return tables[0];
    
    const htmlAfterMarker = html.substring(markerEndIndex);
    
    // 找到标记后第一个 <table 的位置
    const tableMatch = htmlAfterMarker.match(/<table[^>]*>/i);
    if (!tableMatch) return null;
    
    const tableStartInSubstring = tableMatch.index;
    const tableStartInFullHtml = markerEndIndex + tableStartInSubstring;
    
    // 现在我们知道标记后第一个表格在 HTML 中的位置
    // 遍历所有表格，找到位置匹配的那个
    for (const table of tables) {
      const tableHtml = table.outerHTML;
      const tablePosition = html.indexOf(tableHtml);
      
      // 如果这个表格出现在标记之后，就是我们要找的
      if (tablePosition >= markerEndIndex) {
        console.log(`找到标记后的表格，位置: ${tablePosition}`);
        return table;
      }
    }

    // 回退：返回最后一个表格（可能标记在页面末尾）
    console.warn('未能精确定位表格，返回第一个表格');
    return tables[0];
  },

  /**
   * 渲染可视化
   */
  renderVisualization: function(marker) {
    const chartType = marker.options.type || 'bar';
    
    // 网络图特殊处理：不需要marker后面的表格，使用findRelationMatrixTable单独查找
    if (chartType === 'network-graph') {
      // 创建图表容器，插入到marker注释节点后面
      const container = document.createElement('div');
      container.className = 'visualization-container';
      container.id = marker.options.data || `vis-${Date.now()}`;
      
      // 找到marker注释对应的DOM位置
      // 遍历所有注释节点，找到匹配的
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_COMMENT,
        null,
        false
      );
      let commentNode = null;
      while (walker.nextNode()) {
        // 使用 marker.type 来查找注释节点 (marker.id 不存在)
        if (walker.currentNode.nodeValue.includes(marker.type)) {
          commentNode = walker.currentNode;
          break;
        }
      }
      
      if (commentNode && commentNode.parentNode) {
        // 在注释节点后插入容器
        commentNode.parentNode.insertBefore(container, commentNode.nextSibling);
      } else {
        // 回退：找到"种族关系网络图"标题后插入
        const headings = document.querySelectorAll('h4');
        for (const heading of headings) {
          if (heading.textContent.includes('种族关系网络图')) {
            heading.parentNode.insertBefore(container, heading.nextSibling);
            break;
          }
        }
      }
      
      this.renderNetworkGraph(container, marker);
      this.addFallbackButton(container, marker);
      return;
    }
    
    if (!marker.table) {
      console.warn('未找到表格，跳过渲染');
      return;
    }

    const tableData = this.parseTableData(marker.table);

    if (!tableData || tableData.data.length === 0) {
      console.warn('表格数据为空，跳过渲染');
      return;
    }

    // 隐藏原始表格
    marker.table.style.display = 'none';

    // 创建图表容器
    const container = document.createElement('div');
    container.className = 'visualization-container';
    container.id = marker.options.data || `vis-${Date.now()}`;
    marker.table.parentNode.insertBefore(container, marker.table);

    // 根据类型渲染不同的图表
    if (chartType === 'radar-chart') {
      this.renderRadarChart(container, tableData);
    } else if (chartType === 'grouped-bar') {
      this.renderGroupedBarChart(container, tableData);
    } else if (chartType === 'semantic-heatmap') {
      this.renderSemanticHeatmap(container, tableData);
    } else if (chartType === 'efficiency-heatmap') {
      this.renderEfficiencyHeatmap(container, tableData);
    } else if (chartType === 'parallel-coords') {
      this.renderParallelCoords(container, tableData);
    } else {
      // 默认渲染柱状图
      this.renderBarChart(container, tableData);
    }

    // 添加回退按钮
    this.addFallbackButton(container, marker);
  },

  /**
   * 渲染雷达图
   */
  renderRadarChart: function(container, tableData) {
    const width = Math.min(600, container.clientWidth || 600);
    const height = 500;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };

    // 提取数值列（第一列是种族名称）
    const raceCol = tableData.headers[0];
    const valueCols = tableData.headers.slice(1);

    const data = tableData.data.map(row => {
      const values = valueCols.map(col => {
        const val = row[col];
        // 处理对象类型（如 {type: 'multiply', value: 3, raw: '3x'}）
        if (val && typeof val === 'object' && val.value !== undefined) {
          return val.value;
        }
        // 处理数字
        if (typeof val === 'number') {
          return val;
        }
        // 处理 null 或非数字值
        return 0;
      });
      return {
        race: row[raceCol],
        values: values
      };
    });

    const maxValue = d3.max(data.flatMap(d => d.values)) || 1;
    const angleSlice = Math.PI * 2 / valueCols.length;
    const radius = Math.min(width, height) / 2 - margin.top;

    const svg = d3.select('#' + container.id)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // 绘制背景网格
    const levels = 5;
    for (let i = 0; i < levels; i++) {
      const levelRadius = radius * ((i + 1) / levels);
      svg.append('circle')
        .attr('r', levelRadius)
        .attr('fill', 'none')
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1);
    }

    // 绘制轴线
    const axes = valueCols.map((col, i) => {
      return {
        col: col,
        x: radius * Math.cos(angleSlice * i - Math.PI / 2),
        y: radius * Math.sin(angleSlice * i - Math.PI / 2)
      };
    });

    axes.forEach(axis => {
      svg.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', axis.x)
        .attr('y2', axis.y)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);

      svg.append('text')
        .attr('x', axis.x * 1.1)
        .attr('y', axis.y * 1.1)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#333')
        .text(axis.col);
    });

    // 绘制数据区域
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    data.forEach((d, i) => {
      const line = d3.line()
        .x((val, j) => {
          const normalized = (val / maxValue) * radius;
          return normalized * Math.cos(angleSlice * j - Math.PI / 2);
        })
        .y((val, j) => {
          const normalized = (val / maxValue) * radius;
          return normalized * Math.sin(angleSlice * j - Math.PI / 2);
        })
        .curve(d3.curveLinearClosed);

      svg.append('path')
        .datum(d.values)
        .attr('d', line)
        .attr('fill', color(i))
        .attr('fill-opacity', 0.3)
        .attr('stroke', color(i))
        .attr('stroke-width', 2);

      // 绘制数据点
      d.values.forEach((val, j) => {
        const normalized = (val / maxValue) * radius;
        const x = normalized * Math.cos(angleSlice * j - Math.PI / 2);
        const y = normalized * Math.sin(angleSlice * j - Math.PI / 2);

        svg.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 4)
          .attr('fill', color(i))
          .attr('stroke', 'white')
          .attr('stroke-width', 2);
      });
    });

    // 添加图例
    const legend = svg.append('g')
      .attr('transform', `translate(${-width/2 + 20}, ${-height/2 + 20})`);

    data.forEach((d, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', color(i))
        .attr('fill-opacity', 0.3)
        .attr('stroke', color(i));

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', '12px')
        .attr('fill', '#333')
        .text(d.race);
    });
  },

  /**
   * 渲染柱状图
   */
  renderBarChart: function(container, tableData) {
    const width = Math.min(800, container.clientWidth || 800);
    const height = 400;
    const margin = { top: 60, right: 30, bottom: 60, left: 80 };

    const svg = d3.select('#' + container.id)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const raceCol = tableData.headers[0];
    const valueCols = tableData.headers.slice(1);

    const data = tableData.data.map(row => {
      const obj = { race: row[raceCol] };
      valueCols.forEach(col => {
        const val = row[col];
        // 处理对象类型（如 {type: 'multiply', value: 3, raw: '3x'}）
        if (val && typeof val === 'object' && val.value !== undefined) {
          obj[col] = val.value;
        } else if (typeof val === 'number') {
          // 处理数字
          obj[col] = val;
        } else {
          // 处理 null 或非数字值
          obj[col] = 0;
        }
      });
      return obj;
    });

    const x0 = d3.scaleBand()
      .domain(data.map(d => d.race))
      .rangeRound([0, width - margin.left - margin.right])
      .paddingInner(0.1);

    const x1 = d3.scaleBand()
      .domain(valueCols)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(valueCols, col => d[col]))])
      .nice()
      .rangeRound([height - margin.top - margin.bottom, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    g.append('g')
      .selectAll('g')
      .data(data)
      .join('g')
      .attr('transform', d => `translate(${x0(d.race)}, 0)`)
      .selectAll('rect')
      .data(d => valueCols.map(key => ({ key, value: d[key], race: d.race })))
      .join('rect')
      .attr('x', d => x1(d.key))
      .attr('y', d => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', d => y(0) - y(d.value))
      .attr('fill', d => color(d.key))
      .append('title')
      .text(d => `${d.race} - ${d.key}: ${d.value}`);

    g.append('g')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.append('g')
      .call(d3.axisLeft(y).ticks(null, 's'))
      .append('text')
      .attr('x', 2)
      .attr('y', y(y.ticks()[0]))
      .attr('dy', '0.32em')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start')
      .text('数值');

    const legend = g.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(valueCols)
      .join('g')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legend.append('rect')
      .attr('x', width - margin.left - margin.right - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', color);

    legend.append('text')
      .attr('x', width - margin.left - margin.right - 24)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(d => d);
  },

  /**
   * 渲染分组柱状图（用于种族基本信息等）
   * 重新设计：使用多行水平条形图，每个指标一行，带独立刻度
   */
  renderGroupedBarChart: function(container, tableData) {
    const raceCol = tableData.headers[0];
    const boolCols = tableData.headers.slice(1, 2);
    const numericCols = tableData.headers.slice(2);

    const data = tableData.data.map(row => {
      const obj = { race: row[raceCol] };
      boolCols.forEach(col => {
        obj[col] = row[col] === '是' || row[col] === true;
      });
      numericCols.forEach(col => {
        const val = row[col];
        if (typeof val === 'number') {
          obj[col] = val;
        } else if (val && typeof val === 'object' && val.value !== undefined) {
          obj[col] = val.value;
        } else {
          obj[col] = 0;
        }
      });
      return obj;
    });

    // 创建主容器
    const mainContainer = document.createElement('div');
    mainContainer.className = 'race-info-grid';
    mainContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      padding: 20px 0;
    `;
    container.appendChild(mainContainer);

    // 为每个指标创建一个独立的小图表
    numericCols.forEach((col, colIndex) => {
      const chartCard = document.createElement('div');
      chartCard.className = 'metric-card';
      chartCard.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      `;

      // 标题
      const title = document.createElement('h4');
      title.textContent = col;
      title.style.cssText = `
        margin: 0 0 16px 0;
        color: #e0e0e0;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.5px;
        border-bottom: 2px solid ${this.getMetricColor(colIndex)};
        padding-bottom: 8px;
      `;
      chartCard.appendChild(title);

      const maxValue = Math.max(...data.map(d => d[col]));
      
      // 排序数据，按该指标降序
      const sortedData = [...data].sort((a, b) => b[col] - a[col]);

      sortedData.forEach((d, i) => {
        const row = document.createElement('div');
        row.style.cssText = `
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          gap: 10px;
        `;

        // 可玩标记
        const playableDot = document.createElement('span');
        playableDot.style.cssText = `
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${d[boolCols[0]] ? '#10b981' : '#6b7280'};
          flex-shrink: 0;
        `;
        playableDot.title = d[boolCols[0]] ? '可玩种族' : '不可玩';
        row.appendChild(playableDot);

        // 种族名
        const raceName = document.createElement('span');
        raceName.textContent = d.race;
        raceName.style.cssText = `
          width: 80px;
          flex-shrink: 0;
          color: #d1d5db;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `;
        row.appendChild(raceName);

        // 进度条容器
        const barContainer = document.createElement('div');
        barContainer.style.cssText = `
          flex: 1;
          height: 22px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        `;

        // 进度条
        const bar = document.createElement('div');
        const percentage = maxValue > 0 ? (d[col] / maxValue) * 100 : 0;
        bar.style.cssText = `
          width: ${percentage}%;
          height: 100%;
          background: linear-gradient(90deg, ${this.getMetricColor(colIndex)}cc, ${this.getMetricColor(colIndex)});
          border-radius: 4px;
          transition: width 0.5s ease;
        `;
        barContainer.appendChild(bar);

        row.appendChild(barContainer);

        // 数值
        const value = document.createElement('span');
        value.textContent = this.formatValue(d[col]);
        value.style.cssText = `
          width: 60px;
          text-align: right;
          color: #f3f4f6;
          font-size: 14px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        `;
        row.appendChild(value);

        chartCard.appendChild(row);
      });

      mainContainer.appendChild(chartCard);
    });

    // 添加图例说明
    const legendDiv = document.createElement('div');
    legendDiv.style.cssText = `
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      gap: 24px;
      padding: 16px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      margin-top: 8px;
    `;
    
    const playableLegend = document.createElement('span');
    playableLegend.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;margin-right:6px;vertical-align:middle;"></span><span style="color:#9ca3af;font-size:13px;">可玩种族</span>';
    
    const nonPlayableLegend = document.createElement('span');
    nonPlayableLegend.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#6b7280;margin-right:6px;vertical-align:middle;"></span><span style="color:#9ca3af;font-size:13px;">不可玩种族</span>';
    
    legendDiv.appendChild(playableLegend);
    legendDiv.appendChild(nonPlayableLegend);
    mainContainer.appendChild(legendDiv);
  },

  /**
   * 渲染语义热力图
   * 用于展示加法和乘法混合的属性数据，通过颜色表示对玩家的有利程度
   */
  renderSemanticHeatmap: function(container, tableData) {
    const raceCol = tableData.headers[0];
    const attrCols = tableData.headers.slice(1);

    // 属性语义配置：positive = 数值越大越好，negative = 数值越大越差
    const attrSemantics = {
      // 物理属性
      '体重': 'neutral',      // 中性：大=强壮但笨重
      '健康': 'positive',     // 越高越好
      '速度': 'positive',     // 越快越好
      '加速': 'positive',     // 越高越好（0.75x 是减速）
      '寿命': 'positive',     // 越长越好
      '饥饿': 'negative',     // 越低越好（2x = 吃得多 = 差）
      '耐寒': 'positive',     // 越高越好
      '耐热': 'positive',     // 越高越好
      // 行为属性
      '士气': 'positive',     // 越高越好
      '守法': 'positive',     // 越高越好
      '服从度': 'negative',   // 越高 = 越难控制 = 差（服从度低的更难管理）
      '理智': 'positive',     // 越高越好（不容易发疯）
      '虔诚': 'neutral',      // 中性：虔诚度高可能有利有弊
      // 战斗属性
      '打击力量': 'positive',
      '打击承受': 'positive',
      '穿刺伤害': 'positive',
      '穿刺护甲': 'positive',
      '弓箭技能': 'positive',
    };

    // 创建主容器
    const mainContainer = document.createElement('div');
    mainContainer.className = 'semantic-heatmap';
    mainContainer.style.cssText = `
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
      border-radius: 16px;
      padding: 24px;
      overflow-x: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    `;
    container.appendChild(mainContainer);

    // 创建表格
    const table = document.createElement('table');
    table.style.cssText = `
      width: 100%;
      border-collapse: separate;
      border-spacing: 4px;
      font-size: 14px;
    `;

    // 表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    tableData.headers.forEach((header, i) => {
      const th = document.createElement('th');
      th.textContent = header;
      th.style.cssText = `
        padding: 12px 16px;
        text-align: ${i === 0 ? 'left' : 'center'};
        color: #94a3b8;
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #334155;
        white-space: nowrap;
      `;
      
      // 为属性列添加语义指示器
      if (i > 0) {
        const semantic = attrSemantics[header] || 'neutral';
        const indicator = semantic === 'positive' ? '↑' : semantic === 'negative' ? '↓' : '◆';
        const indicatorColor = semantic === 'positive' ? '#10b981' : semantic === 'negative' ? '#ef4444' : '#94a3b8';
        th.innerHTML = `${header} <span style="color:${indicatorColor};font-size:10px;">${indicator}</span>`;
      }
      
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 表体
    const tbody = document.createElement('tbody');
    
    tableData.data.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      tr.style.cssText = `
        transition: background 0.2s ease;
      `;
      tr.onmouseenter = () => tr.style.background = 'rgba(255,255,255,0.03)';
      tr.onmouseleave = () => tr.style.background = 'transparent';

      tableData.headers.forEach((header, colIndex) => {
        const td = document.createElement('td');
        const value = row[header];
        
        if (colIndex === 0) {
          // 种族名称列
          td.textContent = value;
          td.style.cssText = `
            padding: 12px 16px;
            color: #e2e8f0;
            font-weight: 500;
            white-space: nowrap;
            border-radius: 6px;
            background: rgba(255,255,255,0.02);
          `;
        } else {
          // 属性值列
          const cellData = this.parseCellForHeatmap(value, attrSemantics[header] || 'neutral');
          td.innerHTML = cellData.display;
          td.style.cssText = `
            padding: 10px 12px;
            text-align: center;
            border-radius: 6px;
            font-weight: 500;
            font-variant-numeric: tabular-nums;
            background: ${cellData.bgColor};
            color: ${cellData.textColor};
            transition: transform 0.2s ease;
          `;
          td.title = cellData.tooltip;
        }
        
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    mainContainer.appendChild(table);

    // 添加图例
    const legend = document.createElement('div');
    legend.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #334155;
    `;
    
    const legendItems = [
      { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: '有利加成' },
      { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '不利加成' },
      { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '中性/大型' },
      { color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)', text: '无修改' },
    ];
    
    legendItems.forEach(item => {
      const legendItem = document.createElement('span');
      legendItem.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #94a3b8;
      `;
      legendItem.innerHTML = `
        <span style="
          display: inline-block;
          width: 24px;
          height: 18px;
          border-radius: 4px;
          background: ${item.bg};
          border: 1px solid ${item.color}40;
        "></span>
        ${item.text}
      `;
      legend.appendChild(legendItem);
    });
    
    mainContainer.appendChild(legend);
  },

  /**
   * 渲染效率热力图（房间效率矩阵）
   * 专门针对效率数据设计：1.0x 为基准，>1 为好，<1 为差
   */
  renderEfficiencyHeatmap: function(container, tableData) {
    const raceCol = tableData.headers[0];
    const roomCols = tableData.headers.slice(1);

    // 创建主容器
    const mainContainer = document.createElement('div');
    mainContainer.className = 'efficiency-heatmap';
    mainContainer.style.cssText = `
      background: linear-gradient(135deg, #0a0a14 0%, #121225 100%);
      border-radius: 16px;
      padding: 24px;
      overflow-x: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    `;
    container.appendChild(mainContainer);

    // 创建表格
    const table = document.createElement('table');
    table.style.cssText = `
      width: 100%;
      border-collapse: separate;
      border-spacing: 3px;
      font-size: 13px;
    `;

    // 表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    tableData.headers.forEach((header, i) => {
      const th = document.createElement('th');
      th.textContent = header;
      th.style.cssText = `
        padding: 10px 8px;
        text-align: ${i === 0 ? 'left' : 'center'};
        color: #8892b0;
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        white-space: nowrap;
        ${i === 0 ? 'position: sticky; left: 0; background: #121225; z-index: 1;' : ''}
      `;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 表体
    const tbody = document.createElement('tbody');
    
    tableData.data.forEach((row) => {
      const tr = document.createElement('tr');

      tableData.headers.forEach((header, colIndex) => {
        const td = document.createElement('td');
        const value = row[header];
        
        if (colIndex === 0) {
          // 种族名称列
          td.textContent = value;
          td.style.cssText = `
            padding: 8px 12px;
            color: #ccd6f6;
            font-weight: 500;
            white-space: nowrap;
            position: sticky;
            left: 0;
            background: #121225;
            z-index: 1;
          `;
        } else {
          // 效率值列
          const cellData = this.parseEfficiencyCell(value);
          td.innerHTML = cellData.display;
          td.style.cssText = `
            padding: 6px 8px;
            text-align: center;
            border-radius: 4px;
            font-weight: 600;
            font-variant-numeric: tabular-nums;
            font-size: 12px;
            background: ${cellData.bgColor};
            color: ${cellData.textColor};
            min-width: 50px;
          `;
          td.title = cellData.tooltip;
        }
        
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    mainContainer.appendChild(table);

    // 添加颜色图例
    const legend = document.createElement('div');
    legend.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #233554;
    `;
    
    const gradientBar = document.createElement('div');
    gradientBar.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    gradientBar.innerHTML = `
      <span style="color:#64748b;font-size:12px;">低效</span>
      <div style="
        width: 200px;
        height: 12px;
        border-radius: 6px;
        background: linear-gradient(90deg, 
          rgba(239, 68, 68, 0.8) 0%,
          rgba(239, 68, 68, 0.4) 20%,
          rgba(100, 116, 139, 0.2) 50%,
          rgba(16, 185, 129, 0.4) 80%,
          rgba(16, 185, 129, 0.8) 100%
        );
      "></div>
      <span style="color:#64748b;font-size:12px;">高效</span>
    `;
    legend.appendChild(gradientBar);
    
    const defaultNote = document.createElement('span');
    defaultNote.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border-radius:3px;background:rgba(100,116,139,0.15);margin-right:6px;vertical-align:middle;"></span><span style="color:#64748b;font-size:12px;">— = 默认 (1.0x)</span>';
    legend.appendChild(defaultNote);
    
    mainContainer.appendChild(legend);
  },

  /**
   * 解析效率单元格数据
   */
  parseEfficiencyCell: function(value) {
    // 处理 null、undefined 或 "-"
    if (value === null || value === undefined || value === '-' || value === '—') {
      return {
        display: '<span style="opacity:0.3;">—</span>',
        bgColor: 'rgba(100, 116, 139, 0.1)',
        textColor: '#475569',
        tooltip: '默认效率 (1.0x)'
      };
    }

    let numValue, displayValue;
    
    // 解析值
    if (typeof value === 'object' && value !== null) {
      numValue = value.value;
      displayValue = value.raw || `${numValue}x`;
    } else if (typeof value === 'string') {
      const strVal = value.trim();
      if (strVal.endsWith('x')) {
        numValue = parseFloat(strVal.slice(0, -1));
        displayValue = strVal;
      } else {
        numValue = parseFloat(strVal);
        displayValue = `${numValue}x`;
      }
    } else if (typeof value === 'number') {
      numValue = value;
      displayValue = `${numValue}x`;
    } else {
      return {
        display: String(value),
        bgColor: 'transparent',
        textColor: '#94a3b8',
        tooltip: ''
      };
    }

    if (isNaN(numValue)) {
      return {
        display: String(value),
        bgColor: 'transparent',
        textColor: '#94a3b8',
        tooltip: ''
      };
    }

    // 计算颜色 - 基于对数偏离度
    // 1.0 = 基准，2.0 = 很好，0.5 = 很差
    const logDeviation = Math.log2(numValue);
    const absDeviation = Math.abs(logDeviation);
    const intensity = Math.min(absDeviation / 1.5, 1); // 归一化
    
    let bgColor, textColor;
    
    if (Math.abs(numValue - 1) < 0.01) {
      // 接近 1.0，中性
      bgColor = 'rgba(100, 116, 139, 0.15)';
      textColor = '#94a3b8';
    } else if (numValue > 1) {
      // 高效 - 绿色
      bgColor = `rgba(16, 185, 129, ${0.15 + intensity * 0.45})`;
      textColor = intensity > 0.5 ? '#ffffff' : '#34d399';
    } else {
      // 低效 - 红色
      bgColor = `rgba(239, 68, 68, ${0.15 + intensity * 0.55})`;
      textColor = intensity > 0.5 ? '#ffffff' : '#f87171';
    }

    const effectDesc = numValue > 1 ? '效率加成' : numValue < 1 ? '效率惩罚' : '正常效率';
    
    return {
      display: displayValue,
      bgColor,
      textColor,
      tooltip: `${effectDesc}: ${(numValue * 100).toFixed(0)}%`
    };
  },

  /**
   * 渲染网络图（种族关系）
   * 使用 D3 力导向图
   */
  renderNetworkGraph: function(container, marker) {
    // 从页面中找到种族关系矩阵表格
    const relationTable = this.findRelationMatrixTable();
    if (!relationTable) {
      container.innerHTML = '<p style="color:#ef4444;padding:20px;">未找到种族关系矩阵数据</p>';
      return;
    }

    const matrixData = this.parseTableData(relationTable);
    if (!matrixData || matrixData.data.length === 0) {
      container.innerHTML = '<p style="color:#ef4444;padding:20px;">关系矩阵数据解析失败</p>';
      return;
    }

    // 构建节点和边数据
    // 创建名称映射：短名称 -> 全名称（第一列的种族名）
    const races = matrixData.data.map(row => row[matrixData.headers[0]]);
    const headerRaces = matrixData.headers.slice(1);
    
    // 尝试建立短名和全名的映射
    const nameMap = {};
    headerRaces.forEach(shortName => {
      // 找到对应的全名：
      // 1. 全名以短名开头（如：阿戈诺什 -> 阿戈诺什人）
      // 2. 全名包含短名（如：坎特 -> 坎特巨人）
      // 3. 完全匹配（如：人类 -> 人类）
      const fullName = races.find(r => 
        r === shortName || 
        r.startsWith(shortName) || 
        r.includes(shortName)
      );
      nameMap[shortName] = fullName || shortName;
    });
    console.log('名称映射:', nameMap);
    console.log('种族列表 (rows):', races);
    console.log('表头种族 (headers):', headerRaces);
    
    const nodes = races.map((race, i) => ({
      id: race,
      index: i,
      x: 350 + Math.cos(i * 2 * Math.PI / 8) * 150,
      y: 275 + Math.sin(i * 2 * Math.PI / 8) * 150
    }));
    console.log('创建的节点:', nodes.map(n => `${n.id}:(${Math.round(n.x)},${Math.round(n.y)})`));

    const links = [];
    matrixData.data.forEach((row, i) => {
      const sourceRace = row[matrixData.headers[0]];
      headerRaces.forEach((headerRace, j) => {
        if (i < j) { // 只取上三角，避免重复
          const value = row[headerRace];
          const numValue = typeof value === 'number' ? value : 
                          (value && typeof value === 'object' ? value.value : parseFloat(value) || 0);
          const targetRace = nameMap[headerRace] || headerRace;
          links.push({
            source: sourceRace,
            target: targetRace,
            value: numValue
          });
        }
      });
    });
    console.log('创建的链接数量:', links.length);
    console.log('链接示例:', JSON.stringify(links.slice(0, 3)));

    const width = Math.min(700, container.clientWidth || 700);
    const height = 550;
    console.log('容器尺寸:', width, 'x', height, 'container.clientWidth:', container.clientWidth);

    // 创建主容器
    const mainContainer = document.createElement('div');
    mainContainer.className = 'network-graph';
    mainContainer.style.cssText = `
      background: linear-gradient(135deg, #0a0a14 0%, #0f1729 100%);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    `;
    container.appendChild(mainContainer);
    console.log('mainContainer 已添加到 container');

    const svg = d3.select(mainContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('display', 'block')
      .style('background', 'transparent');
    console.log('SVG 元素已创建:', svg.node());
    console.log('SVG 尺寸:', svg.node().getAttribute('width'), 'x', svg.node().getAttribute('height'));

    // 添加调试背景
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'rgba(30, 41, 59, 0.5)')
      .attr('rx', 8);

    // 定义箭头标记
    svg.append('defs').selectAll('marker')
      .data(['friendly', 'neutral', 'hostile'])
      .join('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', d => d === 'friendly' ? '#10b981' : d === 'hostile' ? '#ef4444' : '#64748b')
      .attr('d', 'M0,-5L10,0L0,5');

    // 颜色比例尺：关系值 0-1 映射到红-灰-绿
    const colorScale = d3.scaleLinear()
      .domain([0, 0.3, 0.7, 1])
      .range(['#ef4444', '#f59e0b', '#94a3b8', '#10b981']);

    // 边宽度比例尺
    const widthScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0.5, 4]);

    // 力模拟
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // 绘制边 - 显式设置所有样式属性
    const linksGroup = svg.append('g')
      .attr('class', 'links')
      .style('pointer-events', 'none');
    
    const link = linksGroup.selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => colorScale(d.value))
      .attr('stroke-opacity', d => 0.4 + d.value * 0.4)
      .attr('stroke-width', d => widthScale(d.value))
      .style('stroke', d => colorScale(d.value))
      .style('stroke-linecap', 'round');

    // 节点组
    const nodesGroup = svg.append('g')
      .attr('class', 'nodes');
    
    const node = nodesGroup.selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // 节点圆圈 - 更大、更明显的样式
    node.append('circle')
      .attr('r', 22)
      .attr('fill', (d, i) => d3.schemeTableau10[i % 10])
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('fill', (d, i) => d3.schemeTableau10[i % 10])
      .style('stroke', '#ffffff')
      .style('stroke-width', '2px')
      .style('cursor', 'pointer');

    // 节点标签 - 使用更大的字体
    node.append('text')
      .text(d => d.id.slice(0, 4))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .style('fill', '#ffffff')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // 悬停时显示完整名称
    node.append('title')
      .text(d => d.id);
    
    console.log('SVG 子元素检查:');
    console.log('- links group:', linksGroup.node());
    console.log('- nodes group:', nodesGroup.node());
    console.log('- link elements count:', link.size());
    console.log('- node elements count:', node.size());
    console.log('- 第一个节点 circle 属性:', node.select('circle').node() ? 
      `fill=${node.select('circle').attr('fill')}, r=${node.select('circle').attr('r')}` : 'none');
    console.log('- 第一个 link 属性:', link.node() ? 
      `stroke=${link.attr('stroke')}, strokeWidth=${link.attr('stroke-width')}` : 'none');

    // 更新位置
    let tickCount = 0;
    simulation.on('tick', () => {
      tickCount++;
      if (tickCount <= 3 || tickCount % 50 === 0) {
        const sample = nodes.slice(0, 2).map(n => `${n.id}:(${Math.round(n.x)},${Math.round(n.y)})`);
        console.log(`Tick ${tickCount}: ${sample.join(', ')}`);
      }
      
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    simulation.on('end', () => {
      const positions = nodes.map(n => `${n.id}:(${Math.round(n.x)},${Math.round(n.y)})`);
      console.log('模拟结束，最终节点位置:', positions.join(' | '));
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // 添加图例
    const legend = document.createElement('div');
    legend.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #233554;
    `;
    legend.innerHTML = `
      <span style="color:#64748b;font-size:12px;">敌对</span>
      <div style="
        width: 150px;
        height: 8px;
        border-radius: 4px;
        background: linear-gradient(90deg, #ef4444 0%, #f59e0b 30%, #94a3b8 70%, #10b981 100%);
      "></div>
      <span style="color:#64748b;font-size:12px;">友好</span>
      <span style="color:#475569;font-size:11px;margin-left:12px;">拖拽节点可调整位置</span>
    `;
    mainContainer.appendChild(legend);
  },

  /**
   * 查找种族关系矩阵表格
   */
  findRelationMatrixTable: function() {
    // 查找包含"种族关系矩阵"的标题后的表格
    const headings = document.querySelectorAll('h4');
    for (const heading of headings) {
      if (heading.textContent.includes('种族关系矩阵')) {
        let sibling = heading.nextElementSibling;
        while (sibling) {
          if (sibling.tagName === 'TABLE') {
            return sibling;
          }
          if (sibling.tagName && sibling.tagName.match(/^H[1-4]$/)) {
            break; // 遇到下一个标题就停止
          }
          sibling = sibling.nextElementSibling;
        }
      }
    }
    return null;
  },

  /**
   * 渲染平行坐标图（战斗属性）
   */
  renderParallelCoords: function(container, tableData) {
    const raceCol = tableData.headers[0];
    const attrCols = tableData.headers.slice(1);

    // 解析数据，处理混合类型
    const data = tableData.data.map(row => {
      const obj = { race: row[raceCol] };
      attrCols.forEach(col => {
        const val = row[col];
        if (val === null || val === undefined || val === '-') {
          obj[col] = null; // 保留 null 表示无数据
        } else if (typeof val === 'object' && val.value !== undefined) {
          obj[col] = val.value;
        } else if (typeof val === 'number') {
          obj[col] = val;
        } else {
          const parsed = parseFloat(String(val).replace('x', '').replace('+', ''));
          obj[col] = isNaN(parsed) ? null : parsed;
        }
      });
      return obj;
    });

    const width = Math.min(850, container.clientWidth || 850);
    const height = 450;
    const margin = { top: 50, right: 40, bottom: 30, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // 创建主容器
    const mainContainer = document.createElement('div');
    mainContainer.className = 'parallel-coords';
    mainContainer.style.cssText = `
      background: linear-gradient(135deg, #0a0a14 0%, #0f1729 100%);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      overflow-x: auto;
    `;
    container.appendChild(mainContainer);

    const svg = d3.select(mainContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 为每个属性创建比例尺
    const y = {};
    attrCols.forEach(col => {
      const values = data.map(d => d[col]).filter(v => v !== null);
      const extent = d3.extent(values);
      // 如果没有数据或范围为0，创建默认范围
      if (values.length === 0 || extent[0] === extent[1]) {
        y[col] = d3.scaleLinear()
          .domain([0, 1])
          .range([innerHeight, 0]);
      } else {
        y[col] = d3.scaleLinear()
          .domain(extent)
          .nice()
          .range([innerHeight, 0]);
      }
    });

    // x 比例尺用于属性列的位置
    const x = d3.scalePoint()
      .domain(attrCols)
      .range([0, innerWidth])
      .padding(0.5);

    // 颜色比例尺
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    // 绘制每条折线
    const line = d3.line()
      .defined(([, value]) => value !== null)
      .x(([key]) => x(key))
      .y(([key, value]) => y[key](value));

    // 背景网格
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(attrCols)
      .join('line')
      .attr('x1', d => x(d))
      .attr('y1', 0)
      .attr('x2', d => x(d))
      .attr('y2', innerHeight)
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1);

    // 绘制折线
    const paths = g.append('g')
      .attr('class', 'lines')
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('d', d => line(attrCols.map(col => [col, d[col]])))
      .attr('fill', 'none')
      .attr('stroke', (d, i) => color(i))
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.7)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 4)
          .attr('stroke-opacity', 1)
          .raise();
      })
      .on('mouseleave', function() {
        d3.select(this)
          .attr('stroke-width', 2.5)
          .attr('stroke-opacity', 0.7);
      });

    paths.append('title')
      .text(d => d.race);

    // 绘制数据点
    data.forEach((d, i) => {
      attrCols.forEach(col => {
        if (d[col] !== null) {
          g.append('circle')
            .attr('cx', x(col))
            .attr('cy', y[col](d[col]))
            .attr('r', 4)
            .attr('fill', color(i))
            .attr('stroke', '#0a0a14')
            .attr('stroke-width', 1.5)
            .append('title')
            .text(`${d.race} - ${col}: ${d[col]}`);
        }
      });
    });

    // 绘制轴
    attrCols.forEach(col => {
      const axis = g.append('g')
        .attr('transform', `translate(${x(col)},0)`);

      // 轴线
      axis.call(d3.axisLeft(y[col]).ticks(5).tickSize(-5))
        .call(g => g.select('.domain').attr('stroke', '#334155'))
        .call(g => g.selectAll('.tick line').attr('stroke', '#334155'))
        .call(g => g.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '10px'));

      // 轴标签
      axis.append('text')
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .text(col);
    });

    // 添加图例
    const legend = document.createElement('div');
    legend.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #233554;
    `;

    data.forEach((d, i) => {
      const item = document.createElement('span');
      item.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      `;
      item.innerHTML = `
        <span style="
          display: inline-block;
          width: 12px;
          height: 3px;
          border-radius: 2px;
          background: ${color(i)};
        "></span>
        ${d.race}
      `;
      item.onmouseenter = () => {
        item.style.background = 'rgba(255,255,255,0.05)';
        paths.attr('stroke-opacity', (pd, pi) => pi === i ? 1 : 0.15);
      };
      item.onmouseleave = () => {
        item.style.background = 'transparent';
        paths.attr('stroke-opacity', 0.7);
      };
      legend.appendChild(item);
    });

    mainContainer.appendChild(legend);
  },

  /**
   * 解析单元格数据用于热力图显示
   */
  parseCellForHeatmap: function(value, semantic) {
    // 处理 null、undefined 或 "-"
    if (value === null || value === undefined || value === '-' || value === '—') {
      return {
        display: '<span style="opacity:0.4;">—</span>',
        bgColor: 'rgba(100, 116, 139, 0.08)',
        textColor: '#64748b',
        tooltip: '无修改，使用默认值'
      };
    }

    let numValue, isMultiply, displayValue;
    
    // 解析值
    if (typeof value === 'object' && value !== null) {
      // 已解析的对象格式
      isMultiply = value.type === 'multiply';
      numValue = value.value;
      displayValue = value.raw || (isMultiply ? `${numValue}x` : (numValue >= 0 ? `+${numValue}` : numValue));
    } else if (typeof value === 'string') {
      const strVal = value.trim();
      if (strVal.endsWith('x')) {
        isMultiply = true;
        numValue = parseFloat(strVal.slice(0, -1));
        displayValue = strVal;
      } else if (strVal.startsWith('+') || strVal.startsWith('-')) {
        isMultiply = false;
        numValue = parseFloat(strVal);
        displayValue = strVal;
      } else {
        numValue = parseFloat(strVal);
        isMultiply = false;
        displayValue = numValue >= 0 ? `+${numValue}` : `${numValue}`;
      }
    } else if (typeof value === 'number') {
      numValue = value;
      isMultiply = false;
      displayValue = numValue >= 0 ? `+${numValue}` : `${numValue}`;
    } else {
      return {
        display: String(value),
        bgColor: 'transparent',
        textColor: '#94a3b8',
        tooltip: ''
      };
    }

    if (isNaN(numValue)) {
      return {
        display: String(value),
        bgColor: 'transparent',
        textColor: '#94a3b8',
        tooltip: ''
      };
    }

    // 计算"偏离程度"
    let deviation;
    if (isMultiply) {
      // 乘法：以 1.0 为基准，计算对数偏离
      // 2x → +1, 0.5x → -1, 1x → 0
      deviation = Math.log2(numValue);
    } else {
      // 加法：直接使用数值作为偏离
      deviation = numValue;
    }

    // 根据语义确定颜色
    let isGood;
    if (semantic === 'positive') {
      isGood = deviation > 0;
    } else if (semantic === 'negative') {
      isGood = deviation < 0;
    } else {
      // neutral：使用橙色
      isGood = null;
    }

    // 计算颜色强度（基于偏离绝对值）
    const absDeviation = Math.abs(deviation);
    const intensity = Math.min(absDeviation / 2, 1); // 归一化到 0-1
    
    let bgColor, textColor;
    
    if (deviation === 0 || (isMultiply && numValue === 1)) {
      // 无变化
      bgColor = 'rgba(100, 116, 139, 0.08)';
      textColor = '#64748b';
    } else if (isGood === null) {
      // 中性属性（如体重）- 使用橙色
      bgColor = `rgba(245, 158, 11, ${0.1 + intensity * 0.2})`;
      textColor = '#fbbf24';
    } else if (isGood) {
      // 有利 - 绿色
      bgColor = `rgba(16, 185, 129, ${0.1 + intensity * 0.25})`;
      textColor = '#34d399';
    } else {
      // 不利 - 红色
      bgColor = `rgba(239, 68, 68, ${0.1 + intensity * 0.25})`;
      textColor = '#f87171';
    }

    // 生成 tooltip
    const typeStr = isMultiply ? '乘法修正' : '加法修正';
    const baseStr = isMultiply ? '基准 1.0' : '基准 0';
    const effectStr = isGood === true ? '(有利)' : isGood === false ? '(不利)' : '(中性)';
    
    return {
      display: displayValue,
      bgColor,
      textColor,
      tooltip: `${typeStr}，${baseStr}，${effectStr}`
    };
  },

  /**
   * 获取指标颜色
   */
  getMetricColor: function(index) {
    const colors = [
      '#f59e0b', // 琥珀色 - 身高
      '#3b82f6', // 蓝色 - 奴隶价格
      '#10b981', // 翠绿色 - 成年天数
      '#8b5cf6', // 紫色
      '#ef4444', // 红色
      '#06b6d4', // 青色
    ];
    return colors[index % colors.length];
  },

  /**
   * 格式化数值显示
   */
  formatValue: function(value) {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  },

  /**
   * 添加回退按钮
   */
  addFallbackButton: function(container, marker) {
    const btn = document.createElement('button');
    btn.textContent = '📋 查看原始表格';
    btn.className = 'inline-flex items-center gap-1.5 my-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-md text-slate-300 hover:text-slate-100 text-sm cursor-pointer transition-all duration-200';
    btn.onclick = () => {
      if (marker.table.style.display === 'none') {
        marker.table.style.display = 'table';
        container.style.display = 'none';
        btn.textContent = '📊 查看图表';
      } else {
        marker.table.style.display = 'none';
        container.style.display = 'block';
        btn.textContent = '📋 查看原始表格';
      }
    };
    // 把按钮插入到 container 前面，而不是里面
    container.parentNode.insertBefore(btn, container);
  },

  /**
   * 解析表格数据
   */
  parseTableData: function(table) {
    if (!table) return null;

    console.log('=== 解析表格数据 ===');
    console.log('表格 HTML:', table.outerHTML.substring(0, 500));

    const rows = Array.from(table.querySelectorAll('tr'));
    console.log(`找到 ${rows.length} 行`);
    if (rows.length === 0) return null;

    const headerRow = rows[0];
    const headers = Array.from(headerRow.querySelectorAll('th, td'))
      .map(cell => cell.textContent.trim());
    console.log('表头:', headers);

    const data = rows.slice(1).map((row, idx) => {
      const cells = Array.from(row.querySelectorAll('td'));
      console.log(`行 ${idx + 1}: 找到 ${cells.length} 个 td 单元格`);
      
      // 如果没有 td，尝试查找 th（某些表格可能全部用 th）
      if (cells.length === 0) {
        const thCells = Array.from(row.querySelectorAll('th'));
        console.log(`行 ${idx + 1}: 找到 ${thCells.length} 个 th 单元格`);
        if (thCells.length === 0) return null;
        
        return headers.reduce((obj, header, i) => {
          const cellText = thCells[i] ? thCells[i].textContent.trim() : '';
          obj[header] = this.parseCellValue(cellText);
          return obj;
        }, {});
      }

      return headers.reduce((obj, header, i) => {
        const cellText = cells[i] ? cells[i].textContent.trim() : '';
        obj[header] = this.parseCellValue(cellText);
        return obj;
      }, {});
    }).filter(row => row !== null);

    console.log('解析后数据行数:', data.length);
    console.log('解析后数据:', data);

    return { headers, data };
  },

  /**
   * 解析单元格值
   */
  parseCellValue: function(value) {
    value = value.trim();

    // 处理空值和占位符（包括 ... 和 … 省略号字符）
    if (value === '' || value === '...' || value === '…' || value === '—' || value === '-') {
      return null;
    }

    if (value.endsWith('x')) {
      const num = parseFloat(value.slice(0, -1));
      if (!isNaN(num)) return { type: 'multiply', value: num, raw: value };
    }

    if (value.startsWith('+')) {
      const num = parseFloat(value.slice(1));
      if (!isNaN(num)) return { type: 'add', value: num, raw: value };
    }

    if (value === '✓' || value === '√') return true;

    const num = parseFloat(value);
    if (!isNaN(num)) return num;

    return value;
  }
};

document.addEventListener('DOMContentLoaded', function() {
  if (window.RaceVisualizations && typeof window.RaceVisualizations.init === 'function') {
    window.RaceVisualizations.init();
  }
});

console.log('race-visualizations.js 已加载 (D3 版本)');
