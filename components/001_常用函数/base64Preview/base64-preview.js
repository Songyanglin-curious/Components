class Base64Preview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._value = '';
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
            this.updatePreview(newValue);
        }
    }

    get value() {
        return this._value;
    }

    set value(newValue) {
        if (this.isValidBase64(newValue)) {
            this._value = newValue;
            this.setAttribute('value', newValue);
            this.updatePreview(newValue);
        }
    }

    isValidBase64(str) {
        if (!str) return false;

        // 处理可能的data URI
        const base64Str = str.startsWith('data:image/') ? str.split(',')[1] || str : str;

        try {
            // 更严格的base64验证
            return /^[A-Za-z0-9+/]+={0,2}$/.test(base64Str) &&
                base64Str.length % 4 === 0 &&
                btoa(atob(base64Str)) === base64Str;
        } catch (e) {
            return false;
        }
    }

    updatePreview(base64) {
        // 确保DOM元素已加载
        if (!this.shadowRoot) return;

        const input = this.shadowRoot.querySelector('#base64-input');
    const preview = this.shadowRoot.querySelector('#preview');
    const error = this.shadowRoot.querySelector('#error');
    const copyFeedback = this.shadowRoot.querySelector('#copy-feedback');

    // 检查元素是否存在
    if (!input || !preview || !error || !copyFeedback) return;

        try {
            if (!base64) {
                input.value = '';
                preview.style.display = 'none';
                preview.removeAttribute('src');
                error.style.display = 'none';
                return;
            }

            // 添加base64前缀检查
            const isDataURI = base64.startsWith('data:image/');
            const cleanBase64 = isDataURI ? base64.split(',')[1] || base64 : base64;

            if (this.isValidBase64(cleanBase64)) {
                input.value = base64;
                preview.src = isDataURI ? base64 : `data:image/png;base64,${cleanBase64}`;
                preview.style.display = 'block';
                error.style.display = 'none';
            } else {
                input.value = base64;
                preview.style.display = 'none';
                preview.removeAttribute('src');
                error.style.display = 'block';
                error.textContent = '无效的Base64图片字符串';
            }
        } catch (e) {
            console.error('更新预览时出错:', e);
            if (error) {
                error.style.display = 'block';
                error.textContent = '处理图片时发生错误';
            }
        }
    }

  setupEventListeners() {
    const input = this.shadowRoot.querySelector('#base64-input');

    const handleInputChange = (e) => {
      const value = e.target.value;
      this.value = value;
      // 确保预览区域同步更新
      this.updatePreview(value);
    };

    input.addEventListener('input', handleInputChange);
    input.addEventListener('change', handleInputChange);

        // 点击图片复制功能
        preview.addEventListener('click', () => {
          if (preview.style.display === 'block') {
            navigator.clipboard.writeText(input.value)
              .then(() => {
                copyFeedback.style.opacity = 1;
                setTimeout(() => {
                  copyFeedback.style.opacity = 0;
                }, 2000);
              })
              .catch(err => {
                error.style.display = 'block';
                error.textContent = '复制失败: ' + err.message;
              });
          }
        });

        input.addEventListener('search', () => {
          if (input.value === '') {
            this.value = '';
            // 明确清空预览
            if (preview) {
              preview.style.display = 'none';
              preview.removeAttribute('src');
            }
            if (error) {
              error.style.display = 'none';
            }
          }
        });
  }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
          max-width: 600px;
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
        
        input[type="search"] {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }
        
        /* 自定义清除按钮样式 */
        input[type="search"]::-webkit-search-cancel-button {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>') no-repeat center;
          cursor: pointer;
        }
        
        input[type="search"]::-webkit-search-cancel-button:hover {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23333"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>');
        }
        
        #preview {
          max-width: 100%;
          max-height: 300px;
          display: none;
          margin-top: 15px;
          border: 1px solid #eee;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        #preview:hover {
          box-shadow: 0 0 8px rgba(0,0,0,0.1);
        }
        
        #error {
          color: red;
          margin-top: 10px;
          display: none;
        }
        
        .copy-feedback {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 1000;
        }
      </style>
      
      <div class="input-group">
        <label for="base64-input">Base64 Image String:</label>
        <input type="search" id="base64-input" placeholder="请输入Base64图片字符串"></input>
      </div>
      
      <img id="preview" alt="Image preview" title="点击复制图片">
      <div id="error"></div>
      <div class="copy-feedback" id="copy-feedback">复制成功!</div>
    `;
    }
}

customElements.define('base64-preview', Base64Preview);
