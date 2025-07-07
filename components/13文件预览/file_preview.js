Vue.component("pdf-preview", {
    props: {
        src: {
            type: String,
            default: ""
        }
    },
    data: function () {
        return {
            curSrc: "",
        }
    },
    computed: {},
    methods: {
        getPDFSrc: function (src) {
            return `${src}?#page=1&view=FitH,top&toolbar=0`;
        }
    },
    beforeUpdate: function () { },
    updated: function () { },
    mounted: function () {
        this.curSrc = this.getPDFSrc(this.src);
    },
    watch: {
        src: {
            handler: function (newVal, oldVal) {
                if (newVal == oldVal) return
                this.curSrc = this.getPDFSrc(newVal);
            },
            deep: true,
            immediate: true,
        }
    },
    template: `
        <iframe :src="curSrc" style="width:100%;height:100%;border:none;">
        </iframe>
    `,
})
Vue.component("docx-preview", {
    props: {
        src: {
            type: String,
            default: ""
        }
    },
    data: function () {
        return {
            curSrc: "",
        }
    },
    computed: {},
    methods: {

        renderDocx: async function (src) {
            const docData = await fetch(src) // 相对路径
                .then(response => response.blob()) // 转换成 blob
                .catch(error => console.error('文档加载失败:', error));
            // 使用 docx-preview 渲染文档内容
            docx.renderAsync(docData, document.getElementById("container"))
                .then(() => console.log("渲染完成"))
                .catch(err => console.error("渲染失败:", err));

        }
    },
    beforeUpdate: function () { },
    updated: function () { },
    mounted: function () {

    },
    watch: {
        src: {
            handler: function (newVal, oldVal) {
                if (newVal == oldVal) return
                this.curSrc = newVal;
                this.renderDocx(this.curSrc);
            },
            deep: true,
            immediate: true,
        }
    },
    template: `
         <div id="container" style="width:100%;height:100%;border:none;"></div>
    `,
})
// Vue.component("xlsx-preview", {
//     props: {
//         src: {
//             type: String,
//             default: ""
//         }
//     },
//     data: function () {
//         return {
//             xs: null,
//             workbook: null,
//             worksheetData: []
//         }
//     },
//     methods: {
//         async loadXlsx() {

//             const res = await fetch(this.src);
//             const arrayBuffer = await res.arrayBuffer();
//             const wb = new ExcelJS.Workbook();
//             await wb.xlsx.load(arrayBuffer);
//             this.workbook = wb;
//             this.initWorkBook();
//             this.renderSheet(wb.worksheets);
//         },
//         initWorkBook() {
//             const container = document.getElementById("xlsx-container");
//             if (!container) return;

//             // 阻止重复初始化
//             if (container.dataset.initialized === 'true') {
//                 console.warn('表格已初始化，请使用 .loadData() 更新内容');
//                 return;
//             }
//             // 将数据转换为 x-spreadsheet 需要的格式
//             const spreadsheetData = {
//                 mode: 'read',
//                 showToolbar: false,
//                 showGrid: true,
//                 showContextmenu: true,

//             };
//             this.xs = window.x_spreadsheet(container, spreadsheetData);
//             // 标记为已初始化
//             container.dataset.initialized = 'true';
//         },

//         renderSheet(worksheets) {
//             debugger
//             worksheets.forEach(worksheet => {

//             })


//         },
//         getCellValue(cell) {
//             try {
//                 // 统一先尝试获取文本值作为兜底
//                 let textValue = cell && cell.text ? cell.text.trim() : '';

//                 switch (cell.type) {
//                     case ExcelJS.ValueType.RichText:
//                         // 正确访问路径：cell.value.richText
//                         if (cell.value?.richText) {
//                             return cell.value.richText.map(rt => rt.text).join('');
//                         } else {
//                             return textValue; // 兼容性回退
//                         }
//                     case ExcelJS.ValueType.Date:
//                         return formatDate(cell.value);
//                     case ExcelJS.ValueType.Number:
//                         if (isDateFormat(cell.numFmt)) {
//                             const date = excelDateToJSDate(cell.value);
//                             return formatDate(date);
//                         }
//                         return cell.value;
//                     case ExcelJS.ValueType.String:
//                     case ExcelJS.ValueType.SharedString:
//                         // 共享字符串也可能是富文本结构
//                         if (cell.value?.richText) {
//                             return cell.value.richText.map(rt => rt.text).join('');
//                         } else {
//                             return textValue;
//                         }
//                     case ExcelJS.ValueType.Boolean:
//                         return cell.value ? 'TRUE' : 'FALSE';
//                     case ExcelJS.ValueType.Formula:
//                         return cell.result !== undefined ? cell.result : cell.value;
//                     default:
//                         return textValue;
//                 }
//             } catch (e) {
//                 console.error('处理单元格出错:', cell, e);
//                 return '';
//             }
//         }


//     },
//     mounted() {
//         this.loadXlsx();
//     },
//     watch: {
//         src(newVal) {
//             if (newVal) {
//                 this.$nextTick(() => { this.loadXlsx(); });
//             }
//         }
//     },
//     template: `
//         <div id="xlsx-container" style="width: 100%; height: 100%;"></div>
//     `
// });

Vue.component("xlsx-preview", {
    props: {
        src: {
            type: String,
            default: ""
        }
    },
    data: function () {
        return {
            xs: null,
            workbook: null,
            worksheetData: []
        }
    },
    methods: {
        async loadXlsx() {
            try {
                const res = await fetch(this.src);
                const arrayBuffer = await res.arrayBuffer();
                const wb = new ExcelJS.Workbook();
                await wb.xlsx.load(arrayBuffer);
                this.workbook = wb;
                this.initWorkBook();
                this.renderSheet(wb.worksheets);
            } catch (e) {
                console.error('加载 XLSX 文件出错:', e);
            }
        },
        initWorkBook() {
            const container = document.getElementById("xlsx-container");
            if (!container) return;

            // 阻止重复初始化
            if (container.dataset.initialized === 'true') {
                console.warn('表格已初始化，请使用 .loadData() 更新内容');
                return;
            }
            x_spreadsheet.locale('zh-cn');
            // 将数据转换为 x-spreadsheet 需要的格式
            const spreadsheetData = {
                mode: 'read',
                showToolbar: false,
                showGrid: true,
                showContextmenu: true,
            };
            this.xs = window.x_spreadsheet(container, spreadsheetData);

            // 标记为已初始化
            container.dataset.initialized = 'true';
        },

        renderSheet(worksheets) {
            const sheets = [];

            worksheets.forEach((worksheet, index) => {
                var maxCol = 0;
                worksheet.eachRow(row => {
                    maxCol = Math.max(maxCol, row.actualCellCount);
                });
                const sheetData = {
                    name: worksheet.name, // 工作表名称
                    freeze: "A1", // 冻结窗格，如果没有则为空字符串
                    styles: [], // 样式数组，如果没有则为空数组
                    merges: [], // 合并单元格数组，如果没有则为空数组
                    rows: {
                        "len": 100
                    },
                    cols: {
                        len: maxCol // 列的长度
                    },
                    validations: [], // 验证数组，如果没有则为空数组
                    autofilter: {} // 自动筛选对象，如果没有则为空对象
                };
                styles = [];

                // 解析行数据
                worksheet.eachRow((row, rowNumber) => {
                    const rowData = {
                        cells: {}
                    };
                    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                        var index = colNumber - 1; // 转换为0-based索引
                        // rowData[index] = getCellValue(cell);

                        var cellStyle = this.getStyle(cell);
                        var styleIndex = undefined;
                        if (cellStyle) {
                            styles.push(this.getStyle(cell));
                            styleIndex = styles.length - 1;
                        }

                        rowData.cells[index] = {
                            text: this.getCellValue(cell) || "", // 单元格文本内容
                            // style: styleIndex // 单元格样式索引
                        };
                    });
                    sheetData.rows[rowNumber - 1] = rowData;

                });

                // sheetData.styles = styles;


                sheets.push(sheetData);
            });

            var d = [
                {
                    "name": "sheetA",
                    "freeze": "A1",
                    "styles": [
                        {
                            "color": "#fe0000"
                        },
                        {
                            "bgcolor": "#fdc101"
                        },
                        {
                            "bgcolor": "#ffe59a"
                        }
                    ],
                    "merges": [],
                    "rows": {
                        "0": {
                            "cells": {
                                "0": {
                                    "text": "1"
                                }
                            }
                        },
                        "1": {
                            "cells": {
                                "1": {
                                    "text": "2"
                                },
                                "2": {
                                    "text": "3"
                                },
                                "3": {
                                    "text": "4"
                                }
                            }
                        },
                        "2": {
                            "cells": {
                                "4": {
                                    "text": "4",
                                    "style": 0
                                }
                            }
                        },
                        "5": {
                            "cells": {
                                "2": {
                                    "style": 2
                                }
                            }
                        },
                        "6": {
                            "cells": {
                                "3": {
                                    "style": 1
                                }
                            }
                        },
                        "len": 100
                    },
                    "cols": {
                        "len": 26
                    },
                    "validations": [],
                    "autofilter": {}
                },
                {
                    "name": "B",
                    "freeze": "A1",
                    "styles": [],
                    "merges": [],
                    "rows": {
                        "len": 100
                    },
                    "cols": {
                        "len": 26
                    },
                    "validations": [],
                    "autofilter": {}
                }
            ]

            this.xs.loadData(sheets);
            this.xs.reRender();
        },
        getCellValue(cell) {
            try {
                // 统一先尝试获取文本值作为兜底
                let textValue = cell && cell.text ? cell.text.trim() : '';

                switch (cell.type) {
                    case ExcelJS.ValueType.RichText:
                        if (cell.value?.richText) {
                            return cell.value.richText.map(rt => rt.text).join('');
                        } else {
                            return textValue; // 兼容性回退
                        }
                    case ExcelJS.ValueType.Date:
                        return formatDate(cell.value);
                    case ExcelJS.ValueType.Number:
                        if (isDateFormat(cell.numFmt)) {
                            const date = excelDateToJSDate(cell.value);
                            return formatDate(date);
                        }
                        return cell.value;
                    case ExcelJS.ValueType.String:
                    case ExcelJS.ValueType.SharedString:
                        if (cell.value?.richText) {
                            return cell.value.richText.map(rt => rt.text).join('');
                        } else {
                            return textValue;
                        }
                    case ExcelJS.ValueType.Boolean:
                        return cell.value ? 'TRUE' : 'FALSE';
                    case ExcelJS.ValueType.Formula:
                        return cell.result !== undefined ? cell.result : cell.value;
                    default:
                        return textValue;
                }
            } catch (e) {
                console.error('处理单元格出错:', cell, e);
                return '';
            }
        },
        getStyle(cell) {
            // 根据实际需求获取单元格样式
            const style = {};
            if (cell.font) {
                style.bold = cell.font.bold;
                style.italic = cell.font.italic;
                style.underline = cell.font.underline;
                style.color = cell.font.color ? cell.font.color.argb : null;
                style.family = cell.font.name;
            }
            if (cell.alignment) {
                style.align = cell.alignment.horizontal;
                style.vAlign = cell.alignment.vertical;
            }
            if (cell.numFmt) {
                style.numFmt = cell.numFmt;
            }
            if (cell.fill) {
                style.bgcolor = cell.fill.bgColor ? cell.fill.bgColor.argb : null;
            }
            if (cell.border) {
                style.border = {
                    top: cell.border.top ? cell.border.top.style + ' ' + (cell.border.top.color ? cell.border.top.color.argb : 'black') : null,
                    bottom: cell.border.bottom ? cell.border.bottom.style + ' ' + (cell.border.bottom.color ? cell.border.bottom.color.argb : 'black') : null,
                    left: cell.border.left ? cell.border.left.style + ' ' + (cell.border.left.color ? cell.border.left.color.argb : 'black') : null,
                    right: cell.border.right ? cell.border.right.style + ' ' + (cell.border.right.color ? cell.border.right.color.argb : 'black') : null
                };
            }
            return style;
        }
    },
    mounted() {
        this.loadXlsx();
    },
    watch: {
        src(newVal) {
            if (newVal) {
                this.$nextTick(() => { this.loadXlsx(); });
            }
        }
    },
    template: `
        <div id="xlsx-container" style="width: 100%; height: 100%;"></div>
    `
});

// 判断是否为日期格式
function isDateFormat(numFmt) {
    if (!numFmt) return false;
    const dateRegex = /(yy|m{1,5}|d{1,4}|h{1,2}|s{1,2})/i;
    return dateRegex.test(numFmt);
}

// Excel序列号转JS日期
function excelDateToJSDate(serial) {
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400 * 1000;
    const date = new Date(utcValue);
    // 修复Excel 1900闰年错误
    if (serial < 60) date.setUTCDate(date.getUTCDate() + 1);
    return date;
}

// 格式化日期为yyyy-mm-dd
function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

Vue.component("xls-preview", {
    props: {
        src: {
            type: String,
            default: ""
        }
    },
    data: function () {
        return {
            xs: null,
        }
    },
    methods: {
        async loadAndRenderXls() {
            const res = await fetch(this.src);
            const data = await res.arrayBuffer();

            const { sheets, maxLength, maxCols } = this.loadSheets(data, this.getFileType(this.src));
            x_spreadsheet.locale('zh-cn');
            const container = document.getElementById("xls-container");

            // 将数据转换为 x-spreadsheet 需要的格式
            const spreadsheetData = {
                mode: 'read',
                showToolbar: false,
                row: {
                    len: maxLength + 50,
                    height: 30,
                },
                col: {
                    len: maxCols,
                },

            };
            this.xs = window.x_spreadsheet(container, spreadsheetData);
            this.xs.loadData(sheets);
            this.xs.reRender();
        },


        convert: (wb) => {
            function calculateColWidth(rows, colIndex) {
                const MIN_COL_WIDTH = 70;
                const MAX_COL_WIDTH = 300;
                const CHAR_WIDTH = 8;
                const MAX_ROWS_TO_CHECK = 10;
                let maxLength = 0;
                for (let i = 0; i < Math.min(rows.length, MAX_ROWS_TO_CHECK); i++) {
                    const cell = rows[i][colIndex];
                    if (cell) {
                        const length = String(cell).length;
                        if (length > maxLength) {
                            maxLength = length;
                        }
                    }
                }
                const width = maxLength * CHAR_WIDTH;
                return Math.min(Math.max(width, MIN_COL_WIDTH), MAX_COL_WIDTH);
            }
            const sheets = [];
            let maxLength = 0;
            let maxCols = 26;
            wb.SheetNames.forEach(name => {
                const sheet = { name, rows: [] };
                const ws = wb.Sheets[name];
                const rows = XLSX.utils.sheet_to_json(ws, { raw: false, header: 1 });
                if (maxLength < rows.length) maxLength = rows.length

                // 计算列宽
                const cols = {};
                for (let i = 0; i < rows[0]?.length || 0; i++) {
                    const width = calculateColWidth(rows, i);
                    cols[i] = { width };
                }
                sheet.cols = cols;

                sheet.rows = rows.reduce((map, row, i) => {
                    const cells = row.reduce((colMap, column, j) => {
                        colMap[j] = { text: column }
                        return colMap
                    }, {});
                    map[i] = { cells }
                    const colLen = Object.keys(cells).length;
                    if (colLen > maxCols) {
                        maxCols = colLen;
                    }
                    return map
                }, {})

                sheets.push(sheet);
            });
            return { sheets, maxLength, maxCols };
        },
        loadSheets(buffer, ext) {
            const ab = new Uint8Array(buffer).buffer
            const wb = ext.toLowerCase() == ".csv" ? XLSX.read(new TextDecoder("utf-8").decode(ab), { type: "string", raw: true }) : XLSX.read(ab, { type: "array" });
            return this.convert(wb);
        },
        getFileType: function (src) {
            var arr = src.split(".");
            var type = arr[arr.length - 1];
            type = type.toLowerCase();

            return type;
        }

    },

    mounted() {
        // this.initWorkBook();
        this.loadAndRenderXls();
    },
    watch: {
        src: {
            handler(newVal) {
                if (newVal) this.loadAndRenderXls();
            },

        }
    },
    template: `
        <div id="xls-container" style="width: 100%; height: 100%;"></div>
    `
});


Vue.component("file-preview", {
    props: {
        src: {
            type: String,
            default: ""
        }
    },

    data: function () {
        return {
            types: ["xls", "xlsx", "docx", "pdf"],
            curFileType: "",
            curSrc: "",
        }
    },
    computed: {},
    methods: {
        getFileType: function (src) {
            var arr = src.split(".");
            var type = arr[arr.length - 1];
            type = type.toLowerCase();
            if (this.types.indexOf(type) == -1) {
                this.$Message.error(`不支持 .${type} 文件类型`);
                return false;
            }
            return type;
        }
    },
    beforeUpdate: function () { },
    updated: function () { },
    mounted: function () {

    },
    watch: {
        src: {
            handler: function (newVal, oldVal) {
                if (newVal == oldVal) return
                this.curSrc = newVal;
                this.curFileType = this.getFileType(newVal);
            },
            deep: true,
            immediate: true,
        }
    },
    template: `
        <pdf-preview v-if="curFileType=='pdf'" :src="curSrc"></pdf-preview>
        <docx-preview v-else-if="curFileType=='docx'" :src="curSrc"></docx-preview>
        <xls-preview v-else-if="curFileType=='xlsx'" :src="curSrc"></xls-preview>
        <xls-preview v-else-if="curFileType=='xls'" :src="curSrc"></xls-preview>
    `,
});
