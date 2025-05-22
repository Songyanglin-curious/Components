class ColorTransformer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._value = '#000000';
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    static get observedAttributes() {
        return ['value'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value' && oldValue !== newValue) {
            this._value = newValue;
            this.updateColor(newValue);
        }
    }

    get value() {
        return this._value;
    }

    set value(newValue) {
        if (this.isValidColor(newValue)) {
            this._value = newValue;
            this.setAttribute('value', newValue);
            this.updateColor(newValue);
        }
    }

    isValidColor(color) {
        if (!color) return false;
        
        // Hex color validation
        const hexRegex = /^#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (hexRegex.test(color)) return true;
        
        // RGB/RGBA color validation
        const rgbRegex = /^rgb\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*\)$/i;
        const rgbaRegex = /^rgba\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(0|1|0?\.\d+)\s*\)$/i;
        
        return rgbRegex.test(color) || rgbaRegex.test(color);
    }

    parseColor(color) {
        if (!this.isValidColor(color)) return null;
        
        // Parse hex color
        if (color.startsWith('#')) {
            let hex = color.substring(1);
            let r, g, b, a = 1;
            
            // Expand shorthand hex
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            
            // Parse 6 or 8 digit hex
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
            
            // Parse alpha if present
            if (hex.length === 8) {
                a = parseInt(hex.substring(6, 8), 16) / 255;
                a = parseFloat(a.toFixed(2));
            }
            
            return { r, g, b, a, format: 'hex' };
        }
        
        // Parse rgb/rgba color
        const isRgba = color.startsWith('rgba(');
        const parts = color.match(/[\d\.%]+/g);
        
        if (!parts || (isRgba && parts.length < 4) || (!isRgba && parts.length < 3)) {
            return null;
        }
        
        const r = parseInt(parts[0]);
        const g = parseInt(parts[1]);
        const b = parseInt(parts[2]);
        const a = isRgba ? parseFloat(parts[3]) : 1;
        
        return { r, g, b, a, format: isRgba ? 'rgba' : 'rgb' };
    }

    formatColor(colorObj, format) {
        if (!colorObj) return '';
        
        const { r, g, b, a } = colorObj;
        
        switch (format) {
            case 'hex':
                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                // Only include alpha if not 1
                return a === 1 ? hex : hex + Math.round(a * 255).toString(16).padStart(2, '0');
                
            case 'rgb':
                return `rgb(${r}, ${g}, ${b})`;
                
            case 'rgba':
                return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
                
            default:
                return '';
        }
    }

    updateColor(color) {
        if (!this.isValidColor(color)) return;

        const input = this.shadowRoot.querySelector('#color-input');
        const colorPicker = this.shadowRoot.querySelector('#color-picker');
        const hexDisplay = this.shadowRoot.querySelector('#hex-value');
        const rgbDisplay = this.shadowRoot.querySelector('#rgb-value');
        const rgbaDisplay = this.shadowRoot.querySelector('#rgba-value');

        input.value = color;

        // Parse the input color
        const parsedColor = this.parseColor(color);
        if (!parsedColor) return;

        // Format to all supported formats
        const hex = this.formatColor(parsedColor, 'hex');
        const rgb = this.formatColor(parsedColor, 'rgb');
        const rgba = this.formatColor(parsedColor, 'rgba');

        // Update displays
        if (hex) {
            hexDisplay.textContent = hex;
            hexDisplay.style.backgroundColor = hex;
            // Color picker only supports 6-digit hex
            colorPicker.value = hex.length > 7 ? hex.substring(0, 7) : hex;
        }

        if (rgb) {
            rgbDisplay.textContent = rgb;
            rgbDisplay.style.backgroundColor = rgb;
        }

        if (rgba) {
            rgbaDisplay.textContent = rgba;
            rgbaDisplay.style.backgroundColor = rgba;
        }
    }

    setupEventListeners() {
        const input = this.shadowRoot.querySelector('#color-input');
        const colorPicker = this.shadowRoot.querySelector('#color-picker');
        const hexDisplay = this.shadowRoot.querySelector('#hex-value');
        const rgbDisplay = this.shadowRoot.querySelector('#rgb-value');
        const rgbaDisplay = this.shadowRoot.querySelector('#rgba-value');

        input.addEventListener('input', (e) => {
            if (this.isValidColor(e.target.value)) {
                this.value = e.target.value;
            }
        });

        colorPicker.addEventListener('input', (e) => {
            this.value = e.target.value;
        });

        [hexDisplay, rgbDisplay, rgbaDisplay].forEach(el => {
            el.addEventListener('click', () => {
                navigator.clipboard.writeText(el.textContent);
                const originalText = el.textContent;
                el.textContent = 'Copied!';
                setTimeout(() => {
                    el.textContent = originalText;
                }, 1000);
            });
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-radius: 8px;
        }
        
        .input-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        input[type="text"] {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }
        
        .color-display {
          display: flex;
          margin-top: 15px;
        }
        
        .color-box {
          flex: 1;
          padding: 10px;
          margin: 0 5px;
          text-align: center;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .color-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .color-box:active {
          transform: translateY(0);
        }
      </style>
      
      <div class="input-group">
        <label for="color-input">Color Input (hex/rgb/rgba):</label>
        <input type="text" id="color-input" value="${this._value}">
      </div>
      
      <div class="input-group">
        <label for="color-picker">Color Picker:</label>
        <input type="color" id="color-picker" value="#000000">
      </div>
      
      <div class="color-display">
        <div class="color-box" id="hex-value">#000000</div>
        <div class="color-box" id="rgb-value">rgb(0, 0, 0)</div>
        <div class="color-box" id="rgba-value">rgba(0, 0, 0, 1)</div>
      </div>
    `;
    }
}

customElements.define('color-transformer', ColorTransformer);
