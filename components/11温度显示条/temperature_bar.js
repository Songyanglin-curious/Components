Vue.component("temperature-bar", {
    props: {
        min: {
            type: [Number, String],
            default: -40
        },
        max: {
            type: [Number, String],
            default: 40
        }
    },
    computed: {
        parsedValues() {
            const minVal = Math.max(-20, typeof this.min === 'string'
                ? parseFloat(this.min) : this.min)
            const maxVal = Math.min(40, typeof this.max === 'string'
                ? parseFloat(this.max) : this.max)
            return {
                start: Math.min(minVal, maxVal),
                end: Math.max(minVal, maxVal)
            }
        },
        maskStyle() {
            const start = ((this.parsedValues.start + 40) / 80) * 100
            const end = ((this.parsedValues.end + 40) / 80) * 100
            return { clipPath: `inset(0 ${100 - end}% 0 ${start}% round 50px)` };

        },
        rightMaskStyle() {

            return { left: `${end}%` }
        },
        formattedMin() {
            return Number.isInteger(this.parsedValues.start)
                ? this.parsedValues.start
                : this.parsedValues.start.toFixed(1)
        },
        formattedMax() {
            return Number.isInteger(this.parsedValues.end)
                ? this.parsedValues.end
                : this.parsedValues.end.toFixed(1)
        }
    },
    template: `
        <div class="temperature-container">
            <div class="gradient-background" :style="maskStyle"></div>
            <div class="temperature-label min-label">{{ formattedMin }}℃</div>
            <div class="temperature-label max-label">{{ formattedMax }}℃</div>
        </div>
    `
})