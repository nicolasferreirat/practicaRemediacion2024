import{a as s,d as i,g as r}from"./chunk-DOYCLAS2.js";import{e as t}from"./chunk-JHI3MBHO.js";var c=":host{z-index:1000;position:fixed;top:0;left:0;width:100%;height:100%;display:-ms-flexbox;display:flex;contain:strict}.wrapper{-ms-flex:1;flex:1;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;background-color:rgba(0, 0, 0, 0.15)}.content{-webkit-box-shadow:0px 0px 5px rgba(0, 0, 0, 0.2);box-shadow:0px 0px 5px rgba(0, 0, 0, 0.2);width:600px;height:600px}",l=(()=>{let a=class{constructor(e){r(this,e),this.onPhoto=i(this,"onPhoto",7),this.noDeviceError=i(this,"noDeviceError",7),this.facingMode="user",this.hidePicker=!1}present(){return t(this,null,function*(){let e=document.createElement("pwa-camera-modal-instance");e.facingMode=this.facingMode,e.hidePicker=this.hidePicker,e.addEventListener("onPhoto",o=>t(this,null,function*(){if(!this._modal)return;let n=o.detail;this.onPhoto.emit(n)})),e.addEventListener("noDeviceError",o=>t(this,null,function*(){this.noDeviceError.emit(o)})),document.body.append(e),this._modal=e})}dismiss(){return t(this,null,function*(){this._modal&&(this._modal&&this._modal.parentNode.removeChild(this._modal),this._modal=null)})}render(){return s("div",null)}};return a.style=c,a})();export{l as pwa_camera_modal};
