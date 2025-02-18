// Vue.component("buttons", {
//     props: {
//         value: {
//             type: String,
//             default: '',
//         },
//         source: {
//             type: Array,
//             default: () => [],
//             required: true,
//         },
//         namekey: {
//             type: String,
//             default: 'name',
//         },
//         valuekey: {
//             type: String,
//             default: 'value',
//         },
//         wrapclass: {
//             type: String,
//             default: 'btn-group-wrapper',
//         },
//         preventrepeatclick: {
//             type: Boolean,
//             default: true,
//         }


//     },
//     data() {
//         return {

//             selectedIndex: 0,
//         };
//     },
//     mounted() {

//     },
//     computed: {

//     },
//     watch: {
//         source: {
//             deep: true,
//             // immediate: true,
//             handler: function (val) {
//                 if (!val || val.length == 0) return;
//                 var defaultIndex = this.source.findIndex(item => item[this.valuekey] === this.value);
//                 defaultIndex = defaultIndex === -1 ? 0 : defaultIndex;

//                 this.handleClick(defaultIndex);


//             }
//         },


//     },
//     methods: {
//         handleClick(index) {
//             if (this.preventrepeatclick) {
//                 if (this.selectedIndex === index) {
//                     return;
//                 }
//             }

//             this.selectedIndex = index;
//             this.$emit('input', this.source[index][this.valuekey]);
//             this.$emit('change', this.source[index]);

//         },
//     },
//     template: `
//     <div  :class="wrapclass">
//         <div v-for="(item, index) in source"
//         :key="index"
//         class="btn-group-item"
//         :class="[selectedIndex === index ? 'btn-group-item-active' :'btn-group-item-normal']"
//         @click="handleClick(index)"
//         >
//         <slot name="button" :option="item">{{ item[namekey] }}</slot>
//         </div>
//     </div>
//     `
// })
Vue.component("buttons", {
    props: {
        value: {
            type: String,
            default: '',
        },
        source: {
            type: Array,
            default: () => [],
            required: true,
        },
        namekey: {
            type: String,
            default: 'name',
        },
        valuekey: {
            type: String,
            default: 'value',
        },
        wrapclass: {
            type: String,
            default: 'btn-group-wrapper',
        },
        preventrepeatclick: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            currentValue: ""
        };
    },
    created() {
        this.currentValue = this.value;
    },
    mounted() {
    },
    computed: {
    },
    watch: {

    },

    methods: {
        handleClick(option) {
            if (this.preventrepeatclick && option[this.valuekey] === this.value) {
                return;
            }
            this.currentValue = option[this.valuekey];
            this.$emit('input', this.currentValue);
            this.$emit('change', this.currentValue, option);
        },
    },
    template: `
    <div :class="wrapclass">
        <div v-for="(item, index) in source"
            :key="index"
            class="btn-group-item"
            :class="[item[valuekey] === currentValue ? 'btn-group-item-active' : 'btn-group-item-normal']"
            @click="handleClick(item)"
        >
            <slot name="button" :option="item">{{ item[namekey] }}</slot>
        </div>
    </div>
    `
});