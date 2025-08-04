// ======================== 工具函数 ========================
const FileUtils = {
    /**
     * 获取文件扩展名
     * @param {string} src - 文件路径
     * @returns {string} 文件扩展名（小写）
     */
    getFileExtension(src) {
        if (!src) return '';
        const parts = src.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    },

    /**
     * Excel序列号转JS日期
     * @param {number} serial - Excel日期序列号
     * @returns {Date} JS日期对象
     */
    excelDateToJSDate(serial) {
        const utcDays = Math.floor(serial - 25569);
        const utcValue = utcDays * 86400 * 1000;
        const date = new Date(utcValue);
        // 修复Excel 1900闰年错误
        if (serial < 60) date.setUTCDate(date.getUTCDate() + 1);
        return date;
    },

    /**
     * 格式化日期为yyyy-mm-dd
     * @param {Date} date - 日期对象
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date) {
        return date.toISOString().slice(0, 10);
    },

    /**
     * 判断是否为日期格式
     * @param {string} numFmt - 数字格式
     * @returns {boolean} 是否是日期格式
     */
    isDateFormat(numFmt) {
        if (!numFmt) return false;
        const dateRegex = /(yy|m{1,5}|d{1,4}|h{1,2}|s{1,2})/i;
        return dateRegex.test(numFmt);
    },

    /**
     * 深度比较两个对象是否相等
     * @param {Object} obj1 - 对象1
     * @param {Object} obj2 - 对象2
     * @returns {boolean} 是否相等
     */
    deepEqual(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (obj1 === null || obj2 === null) return false;
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;

        for (let key of keys1) {
            if (!keys2.includes(key)) return false;
            if (!this.deepEqual(obj1[key], obj2[key])) return false;
        }
        return true;
    },

    /**
     * 估算文本高度
     * @param {string} text - 文本内容
     * @param {number} fontSize - 字体大小
     * @param {number} colWidth - 列宽
     * @returns {number} 估算的文本高度
     */
    estimateTextHeight(text, fontSize, colWidth) {
        const avgCharWidth = fontSize;
        const charsPerLine = Math.floor(colWidth / avgCharWidth);
        if (!charsPerLine || !text) return fontSize * 1.8;
        const lines = Math.ceil(text.length / charsPerLine);
        return lines * fontSize * 1.8;
    }
};

// ======================== PDF预览组件 ========================
Vue.component("PdfPreview", {
    props: {
        src: {
            type: String,
            default: "",
            required: true
        }
    },
    data() {
        return {
            curSrc: ""
        };
    },
    methods: {
        /**
         * 生成PDF预览URL
         * @param {string} src - PDF文件路径
         * @returns {string} 预览URL
         */
        generatePreviewUrl(src) {
            return `${src}?#page=1&view=FitH,top&toolbar=0`;
        }
    },
    watch: {
        src: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.curSrc = this.generatePreviewUrl(newVal);
                }
            }
        }
    },
    template: `
    <iframe 
      :src="curSrc" 
      class="preview-iframe"
      frameborder="0"
    ></iframe>
  `
});

// ======================== DOCX预览组件 ========================
Vue.component("DocxPreview", {
    props: {
        src: {
            type: String,
            default: "",
            required: true
        }
    },
    data() {
        return {
            isLoading: false
        };
    },
    methods: {
        /**
         * 渲染DOCX文档
         * @param {string} src - DOCX文件路径
         */
        async renderDocx(src) {
            if (!src) return;

            this.isLoading = true;

            try {
                // 获取文档数据
                const response = await fetch(src);
                if (!response.ok) throw new Error('文档加载失败');

                const docData = await response.blob();

                // 渲染文档内容
                await docx.renderAsync(
                    docData,
                    this.$refs.container,
                    null,
                    {
                        className: "docx-preview-content",
                        inWrapper: true,
                        ignoreWidth: false,
                        ignoreHeight: false,
                        ignoreFonts: false,
                        breakPages: true,
                        debug: false
                    }
                );

            } catch (error) {
                console.error('DOCX渲染失败:', error);
                this.$refs.container.innerHTML = `
          <div class="error-message">
            DOCX渲染失败: ${error.message || '未知错误'}
          </div>
        `;
            } finally {
                this.isLoading = false;
            }
        }
    },
    watch: {
        src: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.renderDocx(newVal);
                }
            }
        }
    },
    template: `
    <div class="docx-preview-container">
      <div 
        v-if="isLoading" 
        class="loading-indicator"
      >
        正在加载文档...
      </div>
      <div 
        ref="container" 
        class="docx-preview-wrapper"
      ></div>
    </div>
  `
});

// ======================== XLSX预览组件 ========================
// Vue.component("XlsxPreview", {
//     props: {
//         src: {
//             type: String,
//             default: "",
//             required: true
//         }
//     },
//     data() {
//         return {
//             xsInstance: null,
//             workbook: null,
//             resizeObserver: null,
//             isLoading: false,
//             error: null
//         };
//     },
//     methods: {
//         /**
//          * 加载并渲染XLSX文件
//          */
//         async loadAndRenderXlsx() {
//             if (!this.src) return;

//             this.isLoading = true;
//             this.error = null;

//             try {
//                 // 获取文件数据
//                 const response = await fetch(this.src);
//                 if (!response.ok) throw new Error('文件加载失败');

//                 const arrayBuffer = await response.arrayBuffer();
//                 const workbook = new ExcelJS.Workbook();
//                 await workbook.xlsx.load(arrayBuffer);
//                 // this.workbook = workbook;
//                 // 加载工作表数据
//                 const { sheets, maxLength, maxCols } = this.processWorkbook(workbook);

//                 // 初始化电子表格
//                 this.initSpreadsheet(sheets, maxLength, maxCols);

//             } catch (error) {
//                 console.error('XLSX渲染失败:', error);
//                 this.error = `XLSX渲染失败: ${error.message || '未知错误'}`;
//             } finally {
//                 this.isLoading = false;
//             }
//         },

//         /**
//          * 处理Excel工作簿
//          * @param {Workbook} workbook - Excel工作簿对象
//          * @returns {Object} 包含工作表数据、最大行数和列数的对象
//          */
//         processWorkbook(workbook) {
//             const sheets = [];
//             let maxLength = 0;
//             let maxCols = 26;

//             workbook.worksheets.forEach(worksheet => {
//                 const sheet = {
//                     name: worksheet.name,
//                     rows: [],
//                     merges: [],
//                     styles: []
//                 };

//                 // 计算最大行数和列数
//                 maxLength = Math.max(maxLength, worksheet.rowCount);
//                 let maxCol = 0;
//                 worksheet.eachRow(row => {
//                     maxCol = Math.max(maxCol, row.actualCellCount);
//                 });
//                 maxCols = Math.max(maxCols, maxCol);

//                 // 处理列宽
//                 const cols = {};
//                 const firstRow = worksheet.getRow(1);
//                 firstRow.eachCell((cell, colNumber) => {
//                     const index = colNumber - 1;
//                     cols[index] = { width: cell.width || 120 };
//                 });
//                 sheet.cols = cols;

//                 // 处理合并单元格
//                 this.processMergedCells(worksheet, sheet);

//                 // 处理行数据
//                 this.processRows(worksheet, sheet);

//                 sheets.push(sheet);
//             });

//             return { sheets, maxLength, maxCols };
//         },

//         /**
//          * 处理合并单元格
//          * @param {Worksheet} worksheet - Excel工作表
//          * @param {Object} sheet - 目标工作表对象
//          */
//         processMergedCells(worksheet, sheet) {
//             const merges = worksheet._merges || {};
//             const mergeCellDict = {};
//             const mergeCellValueDict = {};

//             for (let key in merges) {
//                 const merge = merges[key];
//                 const { left, right, top, bottom } = merge.model;

//                 const colStart = XLSX.utils.encode_col(left - 1);
//                 const colEnd = XLSX.utils.encode_col(right - 1);
//                 sheet.merges.push(`${colStart}${top}:${colEnd}${bottom}`);

//                 mergeCellValueDict[top] = mergeCellValueDict[top] || {};
//                 mergeCellValueDict[top][left - 1] = [bottom - top, right - left];

//                 for (let i = top; i <= bottom; i++) {
//                     mergeCellDict[i] = mergeCellDict[i] || {};
//                     for (let j = left - 1; j <= right - 1; j++) {
//                         if (i !== top || j !== left - 1) {
//                             mergeCellDict[i][j] = true;
//                         }
//                     }
//                 }
//             }
//             //被合并的单元格的字典
//             sheet.mergeCellDict = mergeCellDict;
//             //单元格设置的属性
//             sheet.mergeCellValueDict = mergeCellValueDict;
//         },

//         /**
//          * 处理行数据
//          * @param {Worksheet} worksheet - Excel工作表
//          * @param {Object} sheet - 目标工作表对象
//          */
//         processRows(worksheet, sheet) {
//             const styleDict = {};
//             let styleIndex = -1;
//             let rowHeights = {};

//             worksheet.eachRow((row, rowNumber) => {
//                 const rIndex = rowNumber - 1;
//                 const rowData = { cells: {} };
//                 let maxRowHeight = 0;

//                 row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
//                     const cIndex = colNumber - 1;

//                     // 跳过合并单元格中的非主单元格
//                     if (sheet.mergeCellDict[rowNumber]?.[cIndex]) {
//                         return;
//                     }

//                     // 获取单元格值和样式
//                     const cellValue = this.getCellValue(cell);
//                     const cellStyle = this.getCellStyle(cell);

//                     // 管理样式
//                     let foundStyleIndex = -1;
//                     for (const [idx, style] of Object.entries(styleDict)) {
//                         if (FileUtils.deepEqual(style, cellStyle)) {
//                             foundStyleIndex = idx;
//                             break;
//                         }
//                     }

//                     if (foundStyleIndex === -1) {
//                         styleIndex++;
//                         styleDict[styleIndex] = cellStyle;
//                         foundStyleIndex = styleIndex;
//                     }

//                     // 构建单元格对象
//                     const cellObj = {
//                         text: cellValue || "",
//                         style: foundStyleIndex
//                     };

//                     // 如果是合并单元格的主单元格
//                     if (sheet.mergeCellValueDict[rowNumber]?.[cIndex]) {
//                         cellObj.merge = sheet.mergeCellValueDict[rowNumber][cIndex];
//                     }

//                     rowData.cells[cIndex] = cellObj;

//                     // 计算行高
//                     const fontSize = cellStyle.font?.size || 10;
//                     let colWidth = sheet.cols?.[cIndex]?.width || 120;

//                     if (cellObj.merge) {
//                         colWidth = 0;
//                         for (let i = cIndex; i < cIndex + cellObj.merge[1]; i++) {
//                             colWidth += sheet.cols?.[i]?.width || 120;
//                         }
//                     }

//                     const height = FileUtils.estimateTextHeight(
//                         cellValue,
//                         fontSize,
//                         colWidth
//                     );

//                     if (height > maxRowHeight) maxRowHeight = height;
//                 });

//                 rowData.height = Math.max(maxRowHeight, 30);
//                 rowHeights[rIndex] = rowData.height;

//                 if (Object.keys(rowData.cells).length > 0) {
//                     sheet.rows[rIndex] = rowData;
//                 }
//             });

//             // 处理行高
//             Object.entries(rowHeights).forEach(([index, height]) => {
//                 if (sheet.rows[index]) {
//                     sheet.rows[index].height = height;
//                 }
//             });

//             // 设置样式
//             sheet.styles = Object.values(styleDict);
//         },

//         /**
//          * 获取单元格值
//          * @param {Cell} cell - Excel单元格
//          * @returns {string} 单元格值
//          */
//         getCellValue(cell) {
//             if (!cell) return '';

//             try {
//                 // 处理富文本
//                 if (cell.value?.richText) {
//                     return cell.value.richText.map(rt => rt.text).join('');
//                 }

//                 // 处理不同数据类型
//                 switch (cell.type) {
//                     case ExcelJS.ValueType.Date:
//                         return FileUtils.formatDate(cell.value);

//                     case ExcelJS.ValueType.Number:
//                         if (FileUtils.isDateFormat(cell.numFmt)) {
//                             const date = FileUtils.excelDateToJSDate(cell.value);
//                             return FileUtils.formatDate(date);
//                         }
//                         return String(cell.value);

//                     case ExcelJS.ValueType.Boolean:
//                         return cell.value ? 'TRUE' : 'FALSE';

//                     case ExcelJS.ValueType.Formula:
//                         return cell.result !== undefined ? String(cell.result) : String(cell.value);

//                     default:
//                         return cell.text?.trim() || '';
//                 }
//             } catch (e) {
//                 console.error('处理单元格出错:', e);
//                 return '';
//             }
//         },

//         /**
//          * 获取单元格样式
//          * @param {Cell} cell - Excel单元格
//          * @returns {Object} 样式对象
//          */
//         getCellStyle(cell) {
//             const style = {};

//             // 字体样式
//             if (cell.font) {
//                 style.font = {
//                     name: cell.font.name || 'Helvetica',
//                     size: Math.max(cell.font.size * 0.6 || 10, 10),
//                     bold: cell.font.bold || false,
//                     italic: cell.font.italic || false,
//                     underline: cell.font.underline || false,
//                     strike: cell.font.strike || false
//                 };
//             }

//             // 对齐方式
//             if (cell.alignment) {
//                 style.align = cell.alignment.horizontal || 'center';
//                 style.valign = cell.alignment.vertical || 'middle';
//             }

//             // 背景色
//             if (cell.fill && cell.fill.fgColor) {
//                 style.bgcolor = `#${cell.fill.fgColor.argb || 'ffffff'}`;
//             }

//             // 边框
//             if (cell.border) {
//                 style.border = {
//                     top: [cell.border.top?.style || 'none', '#ccc'],
//                     bottom: [cell.border.bottom?.style || 'none', '#ccc'],
//                     left: [cell.border.left?.style || 'none', '#ccc'],
//                     right: [cell.border.right?.style || 'none', '#ccc']
//                 };
//             }

//             return style;
//         },

//         /**
//          * 初始化电子表格
//          * @param {Array} sheets - 工作表数据
//          * @param {number} maxLength - 最大行数
//          * @param {number} maxCols - 最大列数
//          */
//         initSpreadsheet(sheets, maxLength, maxCols) {
//             const container = this.$refs.container;

//             // 清空容器
//             while (container.firstChild) {
//                 container.removeChild(container.firstChild);
//             }

//             // 设置电子表格配置
//             x_spreadsheet.locale('zh-cn');

//             const config = {
//                 mode: 'read',
//                 showToolbar: false,
//                 showBottomBar: true,
//                 showContextmenu: false,
//                 view: {
//                     height: () => container.clientHeight - 10,
//                     width: () => container.clientWidth - 10
//                 },
//                 row: {
//                     len: maxLength + 50,
//                     height: 30
//                 },
//                 col: {
//                     len: maxCols
//                 },
//                 style: {
//                     bgcolor: '#ffffff',
//                     align: 'center',
//                     valign: 'middle',
//                     textwrap: true,
//                     strike: false,
//                     underline: false,
//                     color: '#0a0a0a',
//                     font: {
//                         name: 'Helvetica',
//                         size: 10,
//                         bold: false,
//                         italic: false
//                     }
//                 }
//             };

//             // 创建电子表格实例
//             this.xsInstance = x_spreadsheet(container, config);
//             this.xsInstance.loadData(sheets);
//             this.xsInstance.reRender();

//             // 初始化窗口大小监听
//             // this.initResizeObserver(container);
//         },

//         /**
//          * 初始化窗口大小监听
//          * @param {HTMLElement} container - 容器元素
//          * 没找到能让它resize的方法，先注释掉
//          */
//         initResizeObserver(container) {
//             if (this.resizeObserver) {
//                 this.resizeObserver.disconnect();
//             }

//             this.resizeObserver = new ResizeObserver(entries => {
//                 for (const entry of entries) {
//                     const { width, height } = entry.contentRect;
//                     this.containerWidth = width;
//                     this.containerHeight = height;

//                     this.$nextTick(() => {
//                         if (this.xsInstance) {
//                             // 触发重新渲染
//                             this.xsInstance.reRender();
//                         }
//                     });
//                     // 确保在 Vue 更新周期后执行
//                     this.$nextTick(() => {
//                         if (this.xsInstance) {
//                             try {

//                                 // 1. 调用 resize() 方法而不是 reRender()
//                                 // 2. 传递新的宽度和高度
//                                 // this.xsInstance.resize(width, height);
//                                 // this.xsInstance.options.view.width = () => width - 10;
//                                 // this.xsInstance.options.view.height = () => height - 10;
//                                 this.xsInstance.sheet.table.draw.resize(width, height)
//                                 // 3. 可选：触发重绘
//                                 this.xsInstance.reRender();
//                             } catch (e) {
//                                 console.error('调整大小出错:', e);
//                             }
//                         }
//                     });
//                 }
//             });

//             this.resizeObserver.observe(container);
//         },

//         // 添加手动 resize 方法
//         manualResize() {
//             if (this.xsInstance && this.$refs.container) {
//                 const width = this.$refs.container.clientWidth;
//                 const height = this.$refs.container.clientHeight;
//                 this.xsInstance.resize(width, height);
//                 this.xsInstance.reRender();
//             }
//         },
//     },
//     mounted() {
//         this.loadAndRenderXlsx();
//     },
//     beforeDestroy() {
//         if (this.resizeObserver) {
//             this.resizeObserver.disconnect();
//         }
//         this.workbook = null;
//     },
//     watch: {
//         src(newVal) {
//             if (newVal) {
//                 this.$nextTick(() => this.loadAndRenderXlsx());
//             }
//         }
//     },
//     template: `
//     <div class="xlsx-preview-container">
//       <div 
//         v-if="isLoading" 
//         class="loading-indicator"
//       >
//         正在加载表格...
//       </div>
//       <div 
//         v-else-if="error" 
//         class="error-message"
//       >
//         {{ error }}
//       </div>
//       <div 
//         ref="container" 
//         class="xlsx-preview-wrapper"
//       ></div>
//     </div>
//   `
// });


Vue.component("XlsxPreview", {
    props: {
        src: {
            type: String,
            default: "",
            required: true
        }
    },
    data() {
        return {
            workbook: null, // SpreadJS 工作簿实例
            excelIO: null,   // ExcelIO 实例
            isLoading: false,
            error: null
        };
    },
    methods: {
        /**
         * 加载并渲染XLSX文件
         */
        async loadAndRenderXlsx() {
            if (!this.src) return;
            this.isLoading = true;
            this.error = null;
            try {
                // 获取文件数据
                const response = await fetch(this.src);
                if (!response.ok) throw new Error('文件加载失败');
                const arrayBuffer = await response.arrayBuffer();
                // 如果还没有创建工作簿，则创建（但正常情况下在mounted中已经创建）
                if (!this.workbook) {
                    this.workbook = new GC.Spread.Sheets.Workbook(this.$refs.container);
                }
                // 使用ExcelIO加载Excel文件
                this.excelIO.open(
                    arrayBuffer,
                    (workbookData) => {
                        // 清除当前工作簿内容（先移除所有工作表，除了第一个）
                        this.workbook.suspendPaint();
                        const sheetCount = this.workbook.getSheetCount();
                        for (let i = sheetCount - 1; i > 0; i--) {
                            this.workbook.removeSheet(i);
                        }
                        // 将第一个工作表也清除内容
                        const firstSheet = this.workbook.getSheet(0);
                        if (firstSheet) {
                            firstSheet.clear(0, 0, firstSheet.getRowCount(), firstSheet.getColumnCount(), GC.Spread.Sheets.SheetArea.viewport);
                        }
                        // 加载新数据
                        this.workbook.fromJSON(workbookData);
                        this.workbook.resumePaint();

                        console.log('Excel 文件加载成功');
                        this.isLoading = false;
                    },
                    (error) => {
                        console.error('Excel解析失败:', error);
                        this.error = `Excel解析失败: ${error.message || '未知错误'}`;
                        this.isLoading = false;
                    }
                );
            } catch (error) {
                console.error('XLSX渲染失败:', error);
                this.error = `XLSX渲染失败: ${error.message || '未知错误'}`;
                this.isLoading = false;
            }
        },
    },
    mounted() {
        // 确保DOM元素已经存在
        this.workbook = new GC.Spread.Sheets.Workbook(this.$refs.container);
        // 创建ExcelIO实例
        this.excelIO = new GC.Spread.Excel.IO();
        // 初始加载
        this.loadAndRenderXlsx();
    },
    beforeDestroy() {
        // 销毁工作簿
        if (this.workbook) {
            this.workbook.destroy();
            this.workbook = null;
        }
        this.excelIO = null;
    },
    watch: {
        src(newVal) {
            if (newVal) {
                this.$nextTick(() => this.loadAndRenderXlsx());
            }
        }
    },
    template: `
    <div class="xlsx-preview-container">
      <div 
        v-if="isLoading" 
        class="loading-indicator"
      >
        正在加载表格...
      </div>
      <div 
        v-else-if="error" 
        class="error-message"
      >
        {{ error }}
      </div>
      <div 
        ref="container" 
        class="xlsx-preview-wrapper"
        style="width: 100%; height: 100%;"
      ></div>
    </div>
  `
});

// ======================== XLS预览组件 ========================
Vue.component("XlsPreview", {
    props: {
        src: {
            type: String,
            default: "",
            required: true
        }
    },
    data() {
        return {
            xsInstance: null,
            isLoading: false,
            error: null
        };
    },
    methods: {
        /**
         * 加载并渲染XLS/CSV文件
         */
        async loadAndRenderXls() {
            if (!this.src) return;

            this.isLoading = true;
            this.error = null;

            try {
                // 获取文件数据
                const response = await fetch(this.src);
                if (!response.ok) throw new Error('文件加载失败');

                const arrayBuffer = await response.arrayBuffer();
                const extension = FileUtils.getFileExtension(this.src);

                // 处理工作簿
                const { sheets, maxLength, maxCols } = this.processWorkbook(
                    arrayBuffer,
                    extension
                );

                // 初始化电子表格
                this.initSpreadsheet(sheets, maxLength, maxCols);

            } catch (error) {
                console.error('XLS渲染失败:', error);
                this.error = `XLS渲染失败: ${error.message || '未知错误'}`;
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * 处理工作簿
         * @param {ArrayBuffer} buffer - 文件缓冲区
         * @param {string} extension - 文件扩展名
         * @returns {Object} 包含工作表数据、最大行数和列数的对象
         */
        processWorkbook(buffer, extension) {
            const wb = extension === 'csv'
                ? XLSX.read(new TextDecoder("utf-8").decode(buffer), { type: "string", raw: true })
                : XLSX.read(buffer, { type: "array" });

            const sheets = [];
            let maxLength = 0;
            let maxCols = 26;

            wb.SheetNames.forEach(name => {
                const sheet = { name, rows: {} };
                const ws = wb.Sheets[name];
                const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });

                // 更新最大行数和列数
                maxLength = Math.max(maxLength, rows.length);
                rows.forEach(row => {
                    maxCols = Math.max(maxCols, row.length);
                });

                // 处理列宽
                const cols = {};
                const firstRow = rows[0] || [];

                firstRow.forEach((_, index) => {
                    cols[index] = { width: this.calculateColWidth(rows, index) };
                });

                sheet.cols = cols;

                // 处理行数据
                rows.forEach((row, rowIndex) => {
                    const cells = {};

                    row.forEach((cellValue, colIndex) => {
                        cells[colIndex] = { text: cellValue || "" };
                    });

                    if (Object.keys(cells).length > 0) {
                        sheet.rows[rowIndex] = { cells };
                    }
                });

                sheets.push(sheet);
            });

            return { sheets, maxLength, maxCols };
        },

        /**
         * 计算列宽
         * @param {Array} rows - 行数据
         * @param {number} colIndex - 列索引
         * @returns {number} 计算出的列宽
         */
        calculateColWidth(rows, colIndex) {
            const MIN_COL_WIDTH = 70;
            const MAX_COL_WIDTH = 300;
            const CHAR_WIDTH = 8;
            const MAX_ROWS_TO_CHECK = 10;

            let maxLength = 0;

            for (let i = 0; i < Math.min(rows.length, MAX_ROWS_TO_CHECK); i++) {
                const cellValue = rows[i]?.[colIndex];
                if (cellValue !== undefined && cellValue !== null) {
                    const length = String(cellValue).length;
                    if (length > maxLength) maxLength = length;
                }
            }

            const width = maxLength * CHAR_WIDTH;
            return Math.min(Math.max(width, MIN_COL_WIDTH), MAX_COL_WIDTH);
        },

        /**
         * 初始化电子表格
         * @param {Array} sheets - 工作表数据
         * @param {number} maxLength - 最大行数
         * @param {number} maxCols - 最大列数
         */
        initSpreadsheet(sheets, maxLength, maxCols) {
            const container = this.$refs.container;

            // 清空容器
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            // 设置电子表格配置
            x_spreadsheet.locale('zh-cn');

            const config = {
                mode: 'read',
                showToolbar: false,
                row: {
                    len: maxLength + 50,
                    height: 30
                },
                col: {
                    len: maxCols
                },
                view: {
                    height: () => container.clientHeight - 10,
                    width: () => container.clientWidth - 10
                }
            };

            // 创建电子表格实例
            this.xsInstance = x_spreadsheet(container, config);
            this.xsInstance.loadData(sheets);
            this.xsInstance.reRender();
        }
    },
    mounted() {
        this.loadAndRenderXls();
    },
    watch: {
        src: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.$nextTick(() => this.loadAndRenderXls());
                }
            }
        }
    },
    template: `
    <div class="xls-preview-container">
      <div 
        v-if="isLoading" 
        class="loading-indicator"
      >
        正在加载表格...
      </div>
      <div 
        v-else-if="error" 
        class="error-message"
      >
        {{ error }}
      </div>
      <div 
        ref="container" 
        class="xls-preview-wrapper"
      ></div>
    </div>
  `
});

// ======================== 文件预览主组件 ========================
Vue.component("FilePreview", {
    props: {
        src: {
            type: String,
            default: "",
            required: true
        }
    },
    computed: {
        /**
         * 获取文件类型
         * @returns {string} 文件类型
         */
        fileType() {
            if (!this.src) return '';

            const extension = FileUtils.getFileExtension(this.src);
            const supportedTypes = {
                pdf: 'pdf',
                docx: 'docx',
                xlsx: 'xlsx',
                xls: 'xls',
                csv: 'csv'
            };

            if (!supportedTypes[extension]) {
                this.$Message.error(`不支持 .${extension} 文件类型的预览`);
                return '';
            }

            return supportedTypes[extension];
        }
    },
    template: `
    <div class="file-preview-container">
      <PdfPreview 
        v-if="fileType === 'pdf'" 
        :src="src" 
      />
      <DocxPreview 
        v-else-if="fileType === 'docx'" 
        :src="src" 
      />
      <XlsxPreview 
        v-else-if="fileType === 'xlsx'" 
        :src="src" 
      />
      <XlsPreview 
        v-else-if="fileType === 'xls' || fileType === 'csv'" 
        :src="src" 
      />
      
      <div 
        v-else-if="src" 
        class="unsupported-type"
      >
        不支持的文件类型
      </div>
      
      <div 
        v-else 
        class="no-file"
      >
        请选择要预览的文件
      </div>
    </div>
  `
});

