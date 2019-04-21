import { LitElement, html, css } from 'lit-element';

/**
 * `capture-image`
 * CaptureImage
 *
 * @customElement
 * @polymer
 * @litElement
 * @demo demo/index.html
 */

 class CaptureImage extends LitElement {
  static get is() { return 'capture-image'; }

  static get properties() {
    return {
      sizeX: { type: Number },
      sizeY: { type: Number },
      maskpercent: { type: Number },
      mask: { type: Boolean }
    };
  }

  static get styles(){
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

    if (this.mask) { this.addMask(); }

    this.canvas.width = 640 - this.masksizeX*2;
    this.canvas.height = 480 - this.masksizeY*2;
    this.mirror = this.renderRoot.querySelector('#mirror');
    //this.mirror.width = this.canvas.width;
    //this.mirror.height = this.canvas.height;

    this.main();
  }

  addMask() {
    this.mask = this.renderRoot.querySelector('#mask');
    this.maskCtx = this.mask.getContext('2d');
    this.masksizeX = this.sizeX * this.maskpercent/200;
    this.masksizeY = this.sizeY * this.maskpercent/200;
    this.maskCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.maskCtx.fillRect(0, 0, this.sizeX, this.masksizeY);
    this.maskCtx.fillRect(0, this.sizeY-this.masksizeY, this.sizeX, this.masksizeY);
    this.maskCtx.fillRect(0, this.masksizeY, this.masksizeX, this.sizeY-this.masksizeY*2);
    this.maskCtx.fillRect(this.sizeX-this.masksizeX, this.masksizeY, this.masksizeX, this.sizeY-this.masksizeY*2);
  }

  main() {
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        this.video.srcObject = stream;
        this.video.play();
      });
    }
  }

  snapImage() {
    let snapImage = this.video;
    this.context.drawImage(snapImage, 640 * this.maskpercent/200, 480 * this.maskpercent/200, 640-(640 * this.maskpercent/200) * 2, 480-(480* this.maskpercent/200)*2, 0, 0, 640-(640 * this.maskpercent/200)*2, 480-(480 * this.maskpercent/200)*2);
    //this.context.drawImage(snapImage, this.masksizeX, this.masksizeY, this.sizeX-this.masksizeX*2, this.sizeY-this.masksizeY*2, 0, 0, this.sizeX-this.masksizeX*2, this.sizeY-this.masksizeY*2);
    this.saveBtn.style.visibility = "visible";
  }

  saveImage() {
    let dataURL = this.canvas.toDataURL('image/png');
    let d = new Date();
    let now = "" + d.getYear() + d.getMonth() + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds(); 
    this.saveBtn.download = "snap"+ now;
    this.saveBtn.href = dataURL;
  }

  render() {
    return html`
      <style>
        #mask {
          width:${this.sizeX}px;
          height:${this.sizeY}px;
          position:absolute;
          top:0;
        }
      </style>
      <div id="botonera">
        <button id="snap" @click="${this.snapImage}">Snap Photo</button>
        <a href="#" id="save" @click="${this.saveImage}" download>Save Photo</a>
      </div>
      <div id="container">
        <video id="video" width="${this.sizeX}" height="${this.sizeY}" autoplay></video>
        <canvas id="mask" width="${this.sizeX}" height="${this.sizeY}"></canvas>
        <canvas id="canvas" width="${this.sizeX}" height="${this.sizeY}"></canvas>
        <!--<img src="" id="mirror" class="canvas__mirror" style="display:none"/>-->
      </div>
      
    `;
  }
}

window.customElements.define(CaptureImage.is, CaptureImage);