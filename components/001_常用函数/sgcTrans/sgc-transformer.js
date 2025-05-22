

class SgcTransformer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._gdValue = '';
        this._nwValue = '';
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
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
          position: relative;
        }
        
        .input-group {
          margin-bottom: 15px;
          position: relative;
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
        
        .result {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        
        .result-title {
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .result-value {
          font-family: monospace;
          word-break: break-all;
          position: relative;
          padding: 8px;
          padding-right: 30px;
          border-radius: 4px;
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }

        .result-value:hover {
          background-color: #e9ecef;
        }

        .result-value:active {
          background-color: #dee2e6;
        }
        

        .copy-feedback {
          position: absolute;
          top: 5px;
          right: 5px;
          background: #4CAF50;
          color: white;
          padding: 3px 6px;
          border-radius: 2px;
          font-size: 14px;
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 1;
        }
      </style>
      
      <div class="input-group">
        <label for="gd-input">国调表名:</label>
        <input type="search" id="gd-input" placeholder="输入国调表名">
      </div>
      
      <div class="input-group">
        <label for="nw-input">南网表名:</label>
        <input type="search" id="nw-input" placeholder="输入南网表名">
      </div>
      
      <div class="result">
        <div class="result-title">转换结果:</div>
        <div class="result-value" id="result"></div>
      </div>
      <div class="copy-feedback" id="copy-feedback">复制成功!</div>
    `;
    }

    setupEventListeners() {
        const gdInput = this.shadowRoot.querySelector('#gd-input');
        const nwInput = this.shadowRoot.querySelector('#nw-input');
        const result = this.shadowRoot.querySelector('#result');
        const copyFeedback = this.shadowRoot.querySelector('#copy-feedback');

        // 点击结果区域复制
        result.addEventListener('click', () => {
            if (!result.textContent) return;

            const textToCopy = result.textContent.replace(/^(国调表名|南网表名):\s*/g, '');
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    copyFeedback.style.opacity = 1;
                    setTimeout(() => {
                        copyFeedback.style.opacity = 0;
                    }, 2000);
                })
                .catch(err => {
                    console.error('复制失败:', err);
                });
        });

        gdInput.addEventListener('input', (e) => {
            if (e.target.value) {
                nwInput.disabled = true;
                this._gdValue = e.target.value;
                const converted = convertTableName(this._gdValue);
                result.textContent = `南网表名: ${converted}`;
            } else {
                nwInput.disabled = false;
                result.textContent = '';
            }
        });

        nwInput.addEventListener('input', (e) => {
            if (e.target.value) {
                gdInput.disabled = true;
                this._nwValue = e.target.value;
                const converted = convertTableNameBack(this._nwValue);
                result.textContent = `国调表名: ${converted}`;
            } else {
                gdInput.disabled = false;
                result.textContent = '';
            }
        });

        // 监听搜索框清除事件
        gdInput.addEventListener('search', () => {
            if (gdInput.value === '') {
                nwInput.disabled = false;
                result.textContent = '';
            }
        });

        nwInput.addEventListener('search', () => {
            if (nwInput.value === '') {
                gdInput.disabled = false;
                result.textContent = '';
            }
        });
    }
}

customElements.define('sgc-transformer', SgcTransformer);
