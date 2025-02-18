Vue.component("edit_table", {
    props: {
        data: {
            type: Array,
            required: true
        },
        columns: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            tableColumns: [],
            tableData: [],
            editingRow: null,// 正在编辑的行
            editingColumnKey: null,// 正在编辑的列
            _this: null
        };
    },

    methods: {
        init() {
            this.editingRow = null;
            this.editingColumnKey = null;
            this.tableData = this.data.map((row, index) => {
                row._index = index;
                return row;
            });
            this.getColumns();
        },
        getColumns() {
            this.tableColumns = this.columns.map(col => {
                var key = col.key;
                var render = (h, params) => {
                    var row = params.row;
                    var value = row[key];
                    var isEditing = this.editingRow === row && this.editingColumnKey === key;

                    const handel = (event) => {
                        var v = event.target.value;
                        this.$set(row, key, v);
                        const rowIndex = this.tableData.findIndex(item => item._index === row._index);
                        if (rowIndex !== -1) {
                            this.$set(this.tableData, rowIndex, row);
                        }
                        this.$emit('update-data', this.tableData, rowIndex);
                        this.closeEdit();
                    };

                    const inputElement = h('input', {
                        domProps: {
                            value: value
                        },
                        on: {
                            onload: (event) => {
                                event.target.select(); // 选中输入框内容
                            },
                            blur: (event) => {
                                handel(event);
                            },
                            keyup: (event) => {
                                if (event.key === 'Enter') {
                                    handel(event);
                                }
                            }
                        },
                        style: {
                            width: '100%' // 根据需要设置输入框样式
                        }
                    });


                    return h('div', {
                        style: {
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        on: {
                            dblclick: () => {
                                this.editingRow = row; // 设置当前正在编辑的行
                                this.editingColumnKey = key; // 设置当前正在编辑的列
                                //获取真实dom对象,给第一个input元素设置焦点
                                this.$nextTick(() => {
                                    var input = this.$el.querySelectorAll('input')[0];
                                    if (input) {
                                        input.select();
                                    }
                                });

                            }
                        }
                    }, isEditing ? [inputElement] : [value]);
                };

                if (col.canEdit)
                    col.render = render;
                return col;
            });
        },
        closeEdit() {
            this.editingRow = null; // 关闭输入框
            this.editingColumnKey = null; // 关闭输入框
        }

    },
    created() {
        this.init();
        this.__this = this;
    },
    watch: {
        data(newVal, oldVal) {
            this.init();
        },
        columns(newVal, oldVal) {
            this.init();
        }
    },

    template: `
      <Table v-bind="$attrs" :columns="tableColumns" :data="tableData"  @click="closeEdit"></Table>
    `
});
