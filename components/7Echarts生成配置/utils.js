
const GenerateChart = {

    isObject: (obj) => obj !== null && typeof obj === 'object' && !Array.isArray(obj),
    clone: function (obj, map = new WeakMap()) {
        if (Array.isArray(obj)) {
            if (map.has(obj)) return map.get(obj);
            let cloneObj = [];
            map.set(obj, cloneObj);
            for (let i = 0; i < obj.length; i++) {
                cloneObj[i] = this.clone(obj[i], map);
            }
            return cloneObj;
        }
        if (typeof obj === 'function') {
            return obj; // 或者使用其他方法克隆函数
        }
        if (this.isObject(obj)) {
            if (map.has(obj)) return map.get(obj);
            let cloneObj = {};
            map.set(obj, cloneObj);
            for (let k in obj) {
                if (obj.hasOwnProperty(k)) {
                    cloneObj[k] = this.clone(obj[k], map);
                }
            }
            return cloneObj;
        }
        return obj;
    },

    deepMerge: function (target, source, visited = new WeakMap()) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                if (this.isObject(source[key])) {
                    if (visited.has(source[key])) {
                        continue; // 避免循环引用
                    }
                    visited.set(source[key], true);

                    if (!target[key] || !this.isObject(target[key])) {
                        target[key] = {};
                    }
                    this.deepMerge(target[key], source[key], visited);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    },

    getBaseOption: function (config) {
        if (!this.isObject(config)) {
            console.error("配置必须是对象");
            return this.noDataTemplate;
        }
        var option = this.deepMerge(this.clone(this.baseTemplate), config);
        option.xAxis = this.mergeAxes(option.xAxis);
        option.yAxis = this.mergeAxes(option.yAxis);
        return option;
    },

    mergeAxes: function (axes) {
        if (Array.isArray(axes)) {
            return axes.map(item => this.mergeAxis(item));
        } else {
            return this.mergeAxis(axes);
        }
    },

    mergeAxis: function (item) {
        if (!this.isObject(item)) {
            console.error("坐标轴配置必须是对象");
            return {};
        }
        switch (item.type) {
            case "category":
                return this.deepMerge(this.clone(this.categoryAxisTemplate), item);
            case "value":
                return this.deepMerge(this.clone(this.valueAxisTemplate), item);
            default:
                console.warn("未知的坐标轴类型", item);
                return this.deepMerge(this.clone(this.valueAxisTemplate), item);
        }
    },

    getOption: function (config) {
        var option = this.getBaseOption(config);
        var seriesConfig = option.series;
        var series = [];
        if (!Array.isArray(seriesConfig)) {
            console.error("series配置必须是数组");
            return this.noDataTemplate;
        }
        seriesConfig.forEach(item => {
            var type = item.type || "line";
            var templateKey = this.typeMapTemplate[type];
            if (templateKey) {
                var template = this[templateKey];
                series.push(
                    this.deepMerge(this.clone(template), item)
                );
            } else {
                series.push(item);
            }
        });
        if (series.length === 0) {
            return this.noDataTemplate;
        }
        option.series = series;
        return option;
    },

    baseTemplate: {
        legend: {
            itemWidth: 60,
            itemHeight: 30,
            itemGap: 30,
            textStyle: {
                color: '#fff',
                fontSize: 40,
            },
            padding: [22, 0, 0, 0]
        },
        grid: {
            left: 100,
            right: 100,
            top: 100,
            bottom: 100,
        },
        xAxis: {
            type: 'category',
        },
        yAxis: {
            type: 'value',
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0, 103, 138, 1)',
            textStyle: {
                color: '#E7FCFF',
                fontSize: 32,
            },
            borderWidth: 0,
            axisPointer: {
                lineStyle: {
                    color: 'rgb(126,199,255)',
                },
            },
        },
        series: [],
    },

    valueAxisTemplate: {
        type: "value",
        name: "",
        alignTicks: true,
        splitLine: {
            lineStyle: {
                color: '#1E4F79',
                type: 'dashed',
                width: 2,
            },
        },
        axisLabel: {
            color: '#fff',
            fontSize: 32,
            margin: 16,
        },
        axisTick: {
            show: false,
        },
        axisLine: {
            lineStyle: {
                color: '#1E4F79',
                type: 'solid',
                width: 3,
            }
        },
        nameTextStyle: {
            color: '#fff',
            fontSize: 32,
            align: 'right',
        },
        nameGap: 30,
    },

    categoryAxisTemplate: {
        type: "category",
        data: [],
        name: "",
        splitLine: {
            lineStyle: {
                color: '#1E4F79',
                type: 'dashed',
                width: 2,
            },
        },
        axisLabel: {
            color: '#fff',
            fontSize: 32,
            margin: 16,
        },
        axisTick: {
            show: false,
        },
        axisLine: {
            lineStyle: {
                color: '#1E4F79',
                type: 'solid',
                width: 3,
            }
        },
        nameTextStyle: {
            color: '#fff',
            fontSize: 32,
            verticalAlign: 'top',
        },
        nameGap: 30,
    },

    typeMapTemplate: {
        "line": "lineTemplate",
        "bar": "barTemplate",
    },

    lineTemplate: {
        type: "line",
        smooth: false,
        symbol: 'emptyCircle',
        symbolSize: 16,
        lineStyle: {
            width: 4,
        },
    },

    barTemplate: {
        type: "bar",
        barWidth: 32,
    },

    noDataTemplate: {
        graphic: {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
                text: '暂无数据',
                textAlign: 'center',
                fill: '#999',
                fontSize: 32
            }
        }
    },
};
