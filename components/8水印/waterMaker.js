function canvasWaterMark({
    container = document.body,
    width = 300,
    height = 300,
    textAlign = 'center',
    textBaseline = 'middle',
    alpha = 0.3,
    font = '20px monaco, microsoft yahei',
    fillStyle = 'rgba(184, 184, 184, 0.8)',
    content = 'JumpServer',
    rotate = -45,
    zIndex = 1000
}) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    ctx.globalAlpha = 0.5;

    ctx.font = font;
    ctx.fillStyle = fillStyle;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.globalAlpha = alpha;

    ctx.translate(0.5 * width, 0.5 * height);
    ctx.rotate((rotate * Math.PI) / 180);

    function generateMultiLineText(_ctx, _text, _width, _lineHeight) {
        const words = _text.split('\n');
        let line = '';
        const x = 0;
        let y = 0;

        for (let n = 0; n < words.length; n++) {
            line = words[n];
            line = truncateCenter(line, 25);
            _ctx.fillText(line, x, y);
            y += _lineHeight;
        }
    }

    generateMultiLineText(ctx, content, width, 24);

    const base64Url = canvas.toDataURL();
    const watermarkDiv = document.createElement('div');
    watermarkDiv.setAttribute('style', `
            position:absolute;
            top:0;
            left:0;
            width:100%;
            height:100%;
            z-index:${zIndex};
            pointer-events:none;
            background-repeat:repeat;
            background-image:url('${base64Url}')`
    );

    container.style.position = 'relative';
    container.insertBefore(watermarkDiv, container.firstChild);
}

function truncateCenter(s, l) {
    if (s.length <= l) {
        return s;
    }
    const centerIndex = Math.ceil(l / 2);
    return s.slice(0, centerIndex - 2) + '...' + s.slice(centerIndex + 1, l);
}
