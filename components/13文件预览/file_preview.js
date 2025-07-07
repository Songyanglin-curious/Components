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

                const { sheets, maxLength, maxCols } = this.loadSheets(wb);
                x_spreadsheet.locale('zh-cn');
                const container = document.getElementById("xlsx-container");

                // 将数据转换为 x-spreadsheet 需要的格式
                const spreadsheetData = {
                    mode: 'read',
                    showToolbar: false,
                    showBottomBar: true,
                    showContextmenu: false,
                    row: {
                        len: maxLength + 50,
                        height: 30,
                    },
                    col: {
                        len: maxCols,
                    },
                    style: {
                        // 背景颜色
                        bgcolor: '#ffffff',
                        // 水平对齐方式
                        align: 'center',
                        // 垂直对齐方式
                        valign: 'middle',
                        // 是否需要换行
                        textwrap: true,
                        // 虚线边框
                        strike: false,
                        // 下画线
                        underline: false,
                        // 文字颜色
                        color: '#0a0a0a',
                        // 字体设置
                        font: {
                            // 字体
                            name: 'Helvetica',
                            // 字号大小
                            size: 10,
                            // 是否加粗
                            bold: false,
                            // 斜体
                            italic: false,
                        },
                    }
                };
                this.xs = window.x_spreadsheet(container, spreadsheetData);
                this.xs.loadData(sheets);
                this.xs.reRender();
            } catch (e) {
                console.error('加载 XLSX 文件出错:', e);
            }
        },
        loadSheets: function (wb) {

            const sheets = [];
            let maxLength = 0;
            let maxCols = 26;

            wb.worksheets.forEach((worksheet, index) => {
                const sheet = {
                    name: worksheet.name, rows: [], merges: [],
                    styles: []
                };
                maxLength = Math.max(maxLength, worksheet.rowCount);
                var maxCol = 0;
                worksheet.eachRow(row => {
                    maxCol = Math.max(maxCol, row.actualCellCount);
                });
                maxCols = Math.max(maxCols, maxCol);

                // 计算列宽
                const cols = {};
                var firstRow = worksheet.getRow(1);
                firstRow.eachCell((cell, colNumber) => {
                    var index = colNumber - 1; // 转换为0-based索引
                    const width = cell.width ? cell.width : 120;
                    cols[index] = { width };
                });

                sheet.cols = cols;
                const merges = worksheet._merges;
                var mergesArr = [];
                //哪些单元格是合并的
                //将合并的不是值的部分清空
                //二位 第一个key是行 第二个key是列 值是true
                const mergeCellDict = {

                }
                //哪些单元格是合并的第一个单元格，设置合并的行和列
                const mergeCellValueDict = {

                }

                //exceljs  的列号和 sheetjs  不一致
                //A1:U1 B2:M2 O2:T2
                for (let key in merges) {
                    var merge = merges[key];
                    var model = merge.model;
                    var l = model.left - 1;
                    var r = model.right - 1;
                    var t = model.top;
                    var b = model.bottom;
                    //excel获取第几列的英文名称
                    var col_s = XLSX.utils.encode_col(l);
                    var col_e = XLSX.utils.encode_col(r);
                    mergesArr.push(`${col_s}${t}:${col_e}${b}`);
                    mergeCellValueDict[t] = mergeCellValueDict[t] || {}
                    mergeCellValueDict[t][l] = [b - t, r - l]
                    for (let i = t; i <= b; i++) {
                        mergeCellDict[i] = mergeCellDict[i] || {};
                        for (let j = l; j <= r; j++) {
                            if (i == t && j == l) continue;
                            mergeCellDict[i][j] = true;
                        }
                    }
                }
                sheet.merges = mergesArr;
                // 解析行数据
                const styleDict = {};
                let styleIndex = -1;

                worksheet.eachRow((row, rowNumber) => {
                    let rIndex = rowNumber - 1;
                    const rowData = {
                        cells: {}
                    };
                    // 先获取整行的字体大小
                    let maxRowHeight = 0;
                    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        var cIndex = colNumber - 1; // 转换为0-based索引
                        let style = this.getStyle(cell);
                        let havestyle = false;
                        for (let key in styleDict) {
                            const value = styleDict[key];
                            if (this.deepEqual(value, style)) {
                                havestyle = true;
                                break;
                            }
                        }

                        if (!havestyle) {
                            styleIndex++;
                            styleDict[styleIndex] = style;
                        }

                        if (mergeCellValueDict[rowNumber] && mergeCellValueDict[rowNumber][cIndex]) {
                            rowData.cells[cIndex] = {
                                text: this.getCellValue(cell) || "", // 单元格文本内容
                                merge: mergeCellValueDict[rowNumber][cIndex],
                                style: styleIndex === -1 ? undefined : styleIndex,
                            };

                            const fontSize = style.font?.size || 10;

                            let colWidth = cols?.[cIndex]?.width || 120;
                            if (rowData.cells[cIndex] && rowData.cells[cIndex].merge) {

                                colWidth = 0;
                                for (let i = cIndex; i < cIndex + rowData.cells[cIndex].merge[1]; i++) {
                                    colWidth += cols?.[i]?.width || 120;
                                }
                            }
                            const text = this.getCellValue(cell) || "";
                            const height = this.estimateTextHeight(text, fontSize, colWidth); // 调用之前写的函数
                            if (height > maxRowHeight) maxRowHeight = height;
                        }
                        else if (!(mergeCellDict[rowNumber] && mergeCellDict[rowNumber][cIndex])) {
                            rowData.cells[cIndex] = {
                                text: this.getCellValue(cell) || "", // 单元格文本内容
                                style: styleIndex === -1 ? undefined : styleIndex,
                            };


                            const fontSize = style.font?.size || 10;

                            let colWidth = cols?.[cIndex]?.width || 120;
                            if (rowData.cells[cIndex] && rowData.cells[cIndex].merge) {

                                colWidth = 0;
                                for (let i = cIndex; i < cIndex + rowData.cells[cIndex].merge[1]; i++) {
                                    colWidth += cols?.[i]?.width || 120;
                                }
                            }
                            const text = this.getCellValue(cell) || "";
                            const height = this.estimateTextHeight(text, fontSize, colWidth); // 调用之前写的函数
                            if (height > maxRowHeight) maxRowHeight = height;
                        }




                    });

                    rowData.height = Math.max(maxRowHeight, 30);
                    //判断cells是否为空
                    if (Object.keys(rowData.cells).length !== 0) {
                        sheet.rows[rIndex] = rowData;
                    }
                });
                const styles = Object.keys(styleDict)
                    .sort((a, b) => a - b) // 数字化排序
                    .map(key => styleDict[key]);

                sheet.styles = styles;

                sheets.push(sheet);
            });


            return { sheets, maxLength, maxCols };
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
            //样式的颜色都是theme索引 ，没有映射表暂时不处理
            // 根据实际需求获取单元格样式
            const style = {};
            if (cell.font) {

                style.italic = cell?.font?.italic;
                style.underline = cell?.font?.underline;
                // style.color = cell?.font?.color?.argb ? "#" + cell?.font?.color?.argb : undefined;
                style.font = cell.font
                style.strike = cell?.font?.strike;
                if (cell?.font?.size) {
                    cell.font.size = cell.font.size * 0.6;
                    if (cell.font.size < 10) {
                        cell.font.size = 10;
                    }
                }
            }
            if (cell.alignment) {
                style.align = cell?.alignment?.horizontal;
                style.valign = cell?.alignment?.vertical;
            }
            if (cell.numFmt) {
                style.numFmt = cell.numFmt;
            }
            if (cell.fill) {
                style.bgcolor = cell?.fill?.fgColor?.argb ? "#" + cell?.fill?.fgColor?.argb : undefined;

            }
            if (cell.border) {
                // style.border = {
                //     top: [cell?.border?.top?.style, "#" + cell?.border?.top?.color?.argb || '#ccc'],
                //     bottom: [cell?.border?.bottom?.style, "#" + cell?.border?.bottom?.color?.argb || '#ccc'],
                //     left: [cell?.border?.left?.style, "#" + cell?.border?.left?.color?.argb || '#ccc'],
                //     right: [cell?.border?.right?.style, "#" + cell?.border?.right?.color?.argb || '#ccc']
                // };
                style.border = {
                    top: [cell?.border?.top?.style, '#ccc'],
                    bottom: [cell?.border?.bottom?.style, '#ccc'],
                    left: [cell?.border?.left?.style, '#ccc'],
                    right: [cell?.border?.right?.style, '#ccc']
                };
            }
            style.rowHeight = (cell?.font?.size || 10) * 2.2;
            //去除所有值为undefined的属性
            for (let key in style) {
                if (style[key] === undefined || style[key] === null) {
                    delete style[key];
                }
            }
            return style;
        },

        deepEqual: function (obj1, obj2) {
            // 先处理基础类型（null 也要考虑）
            if (obj1 === obj2) return true;
            // 排除 null 的情况（因为 typeof null === 'object'）
            if (obj1 === null || obj2 === null) return false;
            // 不是对象的话不需要再递归
            if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
            // 获取对象上的键名
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            // 键数量不一致直接失败
            if (keys1.length !== keys2.length) return false;
            // 遍历每个属性
            for (let key of keys1) {
                // 如果 obj2 缺少该属性，返回 false
                if (!keys2.includes(key)) return false;
                // 递归对比所有子属性
                if (!this.deepEqual(obj1[key], obj2[key])) return false;
            }
            return true;
        },
        estimateTextHeight(text, fontSize, colWidth) {
            const avgCharWidth = fontSize; // 粗略字符宽度
            const charsPerLine = Math.floor(colWidth / avgCharWidth);
            if (!charsPerLine || !text) return fontSize * 1.8;
            const lines = Math.ceil(text.length / charsPerLine);


            return lines * fontSize * 1.8;
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
        <xlsx-preview v-else-if="curFileType=='xlsx'" :src="curSrc"></xlsx-preview>
        <xls-preview v-else-if="curFileType=='xls'" :src="curSrc"></xls-preview>
    `,
});
