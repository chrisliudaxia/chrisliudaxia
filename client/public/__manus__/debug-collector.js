(()=>{"use strict";const e=t=>{const e=document.createElement("script");return e.src=t,e.type="text/javascript",e.async=!0,e};window.manusFrameBridge={sendToManus:function(t){window.parent.postMessage(Object.assign({source:"manus-iframe"},t),"*")}},window.ManusDebugCollector=class{constructor(){this._consoleLogBackup=window.console.log,this._consoleWarnBackup=window.console.warn,this._consoleErrorBackup=window.console.error,this.logs=[],this.errors=[],window.addEventListener("error",e=>{this.errors.push({message:e.message,stack:e.error?.stack,type:"error",source:"window.onerror",timestamp:(new Date).toISOString()})}),window.addEventListener("unhandledrejection",e=>{this.errors.push({message:e.reason instanceof Error?e.reason.message:String(e.reason),stack:e.reason instanceof Error?e.reason.stack:void 0,type:"error",source:"unhandledrejection",timestamp:(new Date).toISOString()})}),window.console.log=(...e)=>{const t=e.map(e=>"string"==typeof e?e:JSON.stringify(e)).join(" ");this.logs.push({message:t,type:"log",timestamp:(new Date).toISOString()}),this._consoleLogBackup.apply(window.console,e)},window.console.warn=(...e)=>{const t=e.map(e=>"string"==typeof e?e:JSON.stringify(e)).join(" ");this.logs.push({message:t,type:"warn",timestamp:(new Date).toISOString()}),this._consoleWarnBackup.apply(window.console,e)},window.console.error=(...e)=>{const t=e.map(e=>"string"==typeof e?e:JSON.stringify(e)).join(" ");this.errors.push({message:t,type:"error",timestamp:(new Date).toISOString()}),this._consoleErrorBackup.apply(window.console,e)}}start(){window.manusFrameBridge.sendToManus({type:"debugCollectorReady"})}getLogs(){return[...this.logs]}getErrors(){return[...this.errors]}destroy(){window.console.log=this._consoleLogBackup,window.console.warn=this._consoleWarnBackup,window.console.error=this._consoleErrorBackup}},window.ManusWebPageLoader=class{constructor(t){this.currentLoadId=null,this.container=t}loadUrl(t,s){if(this.currentLoadId=s,!(t=>{try{new URL(t)}catch{return!1}return!0})(t))throw new Error("Invalid URL");const o=new URL(t),n=("https://"===o.protocol?"https:"===window.location.protocol:"http:"===window.location.protocol)&&o.hostname===window.location.hostname&&o.port===window.location.port&&o.pathname===window.location.pathname&&o.search===window.location.search;if(n)window.location.replace(t);else{const s=document.createElement("iframe");s.style.width="100%",s.style.height="100%",s.style.border="none",s.title=`Content from ${o.hostname}`;const n=(()=>{let t=0;return()=>{if(0!==t)return t;return t=Date.now()+Math.floor(1e5*Math.random()),t}})();window.addEventListener("message",t=>{t.data?.source==="manus-iframe"&&t.data?.type==="iframeClick"&&t.data?.loadId===n&&this.currentLoadId===s&&window.manusFrameBridge.sendToManus({type:"webPageClick",loadId:s,x:t.data.x,y:t.data.y})});let i;t.startsWith("http://")||t.startsWith("https://")?i=URL.createObjectURL(new Blob([`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Proxy Browser</title>
                  <style>
                    html, body {
                      margin: 0;
                      padding: 0;
                      width: 100%;
                      height: 100%;
                      overflow: hidden;
                    }
                    iframe {
                      width: 100%;
                      height: 100%;
                      border: none;
                    }
                    .overlay {
                      position: fixed;
                      top: 0;
                      left: 0;
                      right: 0;
                      bottom: 0;
                      z-index: 9999;
                    }
                  </style>
                </head>
                <body>
                  <iframe src="${t}"></iframe>
                  <div class="overlay"></div>
                  <script>
                    const loadId = ${n};
                    document.querySelector('.overlay').addEventListener('click', function(e) {
                      parent.postMessage({
                        source: 'manus-iframe',
                        type: 'iframeClick',
                        loadId,
                        x: e.clientX,
                        y: e.clientY
                      }, '*');
                    });
                  <\/script>
                </body>
              </html>
            `],{type:"text/html"})):i=t,s.src=i,s.addEventListener("load",()=>{window.manusFrameBridge.sendToManus({type:"webPageLoadComplete",loadId:s,title:s.contentDocument?.title,url:t})}),s.addEventListener("error",e=>{window.manusFrameBridge.sendToManus({type:"webPageLoadError",loadId:s,error:e.toString()})}),this.container.innerHTML="",this.container.appendChild(s)}}loadHtml(t,e,s){if(this.currentLoadId=s,e){const s=document.createElement("base");s.href=e,t=t.replace(/<head>/i,`<head>${s.outerHTML}`)}const o=URL.createObjectURL(new Blob([t],{type:"text/html"})),n=document.createElement("iframe");n.style.width="100%",n.style.height="100%",n.style.border="none",n.src=o,this.container.innerHTML="",this.container.appendChild(n),n.onload=()=>{window.manusFrameBridge.sendToManus({type:"webPageLoadComplete",loadId:s,title:n.contentDocument?.title,url:e||"about:blank"})},n.onerror=e=>{window.manusFrameBridge.sendToManus({type:"webPageLoadError",loadId:s,error:e.toString()})}}};const t=document.currentScript?.getAttribute("data-manus-bootstrap");t&&document.head.appendChild(e(t))})();