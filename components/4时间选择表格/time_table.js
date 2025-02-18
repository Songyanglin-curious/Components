Vue.component("time_table", {
    template: `
    <div style="position:relative;">
        <table ref="timeTable" v-show="isEditMode" class="time-table">
            <thead>
                <tr>
                    <th v-for="v in headers" >
                        {{ v }}
                    </th> 
                </tr>
            </thead>
           <tbody>
            <tr v-for="row in tableData" >
                <td v-for="cell in row" :class="classFunc(cell,true)">
                    {{ cellContentFunc ? cellContentFunc(cell) : cell }}
                </td>
            </tr>
              </tbody>
        </table>
        <table  v-if="!isEditMode" class="time-table">
            <thead>
                <tr>
                    <th v-for="v in headers" >
                        {{ v }}
                    </th> 
                </tr>
            </thead>
           <tbody>
            <tr v-for="row in previewData" >
                <td v-for="(cell,index) in row" :class="classFunc(cell.value,false)" :colspan="cell.count" >
                    {{ mergeTextFunc ? mergeTextFunc(cell,index) : cell.value }}
                </td>
            </tr>
            </tbody>
        </table>
        <div ref="contextmenuRef" v-show="showContextMenu" class="time-table__menu" style="position:absolute;z-index:9" >
            <RadioGroup  v-model="selCategory" class="time-table__radio-group" >
                <Radio   v-for="item in categoryList" :label="item.value"  :key="item.value" >{{item.label}}</Radio >
            </RadioGroup >
            <div style="margin-top:10px;display:flex;justify-content:center;align-items:center">
                <input type="button" value="取消" class="pdpBtnDefault cancel-btn" style="margin-right:12px;" @click="cancel" />
                <input type="button" value="确定" class="pdpBtnDefault confirm-btn" @click="save" />
            </div>
      
        </div>
    </div>
    `,
    props: {
        value: {
            type: Array,
            default: () => [[]]
        },
        menusOption: {
            type: Array,
            default: () => []
        },
        classFunc: {
            type: Function,
            default: (cell, isEdit) => {
                if (isEdit) {
                    switch (cell) {
                        case 1:
                            return "first-bd__edit";
                        case 2:
                            return "second-bd__edit";
                        case 3:
                            return "third-bd__edit";
                        default:
                            return cell;
                    }
                } else {
                    switch (cell) {
                        case 1:
                            return "first-bd__preview";
                        case 2:
                            return "second-bd__preview";
                        case 3:
                            return "third-bd__preview";
                        default:
                            return cell;
                    }
                }

            }
        },

        cellContentFunc: {
            type: Function,
            default: (cell) => {
                if (cell == 1 || cell == 2 || cell == 3)
                    return "";
                return cell;
            }
        },
        mergeTextFunc: {
            type: Function,
            default: (cell) => {
                if (cell.count > 1) {
                    let startTime = cell.startIndex + ":00";
                    let endTime = (cell.startIndex + cell.count) + ":00";
                    return `${startTime}至${endTime}`
                }
            }
        }
    },
    data() {
        return {
            SELECTED_CLASS: "time-table-selected",
            tableData: [],
            previewData: [],
            headers: [],
            isEditMode: true,
            isMouseDown: false,
            table: null,//编辑表格对象
            cells: [],
            selectedCells: [],
            prevIndex: null,
            showContextMenu: false,
            selCategory: "",
            categoryList: [
                { value: "", label: "默认" },
                { value: 1, label: "特级保电" },
                { value: 2, label: "一级保电" },
                { value: 3, label: "二级保电" },
            ]
        }
    },
    computed: {

    },
    created: function () {

    },
    mounted() {

    },
    beforeDestroy() {
        this.destroy();
    },
    methods: {
        init: function () {
            this.destroy();
            let coulums = this.value[0].length;
            const arr = [];
            for (var i = 0; i < coulums; i++) {
                arr.push(i);
            }
            this.headers = arr;
            this.$nextTick(() => {
                this.table = this.$refs.timeTable;
                this.table.addEventListener('mousedown', this.handleMouseDown);
                this.table.addEventListener('mousemove', this.handleMouseMove);
                this.table.addEventListener('mouseup', this.handleMouseUp);
                this.renderTableByModel();
            })
        },
        destroy: function () {
            if (!this.table) return;
            this.table.removeEventListener('mousedown', this.handleMouseDown);
            this.table.removeEventListener('mousemove', this.handleMouseMove);
            this.table.removeEventListener('mouseup', this.handleMouseUp);
        },

        handleMouseDown(event) {
            if (!this.isEditMode) return;
            const target = event.target;
            if (this.allowChangeClass(event)) {
                this.isMouseDown = true;
                target.classList.add(this.SELECTED_CLASS);
                this.selectedCells.push(target);
            }
        },
        handleMouseMove(event) {
            if (!this.isEditMode) return;
            const target = event.target;
            if (this.isMouseDown && this.allowChangeClass(event)) {
                if (!target.classList.contains(this.SELECTED_CLASS)) {
                    target.classList.add(this.SELECTED_CLASS);
                    this.selectedCells.push(target);
                } else {
                    return;
                }
            }
        },
        handleMouseUp(event) {

            if (!this.isEditMode) return;
            this.isMouseDown = false;
            // 显示右键菜单
            this.showContextmenu(event);
        },
        changeModel: function () {

            this.isEditMode = !this.isEditMode;
            this.renderTableByModel();
        },
        renderTableByModel: function () {
            if (!this.isEditMode) {
                this.previewData = this.mergeRows(this.tableData);

            }
        },
        toEdit: function () {
            this.isEditMode = true;
            this.renderTableByModel();
        },
        toPreview: function () {
            this.isEditMode = false;
            this.renderTableByModel();
        },

        allowChangeClass: function (event) {
            const target = event.target;
            if (target.tagName.toLowerCase() !== 'td') {
                // console.log("不是td标签");
                return false;
            }


            return true;
        },


        showContextmenu: function (event) {
            event.preventDefault();
            const contextmenu = this.$refs.contextmenuRef;


            const tableRect = this.table.getBoundingClientRect();

            // 计算相对于表格的坐标
            let offsetX = event.clientX - tableRect.left;
            let offsetY = event.clientY - tableRect.top;
            // 当水平方向上 偏移量过小的情况
            if (offsetX < 50) {
                offsetX = 50;
            }
            if (tableRect.right - event.clientX < 120) {//右侧
                offsetX = offsetX - 120;
            }
            contextmenu.style.left = offsetX + 'px';
            contextmenu.style.top = offsetY + 'px';
            this.showContextMenu = true;
        },
        cancel: function () {
            this.selectedCells.forEach(cell => cell.classList.remove(this.SELECTED_CLASS));
            this.selectedCells = [];
            this.showContextMenu = false;
        },
        save: function () {
            this.showContextMenu = false;
            this.selectedCells.forEach(cell => {
                cell.classList.remove(this.SELECTED_CLASS);
                const { rowIndex, cellIndex } = this.getCellIndex(cell);
                this.tableData[rowIndex][cellIndex] = this.selCategory;

            });
            this.$emit('update:value', this.tableData);
            this.$emit("change", this.tableData);
            this.selectedCells = [];
        },


        getCellIndex: function (target) {

            const row = target.parentNode;
            const rows = this.table.rows;
            const rowIndex = Array.prototype.indexOf.call(rows, row);

            const cells = row.cells;
            const cellIndex = Array.prototype.indexOf.call(cells, target);
            return { rowIndex: rowIndex - 1, cellIndex };
        },
        mergeRows: function (array) {
            return array.map(row => {
                let mergedRow = [];
                let i = 0;
                while (i < row.length) {
                    let startIndex = i;
                    let value = row[i];
                    let count = 1;

                    // 跳过空值
                    if (!value) {
                        mergedRow.push({ value: '', startIndex, count: count });
                        i++;
                        continue;
                    }
                    var mergeIndex = i + 1;
                    while (mergeIndex < row.length && row[mergeIndex] === value) {
                        count++;
                        mergeIndex++;
                    }
                    mergedRow.push({ value, startIndex, count });
                    i = mergeIndex;

                }
                return mergedRow;
            });
        }







    },


    watch: {
        value: {
            handler: function (nv) {
                // 判断是否是二维数组
                if (!Array.isArray(nv[0])) {
                    return;
                }
                this.tableData = nv;
                this.init();
                this.$nextTick(() => {
                    this.$forceUpdate();
                })
            },
            deep: true,
            immediate: true
        },

    }
});