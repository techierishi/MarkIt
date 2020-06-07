import { Util } from "./utils/util";

export const decEncWebComp = (function () {
    class EncTag extends HTMLElement {
        encrBttn: any;
        encrData: any;
        encrMode: any;
        shadow: any;
        _data: any;
        _isEnc: boolean;
        evt_window: any;
        constructor() {
            super();
            const _innerHTML = `
            <style>
            *:focus {
                outline:none !important
            }
            .encr-container {
                display: flex;
                justify-content: space-between;
                padding: 10px 25px;
                border: 1px solid #DDD;
                border-radius: 5px;
                margin: 10px 0;
            }
            .encr-bttn {
                background: #2b8fff;
                color: #FFF;
                padding: 10px;
                border-radius: 5px;
                border: none;
                box-shadow: 1px 1px 5px #cecece;
            }
            .encr-data{
                display: table;
                height: 30px;
            }
            .encr-data-span {
                display: table-cell;
                vertical-align: middle;
            }

            .encr-data-mode{
                display:none;
            }
            </style>
            <div class="encr-container">
                <div class="encr-data"> 
                <span class="encr-data-span" >${this._data}</span> 
                <span class="encr-data-mode" >${this._isEnc}</span> 
                </div>
                <button class="encr-bttn"> ${(this._isEnc)? "Decrypt" : "Encrypt"} </button>
            </div>`;

            const that: any = this;
            this.shadow = that.attachShadow({ mode: 'open' });
            this.shadow.innerHTML = _innerHTML;

            this.encrBttn = that.shadowRoot.querySelector(".encr-bttn");
            this.encrData = that.shadowRoot.querySelector(".encr-data-span");
            this.encrMode = that.shadowRoot.querySelector(".encr-data-mode");
            this.encrBttn.addEventListener("click", this.handleClick);
           
        }
        
        static get observedAttributes() {
            return ['data'];
        }
        attributeChangedCallback(attrName: any, oldValue: any, newValue: any) {
            const dataAndMode = newValue.split("|");
            console.log("attributeChangedCallback",dataAndMode);

            const _encData = Util.isSet(()=>dataAndMode[0],"");
            let _encMode = Util.isSet(()=>dataAndMode[1],"false");
            console.log("_encData,_encMode",_encData,_encMode);

            _encMode = (/true/i).test(_encMode);
            
            this.encrData.innerText = _encData;
            this.encrMode.innerText = _encMode;
            this.encrBttn.innerText = `${(_encMode)? "Decrypt" : "Encrypt"}`;

            switch (attrName) {
                case 'data':
                    this._data = _encData;
                    this._isEnc = _encMode;
                    if (this.encrData) {
                        this.encrData.innerHTML = `${this._data}`;
                    }
                    break;
            }
        }
        get data() {
            return this._data;
        }
        set data(newValue: any | null | undefined) {
            this.setAttribute('data', newValue);
        }
       
        handleClick(e: any) {
            const _ldata = Util.isSet(() => e.target.parentNode.querySelector(".encr-data-span").innerHTML, "");
            let _lisEnc = Util.isSet(() => e.target.parentNode.querySelector(".encr-data-mode").innerHTML, "");
            _lisEnc = (/true/i).test(_lisEnc);

            const event = new CustomEvent("decenc", {
                bubbles: true,
                composed: true,
                detail: { data: _ldata, mode: _lisEnc},
            });
            window.dispatchEvent(event);
        }
    }
    window.customElements.define('enc-tag', EncTag);
})