import { LitElement, html, css, unsafeCSS } from 'lit-element';

/**
 * `capture-image`
 * CaptureImage
 *
 * @customElement
 * @polymer
 * @litElement
 * @demo demo/index.html
 */

export default class CaptureImage extends LitElement {
  static get is() {
    return 'capture-image';
  }

  static get properties() {
    return {
      sizeX: { type: Number },
      sizeY: { type: Number },
      maskpercent: { type: Number },
      mask: { type: Boolean }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      #container { position:absolute;  }
      #results {
        margin-top:20px;
        position:absolute;
      }
      #canvas{
        position:absolute;
      } 
      #mask {
        position:absolute;
        top:0;
        left:0;
        width:${unsafeCSS(this.sizeX)}px;
        height:${unsafeCSS(this.sizeY)}px;
      }
      #mirror {
        position:absolute;
      }
      #botonera {
        display:flex;
        justify-content: center;
      }
      #botonera button {
        display: inline-block;
      }
      #save {
        visibility:hidden;
        -webkit-appearance: button;
        -moz-appearance: button;
        appearance: button;
        text-decoration:none;
        color: #000;
        font-size:0.8em;
        padding:4px 5px;
        font-family: Arial, Helvetica, sans-serif
      }
    `;
  }

  constructor() {
    super();
    this.sizeX = 640;
    this.sizeY = 480;
    this.mask = false;
    this.maskpercent = 30; // %
    this.masksizeX = 0;
    this.masksizeY = 0;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  firstUpdated() {
    this.canvas = this.renderRoot.querySelector('#canvas');
    this.context = this.canvas.getContext('2d');
    this.video = this.renderRoot.querySelector('#video');
    this.saveBtn = this.renderRoot.querySelector('#save');

    if (this.mask) {
      this.addMask();
    }

    this.canvas.width = this.sizeX - this.masksizeX * 2;
    this.canvas.height = this.sizeY - this.masksizeY * 2;
    this.mirror = this.renderRoot.querySelector('#mirror');

    this.main();
  }

  addMask() {
    this.mask = this.renderRoot.querySelector('#mask');
    this.maskCtx = this.mask.getContext('2d');
    this.masksizeX = this.sizeX * this.maskpercent / 200;
    this.masksizeY = this.sizeY * this.maskpercent / 200;
    this.maskCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.maskCtx.fillRect(0, 0, this.sizeX, this.masksizeY);
    this.maskCtx.fillRect(0, this.sizeY - this.masksizeY, this.sizeX, this.masksizeY);
    this.maskCtx.fillRect(0, this.masksizeY, this.masksizeX, this.sizeY - this.masksizeY * 2);
    this.maskCtx.fillRect(this.sizeX - this.masksizeX, this.masksizeY, this.masksizeX, this.sizeY - this.masksizeY * 2);
    this.shadowRoot.querySelector('#botonera').style.width = this.sizeX + 'px';
  }

  main() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        this.video.srcObject = stream;
        this.video.play();
      });
    }
  }

  snapImage() {
    let snapImage = this.video;
    this.context.drawImage(snapImage, this.sizeX * this.maskpercent / 200, this.sizeY * this.maskpercent / 200, this.sizeX - (this.sizeX * this.maskpercent / 200) * 2, this.sizeY - (this.sizeY * this.maskpercent / 200) * 2, 0, 0, this.sizeX - (this.sizeX * this.maskpercent / 200) * 2, this.sizeY - (this.sizeY * this.maskpercent / 200) * 2);
    this.saveBtn.style.visibility = 'visible';
    this.canvas.style.left = (this.sizeX / 2 - this.canvas.width / 2) + 'px';
    this.canvas.style.top = (this.sizeY / 2 - this.canvas.height / 2) + 'px';
  }

  resetImage() {
    this.context.clearRect(0, 0, this.sizeX, this.sizeY);
  }

  saveImage() {
    let dataURL = this.canvas.toDataURL('image/png');
    let d = new Date();
    let now = '' + d.getYear() + d.getMonth() + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds();
    this.saveBtn.download = 'snapBtn' + now;
    this.saveBtn.href = dataURL;
  }

  render() {
    return html`
      <div id="botonera">
        <button id="snapBtn" @click="${this.snapImage}">Snap Photo</button>
        <button id="resetBtn" @click="${this.resetImage}">Reset Capture</button>
        <a href="#" id="save" @click="${this.saveImage}" download>Save Photo</a>
      </div>
      <div id="container">
        <video id="video" width="${this.sizeX}" height="${this.sizeY}" autoplay></video>
        <canvas id="mask" width="${this.sizeX}" height="${this.sizeY}"></canvas>
        <canvas id="canvas" width="${this.sizeX}" height="${this.sizeY}"></canvas>
      </div>
    `;
  }
}

window.customElements.define(CaptureImage.is, CaptureImage);