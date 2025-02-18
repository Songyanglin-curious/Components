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
            editingRowIndex: null,
            editingColumnKey: null
        };
    },
    methods: {
        editCell(rowIndex, columnKey) {
            this.editingRowIndex = rowIndex;
            this.editingColumnKey = columnKey;
        },
        isEditing(rowIndex, columnKey) {
            return this.editingRowIndex === rowIndex && this.editingColumnKey === columnKey;
        },
        saveEdit() {
            if (this.editingRowIndex !== null && this.editingColumnKey !== null) {
                // 这里可以获取到当前行和列的编辑后的值
                const editedData = this.data[this.editingRowIndex];
                // 触发一个事件，将编辑后的数据传递给父组件
                this.$emit('update-data', editedData);
            }
            this.editingRowIndex = null;
            this.editingColumnKey = null;
        }
    },
    template: `
      <div>
        <table>
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.key">{{ column.title }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in data" :key="rowIndex">
              <td v-for="column in columns" :key="column.key">
                <input 
                  v-if="isEditing(rowIndex, column.key)" 
                  type="text" 
                  v-model="row[column.key]" 
                  @blur="saveEdit"
                />
                <span 
                  v-else 
                  @click="column.canEdit ? editCell(rowIndex, column.key) : null"
                  style="cursor: column.canEdit ? 'pointer' : 'not-allowed';"
                >
                  {{ row[column.key] }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `
});
