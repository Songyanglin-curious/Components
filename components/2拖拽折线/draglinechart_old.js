/*v=1.20.1111.1*/
var Descorate = {
    /**
         * @description 防抖
         * @param {Function} func 被防抖函数
         * @param {number} ms 防抖时间
         * @returns 
         */
    debounce: function (func, ms) {
        var timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, arguments), ms);
        };
    },
    /**
     * @description 节流
     * @param {Function} func 被节流函数
     * @param {number} ms 节流时间 
     * @returns 
     */
    throttle: function (func, ms) {

        var isThrottled = false,
            savedArgs,
            savedThis;

        function wrapper() {
            // 为了获取调用前最新的参数
            if (isThrottled) { // (2)
                savedArgs = arguments;
                savedThis = this;
                return;
            }
            isThrottled = true;

            func.apply(this, arguments); // (1)

            setTimeout(function () {
                isThrottled = false; // (3)
                if (savedArgs) {
                    wrapper.apply(savedThis, savedArgs);
                    savedArgs = savedThis = null;
                }
            }, ms);
        }

        return wrapper;
    },

    /**
     * @description 模拟PromiseAll，多个异步并行执行，全部执行完毕后执行回调
     * @param {Function[]} methods 所有异步执行的方法
     * @returns 
     */
    mockPromiseAll: function (methods) {
        return function (callback) {
            var count = 0;
            const results = [];

            methods.forEach((method, index) => {
                method.call(this, (result) => {
                    results[index] = result;
                    count++;

                    if (count === methods.length) {
                        callback(results);
                    }
                });
            });
        };
    },
}
var DataHelper = {
    deepMergeCover: function (target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key] || typeof target[key] !== 'object') {
                        target[key] = {};
                    }
                    this.deepMergeCover(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }
}
var ColorHelper = {
    parseColor(colorString) {
        // 移除可能存在的空格
        colorString = colorString.replace(/\s/g, '');

        // 如果颜色字符串以#开头，表示它是16进制颜色
        if (colorString[0] === '#') {
            colorString = colorString.slice(1); // 去掉#字符
            if (colorString.length === 3) {
                // 将3位缩写的16进制颜色扩展为6位
                colorString = colorString[0] + colorString[0] + colorString[1] + colorString[1] + colorString[2] + colorString[2];
            }

            // 解析16进制颜色值
            const r = parseInt(colorString.slice(0, 2), 16);
            const g = parseInt(colorString.slice(2, 4), 16);
            const b = parseInt(colorString.slice(4, 6), 16);

            return { r, g, b };
        } else if (colorString.startsWith('rgb')) {
            // 如果颜色字符串以'rgb'开头，表示它是rgb或rgba颜色
            const startIndex = colorString.indexOf('(') + 1;
            const endIndex = colorString.indexOf(')');
            const values = colorString.slice(startIndex, endIndex).split(',');

            if (values.length < 3) {
                return null; // 无效的颜色字符串
            }

            const r = parseInt(values[0]);
            const g = parseInt(values[1]);
            const b = parseInt(values[2]);

            return { r, g, b };
        }

        return null; // 无效的颜色字符串
    },

    lightenColor(colorString, factor) {
        var color = this.parseColor(colorString)
        if (!color) return "#000000";
        const r = Math.min(255, color.r + 255 * factor);
        const g = Math.min(255, color.g + 255 * factor);
        const b = Math.min(255, color.b + 255 * factor);

        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    },

    darkenColor(colorString, factor) {
        var color = this.parseColor(colorString)
        if (!color) return "#000000";
        const r = Math.max(0, color.r - 255 * factor);
        const g = Math.max(0, color.g - 255 * factor);
        const b = Math.max(0, color.b - 255 * factor);

        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

}
Vue.component("draglinechart", {
    /**
     * 实现思路：
     * 1、接收一个chartOption,格式是完全符合echarts的option格式，在每个series中增加一个yshDrag属性，用来标识是否可拖拽,在这个属性为true且type为line的series生效
     * 2、要能够区分预览和编辑状态，预览状态下不可拖拽，编辑状态下可拖拽
     * 3、拖拽分类：a、单点拖拽，b、整条曲线拖拽，c、框选部分曲线拖拽
     * 4、拖拽配套的功能：a、原始曲线要以虚线形式展示，b:单点拖拽要要有一个列表展示每个点的的拖拽值，拖拽比例，最终值，保存按钮；整体拖拽要有一个输入框选择整体拖拽值，保存按钮；框选拖拽要有一个输入框选择框选拖拽值，保存按钮
     * 5、记录原始数据，记录拖拽变动数据(差值)，最终数据有这两部分数据计算得出
     * 6、单点拖拽要能够点高亮,有虚线辅助线，整体拖拽要能够曲线高亮，框选拖拽要能够框选高亮
     * 7、仅考虑一个x轴一个y轴的情况，数据仅考虑一维数组，暂不支持二维数组模式
     * 
     */
    props: {
        option: {
            type: Object,
            default: function () {
                return {}
            }
        },

        dargconfig: {
            type: Object,
            default: function () {
                return {}
            }
        }
    },
    data: function () {
        return {
            echart: null,//echart实例
            config: {
                showEditButton: true,

                tableInModal: false,
                showCategory: true,
                showDragBaseLine: true,
                showDragRateColumn: true,
                showTable: true,
                //只显示当前的拖拽线，其他的可拖拽的线隐藏
                // onlyShowCurrentDragLine: true,
            },
            isEdit: false,//是否编辑状态
            finallyDragLine: {},//当前拖拽曲线数据,key为seriesId,value为seriesData,
            dragLineInfo: {},//拖拽曲线信息,key为seriesId,value为{symbolSize:5,symbol:'circle',lineStyle:{type:'dashed',color:'#000000'}}
            lightInfo: {},//高亮信息,key为seriesId,value为{lineId:{dataIndex:{color:'red'}}}
            xData: [],//x轴的数据
            tableData: [],//表格数据
            tableHeight: 0,//表格高度
            //能拖拽的线路名称列表
            dragLineList: [],
            currentDragLine: "",
            DRAG_MARK: "yshDrag",
            DRAG_SUM_MARK: "yshDragSum",
            dragSumId: null,
            categoryList: [

                { name: "单点拖拽", value: "single" },
                { name: "范围拖拽", value: "range" },
                { name: "整体拖拽", value: "all" },
                { name: "绘制曲线", value: "draw" },
            ],//分类列表
            currentCategory: "single",//当前分类,
            prevCategory: undefined,//上一次分类
            dradRange: [0, 0],//框选范围
            tableModal: false,
            history: {},//操作历史，记录拖拽结束回调时的diff数据,用于撤销操作
            historyIndex: {},//历史记录指针
            DRAG_ZLEVEL: 1,
            DRAG_Z: 10,
            LIGHT_COLOR: '#00FF00',
            isDrawing: false,
            DRAW_UPDATE_TIME_DIFF: 10,
            drawUpdateTimeDic: {},//绘制曲线时，记录每个点的更新时间，用于控制更新频率
            zr: null,//getZr  获取的对象  非标准属性
            columns: [
                {
                    title: '时间点',
                    key: "xAixsData",
                    width: 80,
                    align: 'center'
                }, {
                    title: '最终值',
                    slot: "finalValue",
                    minWidth: 140,
                    align: 'center'
                },
            ],
            modalWidth: 300,
            mouseBuffer: [],//鼠标移动缓冲区
            prevMouseValue: undefined,//上一次移动时的值，用于插值计算，当松开鼠标300ms后，清空
            prevMouseX: null,
            contextmenuDiff: 0,//右键菜单输入框的值
            currentDataIndexs: [],//正在操作的点用于给
            showContextMenu: false,
        }
    },
    computed: {
        showDragSwitch: function () {
            return this.dragLineList.length > 1;
        },
        signalButtonText: function () {
            return this.isEdit ? "保存" : "编辑";
        },

        allowSetChart: function () {
            return this.echart && this.dragLineList.length > 0 && this.currentDragLine;
        },
        tableReadonly: function () {
            return !this.isEdit;
        },
        modalTitle: function () {
            return this.isEdit ? this.currentDragLine + "（编辑）" : this.currentDragLine + "（预览）"
        },
        sliderTableShow: function () {
            return this.config.showTable && !this.config.tableInModal;
        },
        showTableSelect: function () {
            return this.dragLineList.length > 1;
        },
    },
    methods: {

        clickEditOrSave: function () {

            this.isEdit = !this.isEdit;
            this.initDragState();
            if (!this.isEdit) {
                this.$emit('drag-save', {
                    // baseDragLine: this.baseDragLine,
                    finallyDragLine: this.finallyDragLine,
                    // diffDragLine: this.diffDragLine,
                });
            }
        },
        toPreview: function () {
            this.$nextTick(() => {
                this.isEdit = false;
                // this.deleteBaseLine();
                this.deleteGraphic();
                this.deleteLightLabel();
            })

        },
        toEdit: function () {
            this.$nextTick(() => {
                this.isEdit = true;
                // this.insertBaseLine();
                // var find = this.categoryList.find(item => item.value == this.currentCategory)
                // var currentCategoeyItem = this.categoryList[0]
                // if (find) {
                //     currentCategoeyItem = find;
                // }
                this.changeCategoey(this.currentCategory)
                this.changeDrag();
            })

        },
        toSaveAndEmit: function () {
            this.$emit('drag-save', {
                // baseDragLine: this.baseDragLine,
                finallyDragLine: this.finallyDragLine,
                // diffDragLine: this.diffDragLine,
            });
            this.isEdit = false;
            this.toPreview();
        },


        getDragLine: function () {
            return this.finallyDragLine;
            this.$emit('get-dragline', this.finallyDragLine);
        },
        // 修正预测数据,全部修正为5的倍数
        amendmentData: function () {
            for (var key in this.finallyDragLine) {
                var finallyData = this.finallyDragLine[key];
                for (var i = 0; i < finallyData.length; i++) {
                    var finallyNum = finallyData[i] ? Number(finallyData[i]) : 0;
                    // 向上取整Math.ceil 向下取整Math.floor,四舍五入Math.round
                    finallyNum = Math.round(finallyNum / 5) * 5;
                    this.finallyDragLine[key][i] = finallyNum;
                }
            }
            this.updateTable();
            this.updateChart();
        },
        initDragState: function () {
            this.$nextTick(() => {

                if (this.isEdit) {
                    // this.insertBaseLine();
                    // var find = this.categoryList.find(item => item.value == this.currentCategory)
                    // var currentCategoeyItem = this.categoryList[0]
                    // if (find) {
                    //     currentCategoeyItem = find;
                    // }
                    this.changeCategoey(this.currentCategory)
                    this.changeDrag();
                } else {

                    // this.deleteBaseLine();
                    this.deleteGraphic();
                    this.deleteLightLabel();
                    //向外抛出数据
                }

                this.resize();

            })
        },
        getOption: function () {
            return this.echart ? this.echart.getOption() : null;
        },
        setOption: function (option, isMerge) {
            if (!this.echart) return;
            this.echart.setOption(option, isMerge);
        },
        changeCategoey: function (value, item) {
            this.currentCategory = value;
            if (!this.allowSetChart) return;
            this.emptyLightInfo();
            switch (this.prevCategory) {
                case "single":
                    this.deleteSignalDragLine();
                    break;
                case "range":
                    this.deleteRangeDragLine();
                    break;
                case "all":
                    this.deleteAllDragLine();
                    break;
                case "draw":
                    this.deleteDrawPoint();
                    break;
            }
            switch (this.currentCategory) {
                case "single":
                    this.insertSignalDragLine();
                    break;
                case "range":
                    this.insertRangeDragLine();

                    break;
                case "all":
                    this.insertAllDragLine();
                    break;
                case "draw":
                    this.insertDrawPoint();
                    break;
            }

            this.prevCategory = value;
            this.resize();

        },
        changeDrag: function () {
            this.updateTable();
            if (this.isEdit) {
                // var find = this.categoryList.find(item => item.value == this.currentCategory);
                // if (!find) return;
                this.changeCategoey(this.currentCategory);
            }

        },
        clickTableModal: function () {
            this.tableModal = !this.tableModal;
        },
        insertSignalDragLine: function () {
            if (!this.allowSetChart) return;
            //单点处理逻辑
            this.createSignalDargPoint();
        },
        deleteSignalDragLine: function () {
            if (!this.allowSetChart) return;
            var option = this.echart.getOption();
            delete option.graphic
            var series = option.series;
            series.forEach((item, index) => {
                if (item[this.DRAG_MARK] && item.type == 'line') {
                    item.data = this.finallyDragLine[item.id];
                }
            })
            this.echart.setOption(option, true);

        },
        insertRangeDragLine: function () {
            if (!this.allowSetChart) return;
            //显示框选和清除框选按钮
            // var _this = this;
            this.echart.off('brushEnd')
            this.echart.on('brushEnd', (params) => {
                this.brushSelectedEnd(params)
            });
            this.currentDataIndexs = [];
            this.openBrush();

        },
        deleteRangeDragLine: function () {
            if (!this.allowSetChart) return;
            //隐藏框选和清除框选按钮

            var option = this.echart.getOption();
            delete option.graphic
            delete option.visualMap
            var series = option.series;
            series.forEach((item, index) => {
                if (item[this.DRAG_MARK] && item.type == 'line') {
                    item.data = this.finallyDragLine[item.id];
                }
            })
            this.echart.setOption(option, true);
            this.dradRange = [0, 0];
            //注销框选回调事件
            this.echart.off('brushEnd', this.brushSelectedEnd);

        },
        insertAllDragLine: function () {
            if (!this.allowSetChart) return;
            this.dradRange = [0, this.xData.length - 1];
            this.createRangeDragPoint(this.dradRange[0], this.dradRange[1]);

            this.currentDataIndexs = [];
            for (var i = this.dradRange[0]; i <= this.dradRange[1]; i++) {
                this.currentDataIndexs.push(i)
            }
        },
        deleteAllDragLine: function () {
            if (!this.allowSetChart) return;
            //隐藏框选和清除框选按钮

            var option = this.echart.getOption();
            delete option.graphic
            // delete option.visualMap
            var series = option.series;
            series.forEach((item, index) => {
                if (item[this.DRAG_MARK] && item.type == 'line') {
                    item.data = this.finallyDragLine[item.id];
                }
            })
            this.echart.setOption(option, true);
            this.dradRange = [0, 0];
        },
        insertDrawPoint: function () {
            if (!this.currentDragLine) return;
            if (!this.echart) return;
            if (!this.zr) {
                this.zr = this.echart.getZr()
            }
            var zr = this.zr
            // 绑定点击事件
            zr.on('mousedown', this.zrMousedown);
            zr.on('mouseup', this.zrMouseup);
            zr.on('mousemove', this.zrMousemove);


        },

        deleteDrawPoint: function () {
            if (!this.currentDragLine) return;
            if (!this.echart) return;
            var zr = this.zr;
            if (!zr) return;
            zr.off('mousedown', this.zrMousedown);
            zr.off('mouseup', this.zrMouseup);
            zr.off('mousemove', this.zrMousemove);
        },
        //由于 采样频率不够很多点都未采集所以需要进行插值，采用线性插值
        updateDraw: function (x, y) {
            if (!x || !y) return;
            this.mouseBuffer.push([x, y]);
            requestAnimationFrame(() => {
                var chartValues = this.interpolation();
                chartValues.forEach(item => {
                    this.finallyDragLine[this.currentDragLine][item[0]] = item[1];
                })
                this.updateChart();
            })

        },
        interpolation: function () {
            var dic = {};

            if (this.prevMouseX != null) {
                dic[this.prevMouseX] = this.finallyDragLine[this.currentDragLine][this.prevMouseX];
            }


            var currentEndX = null;
            this.mouseBuffer.forEach((item, index) => {
                var pointInGrid = this.echart.convertFromPixel('grid', [item[0], item[1]]);
                dic[pointInGrid[0]] = pointInGrid[1];
                currentEndX = pointInGrid[0];
            })
            if (currentEndX != null)
                currentEndX = Number(currentEndX);

            var chartValues = [];
            for (var key in dic) {
                chartValues.push([Number(key), dic[key]]);
            }
            chartValues.sort((a, b) => {
                return a[0] - b[0];
            })
            if (chartValues.length == 0) {
                this.mouseBuffer = [];
                return chartValues;
            }

            var start = chartValues[0][0];
            var end = chartValues[chartValues.length - 1][0];

            var step = 1;
            var result = [];
            for (var i = start; i <= end; i += step) {
                var find = chartValues.find(item => item[0] == i);
                if (find) {
                    result.push(find);
                } else {
                    var pre = chartValues.find(item => item[0] < i);
                    var next = chartValues.find(item => item[0] > i);
                    if (pre && next) {
                        var y = (next[1] - pre[1]) / (next[0] - pre[0]) * (i - pre[0]) + pre[1];
                        result.push([i, y]);
                    }
                }
            }
            this.mouseBuffer = [];
            if (currentEndX != null)
                this.prevMouseX = currentEndX;
            return result;
        },
        initChart: function () {
            var chart = echarts.init(this.$refs.dragLineChartWrap, null, {
                renderer: 'canvas',
                useDirtyRect: false
            });
            this.initData();
            this.columns[0].title = this.chartOption.xAxis.name;
            chart.setOption(this.chartOption, true);

            this.echart = chart;
            this.echart.off('dataZoom')
            this.echart.on('dataZoom', () => {
                this.updatePosition();
            });
            // 单点选项希望鼠标在哪能够直接改值;
            this.echart.off('showTip')
            this.echart.on('showTip', (params) => {
                if (this.currentCategory != "single") return;
                this.currentDataIndexs = [];
                var dataIndex = params.dataIndex;
                this.currentDataIndexs = [dataIndex];
            });
            this.initDragLineList();
            this.initHistory();
            if (!this.allowSetChart) {
                console.warn("拖拽曲线初始化失败");
                return;
            };

            this.changeDrag();
            this.initDragState();
            this.updateDragSum();
            this.resize();
            // console.log("拖拽曲线初始化成功");
        },

        initData: function () {
            this.xData = this.chartOption?.xAxis?.data || [];
            var series = this.chartOption?.series || [];
            series.forEach((item, index) => {
                var id = ""
                if (item.id) {
                    id = item.id;
                } else {
                    id = item.name;
                    //当series没有id时，将name赋值给id
                    item.id = item.name;
                }
                if (item[this.DRAG_MARK] && item.type == 'line') {
                    item.symbol = 'circle';
                    item.zlevel = this.DRAG_ZLEVEL;
                    item.z = this.DRAG_Z;
                    this.finallyDragLine[id] = item.data;
                    this.finallyDragLine[id] = JSON.parse(JSON.stringify(item.data));
                    this.finallyDragLine[id].forEach((item, index) => {
                        var v = Number(item)
                        v = isNaN(v) ? 0 : v;
                        this.finallyDragLine[id][index] = v;
                    })
                    this.dragLineInfo[id] = this.dragLineInfo[id] ? this.dragLineInfo[id] : {
                        symbolSize: item.symbolSize * 2 || 10,
                        symbol: item.symbol || 'circle',
                    }

                }
                if (item[this.DRAG_SUM_MARK] && item.type == 'line') {
                    this.dragSumId = id;

                }
            });
            this.chartOption.xAxis = DataHelper.deepMergeCover(this.chartOption.xAxis, {
                axisTick: {
                    alignWithLabel: true
                }
            })
            this.chartOption = DataHelper.deepMergeCover(this.chartOption, {
                toolbox: {
                    show: false,
                    feature: {
                        brush: {
                            type: ['lineX', 'clear']
                        }
                    }
                },
                brush: {
                    xAxisIndex: 'all',
                    brushLink: 'all',
                    outOfBrush: {
                        colorAlpha: 0.1
                    }
                }
            })


        },
        getDragSumData: function () {
            var sumData = [];
            for (var key in this.finallyDragLine) {
                var data = this.finallyDragLine[key];
                data.forEach((item, index) => {
                    var s = sumData[index];
                    s = isNaN(s) ? 0 : Number(s);
                    var v = isNaN(item) ? 0 : Number(item);
                    sumData[index] = s + v;
                })
            }
            return sumData;
        },
        updateDragSum: function () {
            //更新折线图
            var key = this.dragSumId;
            if (!key) return;
            var data = this.getDragSumData();
            this.echart.setOption({
                series: [
                    {
                        id: key,
                        data: data
                    }
                ]
            })
        },
        dragChange: function () {
            this.emitChange();
        },
        emitChange: Descorate.debounce(function () {
            this.$emit('drag-change', this.finallyDragLine);
        }, 500),
        initDragLineList: function () {
            var list = []
            for (var key in this.finallyDragLine) {
                list.push({
                    name: key,
                    value: key,
                })
            }
            this.dragLineList = list;
            if (list.length == 0) return;
            this.currentDragLine = list[0].value;
        },
        initHistory: function () {
            var history = {}
            var historyIndex = {}
            for (var key in this.finallyDragLine) {
                history[key] = [];
                history[key].push(JSON.parse(JSON.stringify(this.finallyDragLine[key])));
                historyIndex[key] = 0;
            }
            this.history = history;
            this.historyIndex = historyIndex;
        },
        generateGraphicId: function (key, dataIndex) {
            return key + "_" + dataIndex;
        },

        createSignalDargPoint: function () {
            if (!this.currentDragLine) return;
            var graphicList = []
            var key = this.currentDragLine;
            var data = this.finallyDragLine[key]
            var symbol = this.dragLineInfo[key].symbol;
            var symbolSize = this.dragLineInfo[key].symbolSize;
            var lightItem = {};
            if (this.lightInfo[key]) {
                lightItem = this.lightInfo[key];
            }
            for (var i = 0; i < data.length; i++) {
                lightItem[i] = {
                    color: this.LIGHT_COLOR,
                }
            }
            this.lightInfo[key] = lightItem;
            var lineData = this.listToLineData(data, key);
            var graphicListItem = data.map((item, dataIndex) => {
                return {
                    type: symbol,
                    id: this.generateGraphicId(key, dataIndex),
                    position: this.echart.convertToPixel('grid', [this.xData[dataIndex], item]),
                    shape: {
                        cx: 0,
                        cy: 0,
                        r: symbolSize / 2
                    },
                    invisible: true,
                    draggable: 'vertical',
                    ondrag: ((key, dataIndex) => {
                        return (event) => {
                            requestAnimationFrame(() => {
                                this.onPointDragging(key, dataIndex, event);
                            })

                        };
                    })(key, dataIndex),
                    ondragend: ((key, dataIndex) => {
                        return (event) => {
                            requestAnimationFrame(() => {
                                this.updatePosition();
                                this.updateHistory(key);
                                this.updateDragSum();
                                this.updateTable();
                                this.dragChange();
                            })
                        }
                    })(key, dataIndex),

                    z: this.DRAG_Z + 1,
                    zlevel: this.DRAG_ZLEVEL,

                };
            })
            graphicList = graphicList.concat(graphicListItem)
            this.echart.setOption({
                graphic: graphicList,
                series: [
                    {
                        id: key,
                        data: lineData
                    }
                ]
            });
        },
        createRangeDragPoint: function (s, e) {
            if (!this.currentDragLine) return;
            var graphicList = []
            var option = this.echart.getOption();
            var graphicElements = option.graphic ? option.graphic[0].elements : [];

            var key = this.currentDragLine;
            var data = this.finallyDragLine[key]
            var symbol = this.dragLineInfo[key].symbol;
            var symbolSize = this.dragLineInfo[key].symbolSize;
            var lightItem = {};
            if (this.lightInfo[key]) {
                lightItem = this.lightInfo[key];
            }
            for (var i = s; i <= e; i++) {
                lightItem[i] = {
                    color: this.LIGHT_COLOR,
                    // background: '#00FF00'
                };
                var item = data[i];
                var dataIndex = i;
                var haveGraphic = graphicElements.find(item => item.id == this.generateGraphicId(key, dataIndex));
                if (haveGraphic) continue;
                var graphicListItem = {
                    type: symbol,
                    id: this.generateGraphicId(key, dataIndex),
                    position: this.echart.convertToPixel('grid', [this.xData[dataIndex], item]),
                    shape: {
                        cx: 0,
                        cy: 0,
                        r: symbolSize / 2
                    },
                    invisible: true,
                    style: {
                        fill: '#00FF00',
                    },
                    draggable: 'vertical',

                    ondrag: ((key, dataIndex) => {
                        return (event) => {
                            requestAnimationFrame(() => {
                                this.onRangeDragging(key, dataIndex, event);
                            })

                        };
                    })(key, dataIndex),
                    ondragend: ((key, dataIndex) => {
                        return (event) => {
                            requestAnimationFrame(() => {
                                this.updatePosition();
                                this.updateHistory(key);
                                this.updateDragSum();
                                this.updateTable();
                                this.dragChange();
                            })
                        }
                    })(key, dataIndex),
                    z: this.DRAG_Z + 1,
                    zlevel: this.DRAG_ZLEVEL,

                };
                graphicList.push(graphicListItem)
            }
            this.lightInfo[key] = lightItem;
            var lineData = this.listToLineData(data, key);

            this.echart.setOption({
                graphic: graphicList,
                series: [
                    {
                        id: key,
                        data: lineData
                    }
                ]
            });

        },

        updateHistory: function (key) {
            var finallyDragLine = this.finallyDragLine[key];
            this.recordHistory(JSON.parse(JSON.stringify(finallyDragLine)), key);
        },
        updateTable: Descorate.debounce(function () {
            if (!this.currentDragLine) return;
            var data = this.finallyDragLine[this.currentDragLine]
            if (!data) return;
            var tableData = data.map((item, dataIndex) => {
                var finalValue = Number(Number(item).toFixed(2));
                finalValue = isNaN(finalValue) ? 0 : finalValue;
                return {
                    xAixsData: this.xData[dataIndex],
                    finalValue: finalValue,
                };

            })
            this.tableData = tableData;
        }, 300),

        changeFinallyValue: Descorate.debounce(function (row, index) {
            var finalValue = Number(Number(row.finalValue).toFixed(2));
            this.tableData[index].finalValue = finalValue;
            this.finallyDragLine[this.currentDragLine][index] = finalValue;
            this.updateChart();
        }, 300),

        updateChart: function () {
            //更新折线图
            var key = this.currentDragLine;
            var data = this.finallyDragLine[key];
            var lineData = this.listToLineData(data, key);
            this.echart.setOption({
                series: [
                    {
                        id: key,
                        data: lineData
                    }
                ]
            })
            //更新拖拽点的位置
            this.updatePosition();
        },
        resize: function () {
            if (this.echart) {
                this.$nextTick(() => {
                    this.echart.resize();
                    this.updatePosition();

                })


            }
            this.$nextTick(() => {
                this.tableHeight = this.$refs.contentWrap.clientHeight - 20;
            })

        },

        updatePosition: function () {
            if (!this.echart || !this.isEdit) return;
            var option = this.echart.getOption();
            if (!option.graphic) return;
            var graphicElements = option.graphic[0].elements;
            for (var i = 0; i < graphicElements.length; i++) {
                var item = graphicElements[i];
                var id = item.id;
                var dataIndex = Number(id.split("_")[1]);
                var position = this.echart.convertToPixel('grid', [this.xData[dataIndex], this.finallyDragLine[this.currentDragLine][dataIndex]]);
                item.position = position;
            }
            this.echart.setOption(option, true);
            return;

        },


        // throttle
        onPointDragging: function (key, dataIndex, e) {
            if (!this.isEdit) return;
            this.finallyDragLine[key][dataIndex] = this.echart.convertFromPixel('grid', e.target.position)[1];
            var data = this.finallyDragLine[key];
            var lineData = this.listToLineData(data, key);
            requestAnimationFrame(() => {
                this.echart.setOption({
                    series: [
                        {
                            id: key,
                            data: lineData
                        }
                    ]
                })
            })
            this.updatePosition();
            this.updateHistory(key);
            this.updateDragSum();
            this.dragChange();
        },
        // throttle
        onRangeDragging: function (key, dataIndex, e) {
            if (!this.isEdit) return;
            var option = this.echart.getOption();
            if (!option.graphic) return;
            var graphicElements = option.graphic[0].elements;
            var finallyV = this.echart.convertFromPixel('grid', e.target.position)[1];
            var oldFinallyV = this.finallyDragLine[key][dataIndex];
            finallyV = finallyV ? Number(finallyV) : 0;
            oldFinallyV = oldFinallyV ? Number(oldFinallyV) : 0;
            var diff = Number(finallyV - oldFinallyV);
            for (var i = 0; i < graphicElements.length; i++) {
                var item = graphicElements[i];
                var id = item.id;
                var dataIndex = Number(id.split("_")[1]);
                this.finallyDragLine[key][dataIndex] = this.finallyDragLine[key][dataIndex] + diff;
            }
            var data = this.finallyDragLine[key];
            var lineData = this.listToLineData(data, key);
            requestAnimationFrame(() => {
                this.echart.setOption({
                    series: [
                        {
                            id: key,
                            data: lineData
                        }
                    ]
                })
            })

        },
        insertBaseLine: function () {

            if (!this.echart) return;
            if (!this.config.showDragBaseLine) return;
            var option = this.echart.getOption();
            var baseLines = [];
            var baseLineInsertIndex = []
            option.series = option.series.filter((item, index) => {
                if (item.isBaseLine && item.type == 'line') {
                    return false;
                }
                return true;
            })

            option.series.forEach((item, index) => {
                if (item[this.DRAG_MARK] && item.type == 'line') {
                    var id = item.id;
                    var name = item.name;
                    var data = this.baseDragLine[id];
                    var color = item?.itemStyle?.color ? item?.itemStyle?.color : option.color[index % option.color.length];
                    var baseLine = Ysh.Object.clone(item);

                    baseLine.id = id + "_baseLine";
                    baseLine.name = name + "_基准线";
                    baseLine.isBaseLine = true;
                    baseLine[this.DRAG_MARK] = false;
                    if (!baseLine.itemStyle) {
                        baseLine.itemStyle = {};
                    }
                    baseLine.itemStyle.color = color;
                    if (!item.itemStyle) {
                        item.itemStyle = {};
                    }

                    item.itemStyle.color = color;
                    baseLine.data = data;
                    baseLine.z = this.DRAG_Z - 1;
                    baseLine.zlevel = this.DRAG_ZLEVEL;

                    baseLine.lineStyle.type = "dashed";
                    baseLine.markLine = undefined;
                    baseLine.markPoint = undefined;
                    baseLines.push(baseLine);
                    baseLineInsertIndex.push(index);

                }

            })
            baseLineInsertIndex.forEach((item, index) => {
                option.series.splice(item + index, 0, baseLines[index]);
            })
            this.echart.setOption(option, true)

        },
        deleteBaseLine: function () {
            if (!this.echart) return;
            var option = this.echart.getOption();
            var series = option.series;
            option.series = series.filter((item, index) => {
                if (item.isBaseLine && item.type == 'line') {
                    return false;
                }
                return true;
            })
            this.echart.setOption(option, true)
        },
        deleteGraphic: function () {
            if (!this.echart) return;
            var option = this.echart.getOption();
            delete option.graphic
            this.echart.setOption(option, true);
        },
        deleteLightLabel: function () {
            if (!this.echart) return;
            var option = this.echart.getOption();
            var series = option.series;
            series.forEach((item, index) => {
                if (item[this.DRAG_MARK] && item.type == 'line') {
                    item.data = this.finallyDragLine[item.id];
                }
            })
            this.echart.setOption(option, true);
        },


        //开始框选
        openBrush: function () {
            if (!this.allowSetChart) return;

            this.echart.dispatchAction({
                type: 'takeGlobalCursor',
                // 如果想变为“可刷选状态”，必须设置。不设置则会关闭“可刷选状态”。
                key: 'brush',
                brushOption: {
                    // 参见 brush 组件的 brushType。如果设置为 false 则关闭“可刷选状态”。
                    brushType: 'lineX',
                    // 参见 brush 组件的 brushMode。如果不设置，则取 brush 组件的 brushMode 设置
                    brushMode: 'single'
                }
            });

        },
        //框选结束回调
        brushSelectedEnd: function (params) {
            if (!this.allowSetChart) return;
            var coordRange = params.areas[0].coordRange;
            this.dradRange = coordRange;
            var s = coordRange[0];
            var e = coordRange[1];
            this.rangeSelected(s, e);

            for (var i = s; i <= e; i++) {
                this.currentDataIndexs.push(i);
            }
        },
        rangeSelected: function (s, e) {

            this.echart.dispatchAction({
                type: 'brush',
                areas: []
            });
            // 不在nextTick中调用会导致关闭刷选光标一定几率失败
            this.$nextTick(() => {
                this.echart.dispatchAction({
                    type: 'takeGlobalCursor',
                    key: 'brush',
                    // 设置为false则关闭“可刷选状态”
                    brushOption: {
                        brushType: false
                    }
                });
            })
            this.createRangeDragPoint(s, e);


        },

        // debounce
        recordHistory: Descorate.debounce(function (finallyDragLine, key) {
            var historyList = this.history[key];
            if (historyList.length - 1 == this.historyIndex[key]) {
                historyList.push(finallyDragLine);
                this.historyIndex[key]++;
            } else {

                historyList.splice(this.historyIndex[key] + 1);
                this.historyIndex[key] = historyList.length - 1;
                historyList.push(finallyDragLine);
                this.historyIndex[key]++;
            }


        }, 300),
        undo: function () {
            var key = this.currentDragLine;
            var historyList = this.history[key];
            if (historyList.length > this.historyIndex[key] && this.historyIndex[key] > 0) {
                // 弹出当前状态
                this.historyIndex[key]--
                // 获取上一个状态
                var finallyList = historyList[this.historyIndex[key]];
                // 恢复图表和其他状态
                this.restoreState(finallyList);
            }
        },
        redo: function () {
            var key = this.currentDragLine;
            var historyList = this.history[key];
            if (historyList.length - 1 > this.historyIndex[key]) {
                // 弹出当前状态
                this.historyIndex[key]++
                // 获取上一个状态
                var finallyList = historyList[this.historyIndex[key]];
                // 恢复图表和其他状态
                this.restoreState(finallyList);
            }
        },
        // 恢复状态的方法
        restoreState(finallyList) {
            var key = this.currentDragLine;
            this.finallyDragLine[key] = Ysh.Object.clone(finallyList);
            this.updateTable();
            this.updateChart();
        },
        handleKeyDown: function (e) {
            // 撤销
            if (e.keyCode == 90 && e.ctrlKey) {
                this.undo();
            }
            // 重做
            if (e.keyCode == 89 && e.ctrlKey) {
                this.redo();
            }
            // 批量选择，范围拖拽 + CTRL 
            if (e.ctrlKey && e.keyCode == 17) {
                // window.setTimeout(() => {
                if (this.currentCategory == "range") {
                    this.openBrush();
                }
                // })


            }
        },
        handelKeyUp: function (e) {
            return
            if (!e.ctrlKey && e.keyCode == 17) {
                if (this.currentCategory == "range") {
                    this.$nextTick(() => {
                        this.echart.dispatchAction({
                            type: 'takeGlobalCursor',
                            key: 'brush',
                            // 设置为false则关闭“可刷选状态”
                            brushOption: {
                                brushType: false
                            }
                        });
                    })


                }
            }
        },
        handelMouseUp: function (e) {
            return
            if (this.currentCategory == "range") {
                this.$nextTick(() => {
                    this.echart.dispatchAction({
                        type: 'takeGlobalCursor',
                        key: 'brush',
                        // 设置为false则关闭“可刷选状态”
                        brushOption: {
                            brushType: false
                        }
                    });
                })


            }

        },
        clearOverHistory: function () {
            var HiSTORY_LENGTH = 100;
            for (var key in this.history) {
                var historyList = this.history[key];
                if (historyList.length > HiSTORY_LENGTH) {
                    historyList.splice(0, (historyList.length - HiSTORY_LENGTH));
                    this.historyIndex[key] = historyList.length - 1;
                }
            }
        },

        emptyLightInfo: function () {
            this.lightInfo = {};
        },
        // 数值数组转为带样式的数组
        listToLineData: function (list, key) {
            var lineData = [];
            var lightItem = this.lightInfo[key];
            if (!lightItem) {
                lineData = list;
                return lineData;
            }
            list.forEach((item, index) => {
                var light = lightItem[index];
                var itemStyle = light ? light : {}
                lineData.push({
                    value: item,
                    itemStyle: itemStyle
                })
            })
            return lineData;
        },
        // 带样式的数组转为数值数组
        lineDataToList: function (lineData) {
            var list = [];
            lineData.forEach((item, index) => {
                if (Object.isObject(item)) {
                    list.push(item.value)
                } else {
                    list.push(item)
                }
            })
            return list;
        },
        contextmenuClick: function (event) {
            if (!this.isEdit) return;
            if (this.currentCategory == 'draw') return;
            event.preventDefault();
            var target = this.$refs.contextmenuRef;
            this.showContextMenu = true;
            if (target) {
                target.style.left = event.pageX + 'px';
                target.style.top = event.pageY + 'px';
            }
        },
        saveDiff: function () {
            // 获取偏移值，将其设置在diff上并且更新point；
            if (this.contextmenuDiff == 0) return;
            var diff = Number(this.contextmenuDiff);

            var key = this.currentDragLine;
            this.currentDataIndexs.forEach(dataIndex => {
                this.finallyDragLine[key][dataIndex] = this.finallyDragLine[key][dataIndex] + diff;
            })
            var data = this.finallyDragLine[key];
            var lineData = this.listToLineData(data, key);
            requestAnimationFrame(() => {
                this.echart.setOption({
                    series: [
                        {
                            id: key,
                            data: lineData
                        }
                    ]
                })
                this.updatePosition();
                this.updateHistory(key);
                this.updateDragSum();
                this.updateTable();
                this.dragChange();
            })
            this.contextmenuDiff = 0;
            this.showContextMenu = false;
        }


    },
    created: function () {
        this.zrMousedown = (event) => {
            this.mouseBuffer = [];
            this.prevMouseValue = undefined;
            this.prevMouseX = null;
            this.isDrawing = true;
            this.updateDraw(event.offsetX, event.offsetY)
        }
        this.zrMouseup = (event) => {
            this.isDrawing = false;
            this.mouseBuffer = [];
            this.prevMouseValue = undefined;
            this.prevMouseX = null;
        }
        this.zrMousemove = (event) => {
            if (this.isDrawing) {
                this.updateDraw(event.offsetX, event.offsetY)
                this.updateHistory(this.currentDragLine);
                this.updateDragSum();
                this.updateTable();
                this.dragChange();
            }

        }



    },
    mounted: function () {
        this.clearOverHistoryInterval = window.setInterval(() => {
            this.clearOverHistory();
        }, 1000 * 60)
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.handelKeyUp = this.handelKeyUp.bind(this)
        this.handelMouseUp = this.handelMouseUp.bind(this)
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handelKeyUp);
        // window.addEventListener('mouseup', this.handelMouseUp);
    },
    beforeDestroy: function () {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handelKeyUp);
        window.removeEventListener('mouseup', this.handelMouseUp);
        window.clearInterval(this.clearOverHistoryInterval);
    },
    watch: {
        option: {
            deep: true,
            immediate: true,
            handler: function (val) {
                if (!val) return;
                if (Object.keys(val).length == 0) return;
                this.chartOption = val;
                this.$nextTick(() => {
                    this.initChart();
                })
            }
        },

        dargconfig: {
            deep: true,
            immediate: true,
            handler: function (val) {
                if (!val) return;
                this.config = DataHelper.deepMergeCover(this.config, val);
            }
        },
    },

    template: `
        <div style="display:flex;flex-direction:column;width:100%;height:100%;" >
        <div style="width:100%;display:flex;justify-content:space-between;align-items:center;">
             <Button type="primary" @click="clickEditOrSave" v-show="config.showEditButton">{{signalButtonText}}</Button>
            <div v-show="isEdit" style="display:flex;margin-left:14px;">
                <buttons v-if="config.showCategory" :value="this.currentCategory"   :source="categoryList" :preventrepeatclick = "false" @change="changeCategoey" ></buttons>       
                <buttons style="margin-left:20px" v-model="currentDragLine"   :source="dragLineList" :preventrepeatclick = "false" @change="changeDrag"  v-show="showTableSelect"></buttons>   
                 
            </div> 
            
        </div>
       
           
        <div style="flex:1;display:flex;max-height: 100%;" ref="contentWrap">
            <div id="dragLineChartWrap" ref="dragLineChartWrap" style="flex:1 1 0" @contextmenu="contextmenuClick"></div>
            <div  v-show="sliderTableShow" style="width:232px">
                <Table border :columns="columns" :data="tableData" :max-height="tableHeight">
                    <template slot-scope="{ row, index }" slot="finalValue">
                    <InputNumber style="width:120px;" v-model="row.finalValue" :disabled="tableReadonly"    size="small" controls-outside @on-change="changeFinallyValue(row,index)"></InputNumber>
                    </template>
                    </template>
                </Table>
        
            </div>
        </div>
        <div ref="contextmenuRef" v-show="showContextMenu" style="position:absolute;display:flex;" @keyup.enter="saveDiff">
                <InputNumber ref="contextInputRef" style="width:120px;" v-model="contextmenuDiff"     controls-outside ></InputNumber>
                 <Button  type="primary"  @click="saveDiff">确定</Button>
        </div>
        <Modal v-model="tableModal" :width="modalWidth" :title="modalTitle" :styles="{top: '20px'}" draggable :mask="false" :footer-hide="true" :reset-drag-position="true">
            <Table border :columns="columns" :data="tableData" :max-height="tableHeight">
                <template slot-scope="{ row, index }" slot="finalValue">
                <InputNumber style="width:120px;" v-model="row.finalValue" :disabled="tableReadonly"   size="small" controls-outside @on-change="changeFinallyValue(row,index)"></InputNumber>
                </template>
                </template>
            </Table>    
        </Modal>
        </div>
       
    `
});