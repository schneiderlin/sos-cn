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
    const chartType = marker.options.type || 'bar';

    if (chartType === 'radar-chart') {
      this.renderRadarChart(container, tableData);
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
   * 添加回退按钮
   */
  addFallbackButton: function(container, marker) {
    const btn = document.createElement('button');
    btn.textContent = '查看原始表格';
    btn.className = 'visualization-fallback-btn';
    btn.onclick = () => {
      if (marker.table.style.display === 'none') {
        marker.table.style.display = 'table';
        container.style.display = 'none';
        btn.textContent = '查看图表';
      } else {
        marker.table.style.display = 'none';
        container.style.display = 'block';
        btn.textContent = '查看原始表格';
      }
    };
    container.appendChild(btn);
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
