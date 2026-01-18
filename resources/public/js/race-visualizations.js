/**
 * 种族数据可视化 - 渐进增强测试版
 * 功能：查找 HTML 注释标记，解析表格数据，输出到控制台
 */

window.RaceVisualizations = {
  /**
   * 初始化函数
   * 在 DOMContentLoaded 时调用
   */
  init: function() {
    console.log('=== RaceVisualizations 初始化 ===');

    const markers = this.findMarkers();

    console.log(`找到 ${markers.length} 个可视化标记：`);

    markers.forEach((marker, index) => {
      console.log(`\n--- 标记 ${index + 1} ---`);
      console.log('类型:', marker.type);
      console.log('选项:', marker.options);

      if (marker.table) {
        const tableData = this.parseTableData(marker.table);
        console.log('表格数据:', tableData);
      } else {
        console.log('⚠️  未找到对应的表格');
      }
    });

    console.log('=== RaceVisualizations 完成 ===');
  },

  /**
   * 查找所有可视化标记
   * 从 body.innerHTML 中解析 HTML 注释
   */
  findMarkers: function() {
    const html = document.body.innerHTML;
    const regex = /<!--\s*VISUALIZATION:\s*([^\s]+)\s+(.+?)\s*-->/g;
    const markers = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      const markerType = match[1]; // 如 "test-marker"
      const optionsStr = match[2]; // 如 'type="radar-chart" data="race-core-attributes"'

      const options = this.parseOptions(optionsStr);

      // 查找对应的表格（在注释之后最近的 table 元素）
      const table = this.findNextTableAfter(match.index, html);

      markers.push({
        type: markerType,
        options: options,
        table: table
      });
    }

    return markers;
  },

  /**
   * 解析选项字符串
   * 例如：type="radar-chart" data="race-core-attributes"
   * => { type: "radar-chart", data: "race-core-attributes" }
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
   */
  findNextTableAfter: function(searchIndex, html) {
    // 在 HTML 中从注释位置开始查找下一个 table 标签
    const tableStartRegex = /<table[^>]*>/i;
    const remainingHtml = html.slice(searchIndex);
    const match = tableStartRegex.exec(remainingHtml);

    if (!match) {
      console.warn('在注释之后未找到 <table> 标签');
      return null;
    }

    // 在 DOM 中找到对应的 table 元素
    // 由于我们无法直接从 HTML 字符串映射到 DOM 元素，
    // 这里使用一个简化的方法：查找页面上所有的 table
    const tables = document.querySelectorAll('table');

    if (tables.length === 0) {
      console.warn('页面中没有找到任何表格');
      return null;
    }

    // 返回第一个表格作为测试（实际应该根据位置精确定位）
    // 在完整实现中，需要更精确的定位逻辑
    console.log('找到表格，返回第一个表格用于测试');
    return tables[0];
  },

  /**
   * 解析表格数据
   */
  parseTableData: function(table) {
    if (!table) {
      return null;
    }

    const rows = Array.from(table.querySelectorAll('tr'));

    if (rows.length === 0) {
      return null;
    }

    // 解析表头
    const headerRow = rows[0];
    const headers = Array.from(headerRow.querySelectorAll('th, td'))
      .map(cell => cell.textContent.trim());

    // 解析数据行
    const data = rows.slice(1).map((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('td'));

      if (cells.length === 0) {
        return null;
      }

      return headers.reduce((obj, header, cellIndex) => {
        const cellText = cells[cellIndex] ? cells[cellIndex].textContent.trim() : '';
        obj[header] = this.parseCellValue(cellText);
        return obj;
      }, {});
    }).filter(row => row !== null);

    return {
      headers: headers,
      data: data,
      rowCount: data.length,
      columnCount: headers.length
    };
  },

  /**
   * 解析单元格值
   * 处理各种数值格式：
   * - 乘法加成: "3x" -> 3.0
   * - 加法加成: "+160" -> 160
   * - 负数: "-1" -> -1
   * - 小数: "0.75x" -> 0.75
   */
  parseCellValue: function(value) {
    value = value.trim();

    // 空值
    if (value === '' || value === '...') {
      return null;
    }

    // 解析乘法加成 "3x" -> 3.0
    if (value.endsWith('x')) {
      const num = parseFloat(value.slice(0, -1));
      if (!isNaN(num)) {
        return { type: 'multiply', value: num, raw: value };
      }
    }

    // 解析加法加成 "+160" -> 160
    if (value.startsWith('+')) {
      const num = parseFloat(value.slice(1));
      if (!isNaN(num)) {
        return { type: 'add', value: num, raw: value };
      }
    }

    // 解复选标记 "✓" -> true
    if (value === '✓' || value === '√') {
      return true;
    }

    // 解析普通数字
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return num;
    }

    // 其他情况返回字符串
    return value;
  }
};

// 在 DOMContentLoaded 时初始化
document.addEventListener('DOMContentLoaded', function() {
  if (window.RaceVisualizations && typeof window.RaceVisualizations.init === 'function') {
    window.RaceVisualizations.init();
  } else {
    console.error('RaceVisualizations 未正确定义');
  }
});

console.log('race-visualizations.js 已加载');
