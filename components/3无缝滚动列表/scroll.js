// 定义一个名为 'seamless-scroll' 的 Vue 组件
Vue.component('seamless-scroll', {
    template: `
<div class="seamless-scroll">
<div ref="wrapperRef" class="seamless-scroll__wrapper" @mouseover="onMouseOver" @mouseout="onMouseOut" style="overflow: hidden; position: relative;">
  <div ref="boxRef"
        :class="{ 'seamless-scroll__box': true, 'seamless-scroll__box--odd': isChildNodesOdd, 'seamless-scroll__box--even': !isChildNodesOdd }">
    <div class="seamless-scroll__box-top" ref="topRef">
      <slot></slot>
    </div>
    <div v-if="showShadowDiv" class="seamless-scroll__box-bottom">
      <slot></slot>
    </div>
  </div>
</div>
</div>`,
    props: {
        duration: {
            type: Number,
            default: 2
        },
        delay: {
            type: Number,
            default: 1
        }
    },
    data() {
        return {
            wrapperRef: null,
            boxRef: null,
            topRef: null,
            wrapperHeight: 0,
            boxHeight: 0,
            topBoxHeight: 0,
            overHeight: 0,
            scrollingElIndex: 0,
            childNodesCount: 0,
            observer: null,
            isPaused: false,
            lastUpdateTime: 0
        };
    },
    computed: {
        // 计算属性，判断是否显示底部的影子 div
        showShadowDiv() {
            return this.boxHeight > this.wrapperHeight;
        },
        // 计算属性，判断子节点数量是否为奇数
        isChildNodesOdd() {
            return this.childNodesCount % 2 !== 0;
        }
    },
    watch: {
        // 监听 showShadowDiv 的变化，如果变化则更新滚动
        showShadowDiv(newVal) {
            if (newVal) {
                this.$nextTick(() => this.updateScroll());
            }
        }
    },
    methods: {
        // 更新滚动的方法
        updateScroll() {
            if (this.isPaused || !this.topRef || this.boxHeight <= this.wrapperHeight) return; // 添加判断条件

            // 添加时间间隔机制
            const currentTime = Date.now();
            if (currentTime - this.lastUpdateTime < (this.duration + this.delay) * 1000) {
                requestAnimationFrame(this.updateScroll);
                return;
            }
            this.lastUpdateTime = currentTime;

            const nodeArr = Array.from(this.topRef.childNodes).filter(t => t.nodeType === Node.ELEMENT_NODE);
            if (nodeArr.length === 0) return;

            const currentScrollingEl = nodeArr[this.scrollingElIndex];
            this.scrollingElIndex = (this.scrollingElIndex + 1) % nodeArr.length;

            if (!currentScrollingEl) return;

            const elHeight = currentScrollingEl.offsetHeight;
            const scrollTarget = currentScrollingEl.offsetTop + elHeight;

            if (scrollTarget >= this.overHeight) {
                this.boxRef.style.transform = `translateY(-${scrollTarget}px)`;
                requestAnimationFrame(this.updateScroll);
                setTimeout(() => {
                    this.boxRef.style.transition = 'none';
                    this.boxRef.style.transform = 'translateY(0)';
                    this.scrollingElIndex = 0;
                    requestAnimationFrame(this.updateScroll);
                }, 500);
            } else {
                this.boxRef.style.transition = 'transform 0.5s ease';
                this.boxRef.style.transform = `translateY(-${scrollTarget}px)`;
                requestAnimationFrame(this.updateScroll);
            }
        }
        ,
        // 鼠标悬停时暂停滚动
        onMouseOver() {
            this.isPaused = true;
        },
        // 鼠标移出时恢复滚动
        onMouseOut() {
            this.isPaused = false;
            requestAnimationFrame(this.updateScroll);
        },
        // 刷新子节点数量的方法
        refreshChildNodesCount() {
            if (!this.topRef) return;
            this.childNodesCount = Array.from(this.topRef.childNodes).filter(t => t.nodeType === Node.ELEMENT_NODE).length;
        },
        refresh: function () {
            // 组件挂载时初始化相关引用和属性
            this.wrapperRef = this.$refs.wrapperRef;
            this.boxRef = this.$refs.boxRef;
            this.topRef = this.$refs.topRef;
            this.wrapperHeight = this.wrapperRef.clientHeight;
            this.boxHeight = this.boxRef.clientHeight;
            this.topBoxHeight = this.topRef.clientHeight;

            const nodeArr = Array.from(this.topRef.childNodes).filter(t => t.nodeType === Node.ELEMENT_NODE);
            var lastNode = nodeArr[nodeArr.length - 1];
            if (lastNode) {
                this.overHeight = this.topBoxHeight - lastNode.offsetHeight + 10;
            } else {
                this.overHeight = this.topBoxHeight;
            }
            this.refreshChildNodesCount();

            this.observer = new MutationObserver(() => {
                this.refreshChildNodesCount();
                this.$nextTick(() => this.updateScroll());
            });

            this.observer.observe(this.topRef, {
                childList: true,
            });

            this.$nextTick(() => {
                requestAnimationFrame(this.updateScroll);
            });
        },
        observeDomChanges() {
            const targetNode = this.$refs.topRef; // 观察 topRef 引用的 DOM 元素

            // 配置观察选项
            const config = {
                childList: true,     // 监听子节点的变化
                attributes: true,    // 监听属性的变化
                subtree: true        // 监听所有后代节点的变化
            };

            // 定义回调函数，当观察到变更时执行
            const callback = (mutationsList) => {
                console.log('DOM 变更');
                this.refresh();
            };

            // 创建观察者实例并传入回调函数
            this.observer = new MutationObserver(callback);

            // 开始观察
            this.observer.observe(targetNode, config);
        },
    },
    mounted() {
        this.refresh();
        this.observeDomChanges();
    },
    beforeDestroy() {
        // 组件销毁前断开观察者连接
        if (this.observer) {
            this.observer.disconnect();
        }
    }
});