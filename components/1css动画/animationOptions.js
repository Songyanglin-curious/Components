const animationOptions = [
    {
        label: "Fade In",
        cnLabel: "淡入",
        options: [
            { value: "fadeIn", en: "Fade In", cn: "淡入" },
            { value: "fadeInLeft", en: "Fade In Left", cn: "左淡入" },
            { value: "fadeInRight", en: "Fade In Right", cn: "右淡入" },
            { value: "fadeInTop", en: "Fade In Top", cn: "上淡入" },
            { value: "fadeInBottom", en: "Fade In Bottom", cn: "下淡入" }
        ]
    },
    {
        label: "Fade Out",
        cnLabel: "淡出",
        options: [
            { value: "fadeOut", en: "Fade Out", cn: "淡出" },
            { value: "fadeOutLeft", en: "Fade Out Left", cn: "左淡出" },
            { value: "fadeOutRight", en: "Fade Out Right", cn: "右淡出" },
            { value: "fadeOutTop", en: "Fade Out Top", cn: "上淡出" },
            { value: "fadeOutBottom", en: "Fade Out Bottom", cn: "下淡出" }
        ]
    },
    {
        label: "Move From",
        cnLabel: "移动自",
        options: [
            { value: "moveFromLeft", en: "Move From Left", cn: "自左移动" },
            { value: "moveFromRight", en: "Move From Right", cn: "自右移动" },
            { value: "moveFromTop", en: "Move From Top", cn: "自上移动" },
            { value: "moveFromBottom", en: "Move From Bottom", cn: "自下移动" }
        ]
    },
    {
        label: "Move Out",
        cnLabel: "移动至",
        options: [
            { value: "moveToLeft", en: "Move To Left", cn: "移动至左" },
            { value: "moveToRight", en: "Move To Right", cn: "移动至右" },
            { value: "moveToTop", en: "Move To Top", cn: "移动至上" },
            { value: "moveToBottom", en: "Move To Bottom", cn: "移动至下" }
        ]
    },
    {
        label: "Door",
        cnLabel: "门",
        options: [
            { value: "doorCloseFromLeft", en: "Door Close From Left", cn: "门从左关闭" },
            { value: "doorOpenFromRight", en: "Door Open From Right", cn: "门从右打开" },
            { value: "doorCloseFromRight", en: "Door Close From Right", cn: "门从右关闭" },
            { value: "doorOpenFromLeft", en: "Door Open From Left", cn: "门从左打开" }
        ]
    },
    {
        label: "Heartbeat",
        cnLabel: "心跳",
        options: [
            { value: "heartbeatSlow", en: "Heartbeat Slow", cn: "慢心跳" },
            { value: "heartbeatFast", en: "Heartbeat Fast", cn: "快速心跳" }
        ]
    },
    {
        label: "Hang On",
        cnLabel: "悬挂",
        options: [
            { value: "hangOnLeft", en: "Hang On Left", cn: "悬挂在左" },
            { value: "hangOnRight", en: "Hang On Right", cn: "悬挂在右" }
        ]
    },
    {
        label: "Hang And Drop",
        cnLabel: "悬挂并下落",
        options: [
            { value: "hangAndDropLeft", en: "Hang And Drop Left", cn: "从左悬挂并下落" },
            { value: "hangAndDropRight", en: "Hang And Drop Right", cn: "从右悬挂并下落" }
        ]
    },
    {
        label: "Shake",
        cnLabel: "抖动",
        options: [
            { value: "pulseShake", en: "Pulse Shake", cn: "脉冲抖动" },
            { value: "horizontalShake", en: "Horizontal Shake", cn: "水平抖动" },
            { value: "verticalShake", en: "Shake Vertical", cn: "垂直抖动" },
            { value: "madMax", en: "Mad Max", cn: "疯狂摇摆" },
            { value: "coolHorizontalShake", en: "Cool Horizontal Shake", cn: "酷炫水平抖动" },
            { value: "coolVerticalShake", en: "Cool Vertical Shake", cn: "酷炫垂直抖动" },
            { value: "quietMad", en: "Quiet Mad", cn: "安静的疯狂" },
            { value: "vibration", en: "Vibration", cn: "震动" }
        ]
    },
    {
        label: "Push Release From",
        cnLabel: "推放释放自",
        options: [
            { value: "pushReleaseFrom", en: "Push Release From", cn: "推放释放自某处" },
            { value: "pushReleaseFromLeft", en: "Push Release From Left", cn: "从左推放释放" },
            { value: "pushReleaseFromRight", en: "Push Release From Right", cn: "从右推放释放" },
            { value: "pushReleaseFromTop", en: "Push Release From Top", cn: "从顶部推放释放" },
            { value: "pushReleaseFromBottom", en: "Push Release From Bottom", cn: "从底部推放释放" }
        ]
    },
    {
        label: "Push Release To",
        cnLabel: "推放释放至",
        options: [
            { value: "pushReleaseTo", en: "Push Release To", cn: "推放释放至某处" },
            { value: "pushReleaseToLeft", en: "Push Release To Left", cn: "推放释放至左" },
            { value: "pushReleaseToRight", en: "Push Release To Right", cn: "推放释放至右" },
            { value: "pushReleaseToTop", en: "Push Release To Top", cn: "推放释放至顶部" },
            { value: "pushReleaseToBottom", en: "Push Release To Bottom", cn: "推放释放至底部" }
        ]
    },
    {
        label: "Flip X",
        cnLabel: "水平翻转",
        options: [
            { value: "flipX", en: "Flip X", cn: "水平翻转" },
            { value: "flipXZoomIn", en: "Flip X Zoom In", cn: "水平翻转放大进入" },
            { value: "flipXZoomOut", en: "Flip X Zoom Out", cn: "水平翻转缩小退出" }
        ]
    },
    {
        label: "Flip Y",
        cnLabel: "垂直翻转",
        options: [
            { value: "flipY", en: "Flip Y", cn: "垂直翻转" },
            { value: "flipYZoomIn", en: "Flip Y Zoom In", cn: "垂直翻转放大进入" },
            { value: "flipYZoomOut", en: "Flip Y Zoom Out", cn: "垂直翻转缩小退出" }
        ]
    },
    {
        label: "Skew",
        cnLabel: "扭曲",
        options: [
            { value: "skewLeft", en: "Skew Left", cn: "向左扭曲" },
            { value: "skewRight", en: "Skew Right", cn: "向右扭曲" },
            { value: "skewInLeft", en: "Skew In Left", cn: "向左扭曲进入" },
            { value: "skewInRight", en: "Skew In Right", cn: "向右扭曲进入" },
            { value: "skewOutLeft", en: "Skew Out Left", cn: "向左扭曲退出" },
            { value: "skewOutRight", en: "Skew Out Right", cn: "向右扭曲退出" }
        ]
    },
    {
        label: "Shock In",
        cnLabel: "震撼进入",
        options: [
            { value: "shockZoom", en: "Shock Zoom", cn: "震撼缩放" },
            { value: "shockInLeft", en: "Shock In Left", cn: "左侧震撼进入" },
            { value: "shockInRight", en: "Shock In Right", cn: "右侧震撼进入" },
            { value: "shockInTop", en: "Shock In Top", cn: "顶部震撼进入" },
            { value: "shockInBottom", en: "Shock In Bottom", cn: "底部震撼进入" }
        ]
    },
    {
        label: "Pull Push",
        cnLabel: "推拉",
        options: [
            { value: "pullRelease", en: "Pull Release", cn: "拉放" },
            { value: "pushRelease", en: "Push Release", cn: "推放" }
        ]
    },
    {
        label: "Swing",
        cnLabel: "摇摆",
        options: [
            { value: "swingInLeft", en: "Swing In Left", cn: "向左摇摆进入" },
            { value: "swingInRight", en: "Swing In Right", cn: "向右摇摆进入" },
            { value: "swingInTop", en: "Swing In Top", cn: "向上摇摆进入" },
            { value: "swingInBottom", en: "Swing In Bottom", cn: "向下摇摆进入" }
        ]
    },
    {
        label: "Elevate",
        cnLabel: "提升",
        options: [
            { value: "elevateLeft", en: "Elevate Left", cn: "左侧提升" },
            { value: "elevateRight", en: "Elevate Right", cn: "右侧提升" }
        ]
    },
    {
        label: "Roll From",
        cnLabel: "滚动自",
        options: [
            { value: "rollFromLeft", en: "Roll From Left", cn: "自左滚动" },
            { value: "rollFromRight", en: "Roll From Right", cn: "自右滚动" },
            { value: "rollFromTop", en: "Roll From Top", cn: "自上滚动" },
            { value: "rollFromBottom", en: "Roll From Bottom", cn: "自下滚动" }
        ]
    },
    {
        label: "Roll To",
        cnLabel: "滚动至",
        options: [
            { value: "rollToLeft", en: "Roll To Left", cn: "滚动至左" },
            { value: "rollToRight", en: "Roll To Right", cn: "滚动至右" },
            { value: "rollToTop", en: "Roll To Top", cn: "滚动至上" },
            { value: "rollToBottom", en: "Roll To Bottom", cn: "滚动至下" }
        ]
    },
    {
        label: "Rotation",
        cnLabel: "旋转",
        options: [
            { value: "rotate", en: "Rotate", cn: "旋转" },
            { value: "rotateX", en: "Rotate X", cn: "X轴旋转" },
            { value: "rotateXIn", en: "Rotate X In", cn: "X轴旋转进入" },
            { value: "rotateXOut", en: "Rotate X Out", cn: "X轴旋转退出" },
            { value: "rotateY", en: "Rotate Y", cn: "Y轴旋转" },
            { value: "rotateYIn", en: "Rotate Y In", cn: "Y轴旋转进入" },
            { value: "rotateYOut", en: "Rotate Y Out", cn: "Y轴旋转退出" }
        ]
    },
    {
        label: "Rotate In",
        cnLabel: "旋转进入",
        options: [
            { value: "rotateInLeft", en: "Rotate In Left", cn: "从左旋转进入" },
            { value: "rotateInRight", en: "Rotate In Right", cn: "从右旋转进入" },
            { value: "rotateInTop", en: "Rotate In Top", cn: "从上旋转进入" },
            { value: "rotateInBottom", en: "Rotate In Bottom", cn: "从下旋转进入" }
        ]
    },
    {
        label: "Rotate Out",
        cnLabel: "旋转退出",
        options: [
            { value: "rotateOutLeft", en: "Rotate Out Left", cn: "从左旋转退出" },
            { value: "rotateOutRight", en: "Rotate Out Right", cn: "从右旋转退出" },
            { value: "rotateOutTop", en: "Rotate Out Top", cn: "从上旋转退出" },
            { value: "rotateOutBottom", en: "Rotate Out Bottom", cn: "从下旋转退出" }
        ]
    },
    {
        label: "Spin To",
        cnLabel: "旋转至",
        options: [
            { value: "spinToLeft", en: "Spin To Left", cn: "旋转至左" },
            { value: "spinToRight", en: "Spin To Right", cn: "旋转至右" },
            { value: "spinToTop", en: "Spin To Top", cn: "旋转至上" },
            { value: "spinToBottom", en: "Spin To Bottom", cn: "旋转至下" }
        ]
    },
    {
        label: "Spin From",
        cnLabel: "旋转自",
        options: [
            { value: "spinFromLeft", en: "Spin From Left", cn: "自左旋转" },
            { value: "spinFromRight", en: "Spin From Right", cn: "自右旋转" },
            { value: "spinFromTop", en: "Spin From Top", cn: "自上旋转" },
            { value: "spinFromBottom", en: "Spin From Bottom", cn: "自下旋转" }
        ]
    },
    {
        label: "Blur In",
        cnLabel: "模糊进入",
        options: [
            { value: "blurIn", en: "Blur In", cn: "模糊进入" },
            { value: "blurInLeft", en: "Blur In Left", cn: "从左模糊进入" },
            { value: "blurInRight", en: "Blur In Right", cn: "从右模糊进入" },
            { value: "blurInTop", en: "Blur In Top", cn: "从上模糊进入" },
            { value: "blurInBottom", en: "Blur In Bottom", cn: "从下模糊进入" }
        ]
    },
    {
        label: "Blur Out",
        cnLabel: "模糊退出",
        options: [
            { value: "blurOut", en: "Blur Out", cn: "模糊退出" },
            { value: "blurOutLeft", en: "Blur Out Left", cn: "从左模糊退出" },
            { value: "blurOutRight", en: "Blur Out Right", cn: "从右模糊退出" },
            { value: "blurOutTop", en: "Blur Out Top", cn: "从上模糊退出" },
            { value: "blurOutBottom", en: "Blur Out Bottom", cn: "从下模糊退出" }
        ]
    },
    {
        label: "Bounce",
        cnLabel: "弹跳",
        options: [
            { value: "bounceFromTop", en: "Bounce From Top", cn: "从顶部弹跳" },
            { value: "bounceFromDown", en: "Bounce From Down", cn: "从底部弹跳" },
            { value: "bounceX", en: "Bounce X", cn: "X轴弹跳" },
            { value: "bounceY", en: "Bounce Y", cn: "Y轴弹跳" },
            { value: "bounceZoomIn", en: "Bounce Zoom In", cn: "弹跳放大进入" },
            { value: "bounceZoomOut", en: "Bounce Zoom Out", cn: "弹跳缩小退出" }
        ]
    },
    {
        label: "Bounce In",
        cnLabel: "弹入",
        options: [
            { value: "bounceInTop", en: "Bounce In Top", cn: "从上弹入" },
            { value: "bounceInLeft", en: "Bounce In Left", cn: "从左弹入" },
            { value: "bounceInRight", en: "Bounce In Right", cn: "从右弹入" },
            { value: "bounceInBottom", en: "Bounce In Bottom", cn: "从下弹入" }
        ]
    },
    {
        label: "Bounce Out",
        cnLabel: "弹出",
        options: [
            { value: "bounceOutTop", en: "Bounce Out Top", cn: "从上弹出" },
            { value: "bounceOutLeft", en: "Bounce Out Left", cn: "从左弹出" },
            { value: "bounceOutRight", en: "Bounce Out Right", cn: "从右弹出" },
            { value: "bounceOutBottom", en: "Bounce Out Bottom", cn: "从下弹出" }
        ]
    },
    {
        label: "Perspective",
        cnLabel: "透视",
        options: [
            { value: "perspectiveToTop", en: "Perspective To Top", cn: "透视至上" },
            { value: "perspectiveToBottom", en: "Perspective To Bottom", cn: "透视至下" }
        ]
    },
    {
        label: "Zoom In",
        cnLabel: "放大进入",
        options: [
            { value: "zoomIn", en: "Zoom In", cn: "放大进入" },
            { value: "zoomInLeft", en: "Zoom In Left", cn: "左侧放大进入" },
            { value: "zoomInRight", en: "Zoom In Right", cn: "右侧放大进入" },
            { value: "zoomInTop", en: "Zoom In Top", cn: "顶部放大进入" },
            { value: "zoomInBottom", en: "Zoom In Bottom", cn: "底部放大进入" }
        ]
    },
    {
        label: "Zoom Out",
        cnLabel: "缩小退出",
        options: [
            { value: "zoomOut", en: "Zoom Out", cn: "缩小退出" },
            { value: "zoomOutLeft", en: "Zoom Out Left", cn: "左侧缩小退出" },
            { value: "zoomOutRight", en: "Zoom Out Right", cn: "右侧缩小退出" },
            { value: "zoomOutTop", en: "Zoom Out Top", cn: "顶部缩小退出" },
            { value: "zoomOutBottom", en: "Zoom Out Bottom", cn: "底部缩小退出" }
        ]
    },

    // {
    //     label: "Scale And Zoom In",
    //     cnLabel: "缩放放大进入",
    //     options: [
    //         { value: "scaleZoomInLeft", en: "Scale And Zoom In Left", cn: "左侧缩放放大进入" },
    //         { value: "scaleZoomInRight", en: "Scale And Zoom In Right", cn: "右侧缩放放大进入" },
    //         { value: "scaleZoomInTop", en: "Scale And Zoom In Top", cn: "顶部缩放放大进入" },
    //         { value: "scaleZoomInBottom", en: "Scale And Zoom In Bottom", cn: "底部缩放放大进入" }
    //     ]
    // },
    // {
    //     label: "Scale And Zoom Out",
    //     cnLabel: "缩放缩小退出",
    //     options: [
    //         { value: "scaleZoomOutLeft", en: "Scale And Zoom Out Left", cn: "左侧缩放缩小退出" },
    //         { value: "scaleZoomOutRight", en: "Scale And Zoom Out Right", cn: "右侧缩放缩小退出" },
    //         { value: "scaleZoomOutTop", en: "Scale And Zoom Out Top", cn: "顶部缩放缩小退出" },
    //         { value: "scaleZoomOutBottom", en: "Scale And Zoom Out Bottom", cn: "底部缩放缩小退出" }
    //     ]
    // },
    {
        label: "Dance",
        cnLabel: "舞蹈",
        options: [
            { value: "danceTop", en: "Dance Top", cn: "顶部舞蹈" },
            { value: "danceMiddle", en: "Dance Middle", cn: "中部舞蹈" },
            { value: "danceBottom", en: "Dance Bottom", cn: "底部舞蹈" }
        ]
    },
    {
        label: "Striking",
        cnLabel: "节奏",
        options: [
            { value: "hu__hu__", en: "hu... hu...", cn: "呼... 呼..." },
            { value: "leSnake", en: "Snake", cn: "蛇" },
            { value: "lePeek", en: "Peek", cn: "偷看" },
            { value: "effect3d", en: "3D Effect", cn: "3D 效果" },
            { value: "leRainDrop", en: "Rain Drop", cn: "雨滴" },
            { value: "pepe", en: "Pe Pe", cn: "皮皮" },
            { value: "leWaterWave", en: "Water Wave", cn: "水波" },
            { value: "lightning", en: "Lightning", cn: "闪电" },
            { value: "leJoltZoom", en: "Jolt Zoom", cn: "震动缩放" },
            { value: "typing", en: "Typing", cn: "打字" },
            { value: "electricity", en: "Electricity", cn: "电流" },
            { value: "wipe", en: "Wipe", cn: "擦除" },
            { value: "open", en: "Open", cn: "打开" },
            { value: "leMagnify", en: "Magnify", cn: "放大" },
            { value: "leBeat", en: "Letter Beat", cn: "字母跳动" }
        ]
    },
    {
        label: "Letter Fade In",
        cnLabel: "字母淡入",
        options: [
            { value: "leFadeIn", en: "Fade In", cn: "淡入" },
            { value: "leFadeInLeft", en: "Fade In Left", cn: "左淡入" },
            { value: "leFadeInRight", en: "Fade In Right", cn: "右淡入" },
            { value: "leFadeInTop", en: "Fade In Top", cn: "上淡入" },
            { value: "leFadeInBottom", en: "Fade In Bottom", cn: "下淡入" }
        ]
    },
    {
        label: "Letter Fade Out",
        cnLabel: "字母淡出",
        options: [
            { value: "leFadeOut", en: "Fade Out", cn: "淡出" },
            { value: "leFadeOutLeft", en: "Fade Out Left", cn: "左淡出" },
            { value: "leFadeOutRight", en: "Fade Out Right", cn: "右淡出" },
            { value: "leFadeOutTop", en: "Fade Out Top", cn: "上淡出" },
            { value: "leFadeOutBottom", en: "Fade Out Bottom", cn: "下淡出" }
        ]
    },
    {
        label: "Moving Back",
        cnLabel: "向后移动",
        options: [
            { value: "leMovingBackFromRight", en: "Moving Back From Right", cn: "从右向后移动" },
            { value: "leMovingBackFromLeft", en: "Moving Back From Left", cn: "从左向后移动" }
        ]
    },
    {
        label: "Kick out",
        cnLabel: "踢出",
        options: [
            { value: "leKickOutFront", en: "Kick Out Front", cn: "从前踢出" },
            { value: "leKickOutBehind", en: "Kick Out Behind", cn: "从后踢出" }
        ]
    },
    {
        label: "Letter Skate",
        cnLabel: "字母滑行",
        options: [
            { value: "leSkateX", en: "Skate Left Right", cn: "左右滑行" },
            { value: "leSkateY", en: "Skate Top Bottom", cn: "上下滑行" },
            { value: "leSkateXY", en: "Skate Both", cn: "双向滑行" }
        ]
    },
    {
        label: "Letter Scale",
        cnLabel: "字母缩放",
        options: [
            { value: "leScaleXIn", en: "ScaleX In", cn: "X轴缩放进入" },
            { value: "leScaleXOut", en: "ScaleX Out", cn: "X轴缩放退出" },
            { value: "leScaleYIn", en: "ScaleY In", cn: "Y轴缩放进入" },
            { value: "leScaleYOut", en: "ScaleY Out", cn: "Y轴缩放退出" }
        ]
    },
    {
        label: "Letter Jump",
        cnLabel: "字母跳跃",
        options: [
            { value: "leJump", en: "Letter Jump", cn: "字母跳跃" }
        ]
    },
    {
        label: "Letter Abound",
        cnLabel: "字母环绕",
        options: [
            { value: "leAboundTop", en: "Abound Top", cn: "顶部环绕" },
            { value: "leAboundBottom", en: "Abound Bottom", cn: "底部环绕" },
            { value: "leAboundLeft", en: "Abound Left", cn: "左侧环绕" },
            { value: "leAboundRight", en: "Abound Right", cn: "右侧环绕" }
        ]
    },
    {
        label: "Letter Flying In",
        cnLabel: "字母飞入",
        options: [
            { value: "leFlyInTop", en: "Fly In Top", cn: "从上飞入" },
            { value: "leFlyInLeft", en: "Fly In Left", cn: "从左飞入" },
            { value: "leFlyInRight", en: "Fly In Right", cn: "从右飞入" },
            { value: "leFlyInBottom", en: "Fly In Bottom", cn: "从下飞入" }
        ]
    },
    {
        label: "Letter Flying Out",
        cnLabel: "字母飞出",
        options: [
            { value: "leFlyOutTop", en: "Fly Out Top", cn: "向上飞出" },
            { value: "leFlyOutLeft", en: "Fly Out Left", cn: "向左飞出" },
            { value: "leFlyOutRight", en: "Fly Out Right", cn: "向右飞出" },
            { value: "leFlyOutBottom", en: "Fly Out Bottom", cn: "向下飞出" }
        ]
    },
    {
        label: "Letter Door Open & Close",
        cnLabel: "字母门开合",
        options: [
            { value: "leDoorCloseLeft", en: "Door Close Left", cn: "门向左关闭" },
            { value: "leDoorOpenRight", en: "Door Open Right", cn: "门向右打开" },
            { value: "leDoorCloseRight", en: "Door Close Right", cn: "门向右关闭" },
            { value: "leDoorOpenLeft", en: "Door Open Left", cn: "门向左打开" }
        ]
    },
    {
        label: "Letter Hang And Drop",
        cnLabel: "字母悬挂下落",
        options: [
            { value: "leHangAndDropLeft", en: "Hang And Drop Left", cn: "左侧悬挂下落" },
            { value: "leHangAndDropRight", en: "Hang And Drop Right", cn: "右侧悬挂下落" }
        ]
    },
    {
        label: "Letter Shake",
        cnLabel: "字母摇动",
        options: [
            { value: "leRencontre", en: "Rencontre", cn: "偶遇摇动" },
            { value: "lePulseShake", en: "Pulse Shake", cn: "脉冲摇动" },
            { value: "leHorizontalShake", en: "Horizontal Shake", cn: "水平摇动" },
            { value: "leVerticalShake", en: "Shake Vertical", cn: "垂直摇动" },
            { value: "leMadMax", en: "Shake - Mad Max", cn: "疯狂摇动" },
            { value: "leHorizontalTremble", en: "Horizontal Tremble", cn: "水平颤动" },
            { value: "leVerticalTremble", en: "Vertical Tremble", cn: "垂直颤动" },
            { value: "leCrazyCool", en: "Crazy Cool", cn: "疯狂酷" },
            { value: "leVibration", en: "Vibration", cn: "振动" }
        ]
    },
    {
        label: "Letter Push Release",
        cnLabel: "字母推放",
        options: [
            { value: "lePushReleaseFrom", en: "Push Release From", cn: "由某处推放" },
            { value: "lePushReleaseFromLeft", en: "Push Release From Left", cn: "从左推放" },
            { value: "lePushReleaseFromTop", en: "Push Release From Top", cn: "从上推放" },
            { value: "lePushReleaseFromBottom", en: "Push Release From Bottom", cn: "从下推放" },
            { value: "lePushReleaseTo", en: "Push Release To", cn: "推放至某处" },
            { value: "lePushReleaseToTop", en: "Push Release To Top", cn: "推放至顶部" },
            { value: "lePushReleaseToBottom", en: "Push Release To Bottom", cn: "推放至底部" }
        ]
    },
    {
        label: "Letter Flip",
        cnLabel: "字母翻转",
        options: [
            { value: "leFlipInTop", en: "Flip In Top", cn: "顶部翻入" },
            { value: "leFlipOutTop", en: "Flip Out Top", cn: "顶部翻出" },
            { value: "leFlipInBottom", en: "Flip In Bottom", cn: "底部翻入" },
            { value: "leFlipOutBottom", en: "Flip Out Bottom", cn: "底部翻出" }
        ]
    },
    {
        label: "Letter Elevate",
        cnLabel: "字母提升",
        options: [
            { value: "leElevateLeft", en: "Elevate Left", cn: "左侧提升" },
            { value: "leElevateRight", en: "Elevate Right", cn: "右侧提升" }
        ]
    },
    {
        label: "Letter Roll From",
        cnLabel: "字母从某处滚动",
        options: [
            { value: "leRollFromLeft", en: "Roll From Left", cn: "从左滚动" },
            { value: "leRollFromRight", en: "Roll From Right", cn: "从右滚动" },
            { value: "leRollFromTop", en: "Roll From Top", cn: "从上滚动" },
            { value: "leRollFromBottom", en: "Roll From Bottom", cn: "从下滚动" }
        ]
    },
    {
        label: "Letter Roll To",
        cnLabel: "字母滚动至某处",
        options: [
            { value: "leRollToLeft", en: "Roll To Left", cn: "滚动至左" },
            { value: "leRollToRight", en: "Roll To Right", cn: "滚动至右" },
            { value: "leRollToTop", en: "Roll To Top", cn: "滚动至上" },
            { value: "leRollToBottom", en: "Roll To Bottom", cn: "滚动至下" }
        ]
    },
    {
        label: "Letter Rotate In skate",
        cnLabel: "字母旋转滑入",
        options: [
            { value: "leRotateSkateInRight", en: "Rotate Skate In Right", cn: "向右旋转滑入" },
            { value: "leRotateSkateInLeft", en: "Rotate Skate In Left", cn: "向左旋转滑入" },
            { value: "leRotateSkateInTop", en: "Rotate Skate In Top", cn: "向上旋转滑入" },
            { value: "leRotateSkateInBottom", en: "Rotate Skate In Bottom", cn: "向下旋转滑入" }
        ]
    },
    {
        label: "Letter Rotate Out skate",
        cnLabel: "字母旋转滑出",
        options: [
            { value: "leRotateSkateOutRight", en: "Rotate Skate Out Right", cn: "向右旋转滑出" },
            { value: "leRotateSkateOutLeft", en: "Rotate Skate Out Left", cn: "向左旋转滑出" },
            { value: "leRotateSkateOutTop", en: "Rotate Skate Out Top", cn: "向上旋转滑出" },
            { value: "leRotateSkateOutBottom", en: "Rotate Skate Out Bottom", cn: "向下旋转滑出" }
        ]
    },
    {
        label: "Letter Rotate Zoom",
        cnLabel: "字母旋转缩放",
        options: [
            { value: "leRotateXZoomIn", en: "Rotate X Zoom In", cn: "X轴旋转缩放进入" },
            { value: "leRotateXZoomOut", en: "Rotate X Zoom Out", cn: "X轴旋转缩放退出" },
            { value: "leRotateYZoomIn", en: "Rotate Y Zoom In", cn: "Y轴旋转缩放进入" },
            { value: "leRotateYZoomOut", en: "Rotate Y Zoom Out", cn: "Y轴旋转缩放退出" }
        ]
    },
    {
        label: "Letter Rotate",
        cnLabel: "字母旋转",
        options: [
            { value: "leRotateIn", en: "Rotate In", cn: "旋转进入" },
            { value: "leRotateOut", en: "Rotate Out", cn: "旋转退出" },
            { value: "leRotateInLeft", en: "Rotate In Left", cn: "向左旋转进入" },
            { value: "leRotateOutLeft", en: "Rotate Out Left", cn: "向左旋转退出" },
            { value: "leRotateInRight", en: "Rotate In Right", cn: "向右旋转进入" },
            { value: "leRotateOutRight", en: "Rotate Out Right", cn: "向右旋转退出" }
        ]
    },
    {
        label: "Letter Spin",
        cnLabel: "字母旋转",
        options: [
            { value: "leSpinInLeft", en: "Spin In Left", cn: "向左旋转进入" },
            { value: "leSpinInRight", en: "Spin In Right", cn: "向右旋转进入" },
            { value: "leSpinOutLeft", en: "Spin Out Left", cn: "向左旋转退出" },
            { value: "leSpinOutRight", en: "Spin Out Right", cn: "向右旋转退出" }
        ]
    },
    {
        label: "Letter Blur In",
        cnLabel: "字母模糊进入",
        options: [
            { value: "leBlurIn", en: "Blur In", cn: "模糊进入" },
            { value: "leBlurInRight", en: "Blur In Right", cn: "向右模糊进入" },
            { value: "leBlurInLeft", en: "Blur In Left", cn: "向左模糊进入" },
            { value: "leBlurInTop", en: "Blur In Top", cn: "向上模糊进入" },
            { value: "leBlurInBottom", en: "Blur In Bottom", cn: "向下模糊进入" }
        ]
    },
    {
        label: "Letter Blur Out",
        cnLabel: "字母模糊退出",
        options: [
            { value: "leBlurOut", en: "Blur Out", cn: "模糊退出" },
            { value: "leBlurOutRight", en: "Blur Out Right", cn: "向右模糊退出" },
            { value: "leBlurOutLeft", en: "Blur Out Left", cn: "向左模糊退出" },
            { value: "leBlurOutTop", en: "Blur Out Top", cn: "向上模糊退出" },
            { value: "leBlurOutBottom", en: "Blur Out Bottom", cn: "向下模糊退出" }
        ]
    },
    {
        label: "Letter Pop Up",
        cnLabel: "字母弹出",
        options: [
            { value: "lePopUp", en: "Pop Up", cn: "弹出" },
            { value: "lePopUpLeft", en: "Pop Up Left", cn: "向左弹出" },
            { value: "lePopUpRight", en: "Pop Up Right", cn: "向右弹出" }
        ]
    },
    {
        label: "Letter Popup Out",
        cnLabel: "字母弹出退出",
        options: [
            { value: "lePopOut", en: "Pop Out", cn: "弹出退出" },
            { value: "lePopOutLeft", en: "Pop Out Left", cn: "向左弹出退出" },
            { value: "lePopOutRight", en: "Pop Out Right", cn: "向右弹出退出" }
        ]
    },
    {
        label: "Letter Bouncing",
        cnLabel: "字母弹跳",
        options: [
            { value: "leBounceFromTop", en: "Bounce From Top", cn: "从顶部弹跳" },
            { value: "leBounceFromDown", en: "Bounce From Down", cn: "从底部弹跳" },
            { value: "leBounceY", en: "Bounce Y", cn: "Y轴弹跳" },
            { value: "leBounceZoomIn", en: "Bounce Zoom In", cn: "弹跳缩放进入" },
            { value: "leBounceZoomOut", en: "Bounce Zoom Out", cn: "弹跳缩放退出" }
        ]
    },
    {
        label: "Letter Perspective",
        cnLabel: "字母透视",
        options: [
            { value: "lePerspectiveOutTop", en: "Letter Perspective Out Top", cn: "字母透视退出顶部" },
            { value: "lePerspectiveOutBottom", en: "Letter Perspective Out Bottom", cn: "字母透视退出底部" }
        ]
    },
    {
        label: "Letter Zoom In",
        cnLabel: "字母放大进入",
        options: [
            { value: "leZoomIn", en: "Zoom In", cn: "放大进入" },
            { value: "leZoomInLeft", en: "Zoom In Left", cn: "向左放大进入" },
            { value: "leZoomInRight", en: "Zoom In Right", cn: "向右放大进入" },
            { value: "leZoomInTop", en: "ZoomIn Top", cn: "向上放大进入" },
            { value: "leZoomInBottom", en: "Zoom In Bottom", cn: "向下放大进入" }
        ]
    },
    {
        label: "Letter Zoom Out",
        cnLabel: "字母缩小退出",
        options: [
            { value: "leZoomOut", en: "Zoom Out", cn: "缩小退出" },
            { value: "leZoomOutLeft", en: "Zoom Out Left", cn: "向左缩小退出" },
            { value: "leZoomOutRight", en: "Zoom Out Right", cn: "向右缩小退出" },
            { value: "leZoomOutTop", en: "Zoom Out Top", cn: "向上缩小退出" },
            { value: "leZoomOutBottom", en: "Zoom Out Bottom", cn: "向下缩小退出" }
        ]
    },
    {
        label: "Letter Dance In",
        cnLabel: "字母舞动进入",
        options: [
            { value: "leDanceInTop", en: "Dance In Top", cn: "顶部舞动进入" },
            { value: "leDanceInMiddle", en: "Dance In Middle", cn: "中部舞动进入" },
            { value: "leDanceInBottom", en: "Dance In Bottom", cn: "底部舞动进入" }
        ]
    },
    {
        label: "Letter Dance Out",
        cnLabel: "字母舞动退出",
        options: [
            { value: "leDanceOutTop", en: "Dance Out Top", cn: "顶部舞动退出" },
            { value: "leDanceOutMiddle", en: "Dance Out Middle", cn: "中部舞动退出" },
            { value: "leDanceOutBottom", en: "Dance Out Bottom", cn: "底部舞动退出" }
        ]
    },
    {
        label: "One after One Fade",
        cnLabel: "一个接一个淡入淡出",
        options: [
            { value: "oaoFadeIn", en: "One after One Fade In", cn: "一个接一个淡入" },
            { value: "oaoFadeOut", en: "One after One Fade Out", cn: "一个接一个淡出" }
        ]
    },
    {
        label: "One after One Fly",
        cnLabel: "一个接一个飞入飞出",
        options: [
            { value: "oaoFlyIn", en: "One after One Fly In", cn: "一个接一个飞入" },
            { value: "oaoFlyOut", en: "One after One Fly Out", cn: "一个接一个飞出" }
        ]
    },
    {
        label: "One after One Rotate",
        cnLabel: "一个接一个旋转",
        options: [
            { value: "oaoRotateIn", en: "One after One Rotate In", cn: "一个接一个旋转进入" },
            { value: "oaoRotateOut", en: "One after One Rotate Out", cn: "一个接一个旋转退出" },
            { value: "oaoRotateXIn", en: "One after One Rotate X In", cn: "X轴一个接一个旋转进入" },
            { value: "oaoRotateXOut", en: "One after One Rotate X Out", cn: "X轴一个接一个旋转退出" },
            { value: "oaoRotateYIn", en: "One after One Rotate Y In", cn: "Y轴一个接一个旋转进入" },
            { value: "oaoRotateYOut", en: "One after One Rotate Y Out", cn: "Y轴一个接一个旋转退出" }
        ]
    }

];


