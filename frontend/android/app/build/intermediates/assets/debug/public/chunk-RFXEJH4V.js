import{a as s,b as i,c as o,g as a}from"./chunk-DOYCLAS2.js";import"./chunk-JHI3MBHO.js";var n=':host{position:fixed;bottom:20px;left:0;right:0;display:-ms-flexbox;display:flex;opacity:0}:host(.in){-webkit-transition:opacity 300ms;transition:opacity 300ms;opacity:1}:host(.out){-webkit-transition:opacity 1s;transition:opacity 1s;opacity:0}.wrapper{-ms-flex:1;flex:1;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center}.toast{font-family:-apple-system, system-ui, "Helvetica Neue", Roboto, sans-serif;background-color:#eee;color:black;border-radius:5px;padding:10px 15px;font-size:14px;font-weight:500;-webkit-box-shadow:0px 1px 2px rgba(0, 0, 0, 0.20);box-shadow:0px 1px 2px rgba(0, 0, 0, 0.20)}',l=(()=>{let e=class{constructor(t){a(this,t),this.message=void 0,this.duration=2e3,this.closing=null}hostData(){let t={out:!!this.closing};return this.closing!==null&&(t.in=!this.closing),{class:t}}componentDidLoad(){setTimeout(()=>{this.closing=!1}),setTimeout(()=>{this.close()},this.duration)}close(){this.closing=!0,setTimeout(()=>{this.el.parentNode.removeChild(this.el)},1e3)}__stencil_render(){return s("div",{class:"wrapper"},s("div",{class:"toast"},this.message))}get el(){return o(this)}render(){return s(i,this.hostData(),this.__stencil_render())}};return e.style=n,e})();export{l as pwa_toast};
