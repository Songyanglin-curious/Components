const navData = {
    "工具": {
        "常用网站": [
            { name: "GitHub", url: "https://github.com/" },
            { name: "掘金", url: "https://juejin.im/" },
            { name: "SegmentFault", url: "https://segmentfault.com/" },
            { name: "博客园", url: "https://www.cnblogs.com/" },
            { name: "HelloGithub", url: "https://hellogithub.com/" },
            { name: "StackOverflow", url: "https://stackoverflow.com/" },
            { name: "W3C官网", url: "https://www.w3.org/" },
            { name: "W3C中国", url: "https://www.chinaw3c.org/" },
            { name: "drawio", url: "https://www.drawio.com/" },
            { name: "CSS灵感", url: "https://csscoco.com/inspiration/#/./filter/filter-ball-loading" },
        ],
        "文档": [
            { name: "地图api文档", url: "http://10.15.5.204:8003/apihtml/api.html" },
            { name: "echarts", url: "https://echarts.apache.org/zh/index.html" },
            { name: "现代JavaScript教程", url: "https://zh.javascript.info/" },
            { name: "MDN", url: "https://developer.mozilla.org/zh-CN/" },
            { name: "用尚", url: "http://ysh.com/" },
            { name: "达梦文档", url: "https://eco.dameng.com/document/dm/zh-cn/sql-dev/" },
            { name: "金仓文档", url: "https://help.kingbase.com.cn/v8/development/sql-plsql/sql/index.html" },
            { name: "iview", url: "http://v4.iviewui.com/docs/introduce" },
            { name: "vue2", url: "https://v2.cn.vuejs.org/" },
            { name: "vue3", url: "https://cn.vuejs.org/" },
            { name: "华为DWS", url: "https://support.huaweicloud.com/sqlreference-910-dws/dws_06_0001.html" },
            { name: "Docker入门到实践", url: "https://vuepress.mirror.docker-practice.com/" },

        ],
        "工具": [
            { name: "重置 CSS", url: "https://meyerweb.com/eric/tools/css/reset/" },
            { name: "SVG路径编辑器", url: "https://yqnn.github.io/svg-path-editor/" },
            { name: "前端兼容性查询", url: "https://caniuse.com/" },
            { name: "算法可视化", url: "https://www.cs.usfca.edu/~galles/visualization/Algorithms.html" },
            { name: "loading动画", url: "https://css-loaders.com/progress/" },

        ],
        "AI": [
            { name: "chatgpt", url: "https://chat.openai.com/" },
            { name: "bing", url: "https://copilot.microsoft.com/?showconv=1&FORM=hpcodx&showconv=1" },
            { name: "bard", url: "https://bard.google.com/" },
            { name: "文心一言", url: "https://yiyan.baidu.com/" },
        ]
    },

    "国网": {
        "地理信息导航": [
            { "name": "本机", "url": "http://10.15.0.77:7022/?site=http://10.15.5.101:8009/yuntuhtml/globalmap.html&s=1" },
            { "name": "龙玥", "url": "http://10.15.0.77:7022/?site=http://10.15.5.187:8080/other/globalmap?name=globalmap-station&s=1" },
            { "name": "现场版本", "url": "http://10.15.0.77:7077/?site=http://10.15.5.101:8009/yuntuhtml/globalmap.html&s=1" },
        ]
    },
    "北京": {
        "首钢智慧平台": [
            { "name": "本机", "url": "http://10.15.0.77:7080" },
        ],
        "箱变车": [
            { "name": "本机", "url": "http://10.15.0.77:7082" },
        ]
    },
    "云南": {
        "灵活构图": [
            { "name": "本机", "url": "http://10.15.0.77:7051" },
            { "name": "虚拟机", "url": "http://192.168.12.250:8081/" },
            { "name": "进度", "url": "https://docs.qq.com/sheet/DZGJTUmJRdnhNR1R5?rtkey=0602655d68c3466a66179ff2flgYu1&tab=xxl6l9&_t=1751336334130&nlc=1&u=ce6fb436a514487aa8e849c415d31957" },
        ],
        "南网调控云": [
            { name: "单点登录维护网站", url: "http://192.168.12.39:8089" },
            { name: "调控云导航菜单", url: "http://192.168.12.39:8090" },
            { name: "南网调控云", url: "http://192.168.12.39:8086/" },
        ]
    },
    "四川": {
        "绵阳负荷分配": [
            { "name": "本机", "url": "http://10.15.0.77:7016/" },
            { "name": "虚拟机", "url": "http://192.168.6.227/" },
        ]
    },
    "陕西": {
        "地理信息导航": [
            { "name": "本机", "url": "http://10.15.0.77:7015/" },
            { "name": "虚拟机", "url": "http://10.17.0.232:8080/" },
        ],
        "一张图": [
            { "name": "本机", "url": "http://10.15.0.77:7015/?w=1" },
            { "name": "虚拟机", "url": "http://10.17.0.232:8080/?w=1" },
        ],
        "负荷统计": [
            { "name": "本机", "url": "http://10.15.0.77:7015/?w=2" },
            { "name": "虚拟机", "url": "http://10.17.0.244:8080/?w=2" },
        ],
    },
    "华北": {
        "华北生技": [
            { "name": "本机", "url": "http://10.15.0.77:7018/" }
        ]
    },
    "蒙东": {
        "地理信息导航": [
            { "name": "本机", "url": "http://10.15.0.77:7017/?site=http://10.15.5.101:8009/yuntuhtml/globalmap.html&s=1" }
        ]
    },
    "冀北": {
        "超高压": [
            { name: "本机", url: "http://10.15.0.77:7032/" },
            { name: "虚拟机", url: "http://192.168.2.177:8090/" },
        ]
    },
    "天津": {
        "地理信息导航": [
            { name: "本机", url: "http://10.15.0.77:7028/" }
        ]
    },
    "新疆": {
        "保供大屏": [
            { name: "本机", url: "http://10.15.0.77:7037/?bg=1" }
        ],
        "新能源大屏": [
            { name: "本机", url: "http://10.15.0.77:7037/?w=1" }
        ],
        "调度大屏": [
            { name: "本机", url: "http://10.15.0.77:7025/index-ppttest.html" }
        ],
    },
    "宁夏": {
        "银川大屏": [
            { name: "本机", url: "http://10.15.0.77:7054/?w=1" },
            { name: "虚拟机", url: "http://10.17.0.252:8082/?w=1" },
        ],
        "宁夏调度一张图": [
            { name: "虚拟机", url: "http://10.17.0.253:8065/?w=1" },
        ]
    },
    "内部": {
        "远程运维": [
            { name: "远程运维", url: "http://10.15.0.77:7019/" },
            { name: "兴义", url: "http://10.15.0.77:7055/" },
        ],
        "充电后台": [
            { name: "PC", url: "https://chrgmngr.yongshangtech.com/web/" },
            { name: "手机", url: " https://chrgmngr.yongshangtech.com/webm/" },
        ],
        "充电后台接口": [
            { name: "设计", url: "http://chrgmngr.yongshangtech.com:25009/backmngrdesign/" },
            { name: "云快充", url: "http://www.ykccn.com/OMP/" },
            { name: "登录认证", url: "https://chrgmngr.yongshangtech.com:5009/ssoevipscpmngr-swagger-api-doc/index.html" },
            { name: "读", url: "https://chrgmngr.yongshangtech.com:5009/revipscpmngr-swagger-api-doc/index.html" },
            { name: "写、清分", url: "https://chrgmngr.yongshangtech.com:5009/wevipscpmngr-swagger-api-doc/index.html" },
        ]
    }
}




