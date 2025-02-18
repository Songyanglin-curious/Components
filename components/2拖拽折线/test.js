Vue.component("testshow", {
    template: `
        <div>
            <div v-show="isShow" style="position:absolute;display: flex; ">show</div>
        </div>
        `,
    data: function () {
        return {
            isShow: false
        }
    }
})