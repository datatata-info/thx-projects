(function(e){e.ng??={},e.ng.common??={},e.ng.common.locales??={};let t=void 0;function a(n){let c=n,l=Math.floor(Math.abs(n)),_=n.toString().replace(/^[^.]*\.?/,"").length;return l===1&&_===0?1:l===Math.floor(l)&&l>=2&&l<=4&&_===0?3:_!==0?4:5;}e.ng.common.locales.cs=["cs",[["dop.","odp."],t,t],t,[["N","P","\xDA","S","\u010C","P","S"],["ne","po","\xFAt","st","\u010Dt","p\xE1","so"],["ned\u011Ble","pond\u011Bl\xED","\xFAter\xFD","st\u0159eda","\u010Dtvrtek","p\xE1tek","sobota"],["ne","po","\xFAt","st","\u010Dt","p\xE1","so"]],t,[["1","2","3","4","5","6","7","8","9","10","11","12"],["led","\xFAno","b\u0159e","dub","kv\u011B","\u010Dvn","\u010Dvc","srp","z\xE1\u0159","\u0159\xEDj","lis","pro"],["ledna","\xFAnora","b\u0159ezna","dubna","kv\u011Btna","\u010Dervna","\u010Dervence","srpna","z\xE1\u0159\xED","\u0159\xEDjna","listopadu","prosince"]],[["1","2","3","4","5","6","7","8","9","10","11","12"],["led","\xFAno","b\u0159e","dub","kv\u011B","\u010Dvn","\u010Dvc","srp","z\xE1\u0159","\u0159\xEDj","lis","pro"],["leden","\xFAnor","b\u0159ezen","duben","kv\u011Bten","\u010Derven","\u010Dervenec","srpen","z\xE1\u0159\xED","\u0159\xEDjen","listopad","prosinec"]],[["p\u0159.n.l.","n.l."],["p\u0159. n. l.","n. l."],["p\u0159ed na\u0161\xEDm letopo\u010Dtem","na\u0161eho letopo\u010Dtu"]],1,[6,0],["dd.MM.yy","d. M. y","d. MMMM y","EEEE d. MMMM y"],["H:mm","H:mm:ss","H:mm:ss z","H:mm:ss zzzz"],["{1} {0}",t,t,t],[",","\xA0",";","%","+","-","E","\xD7","\u2030","\u221E","NaN",":"],["#,##0.###","#,##0\xA0%","#,##0.00\xA0\xA4","#E0"],"CZK","K\u010D","\u010Desk\xE1 koruna",{AUD:["AU$","$"],BYN:[t,"\u0440."],CSK:["K\u010Ds"],CZK:["K\u010D"],ILS:[t,"\u20AA"],INR:[t,"\u20B9"],JPY:["JP\xA5","\xA5"],PHP:[t,"\u20B1"],RON:[t,"L"],RUR:[t,"\u0440."],TWD:["NT$"],USD:["US$","$"],VND:[t,"\u20AB"],XEU:["ECU"],XXX:[]},"ltr",a,[[["p\u016Fl.","pol.","r.","d.","o.","v.","n."],["p\u016Fln.","pol.","r.","dop.","odp.","ve\u010D.","v n."],["p\u016Flnoc","poledne","r\xE1no","dopoledne","odpoledne","ve\u010Der","v noci"]],[["p\u016Fl.","pol.","r\xE1no","dop.","odp.","ve\u010D.","noc"],["p\u016Flnoc","poledne","r\xE1no","dopoledne","odpoledne","ve\u010Der","noc"],t],["00:00","12:00",["04:00","09:00"],["09:00","12:00"],["12:00","18:00"],["18:00","22:00"],["22:00","04:00"]]]];})(globalThis);var ae=globalThis;function ee(e){return(ae.__Zone_symbol_prefix||"__zone_symbol__")+e;}function dt(){let e=ae.performance;function t(j){e&&e.mark&&e.mark(j);}function a(j,i){e&&e.measure&&e.measure(j,i);}t("Zone");let Y=class Y{static assertZonePatched(){if(ae.Promise!==D.ZoneAwarePromise)throw new Error("Zone.js has detected that ZoneAwarePromise `(window|global).Promise` has been overwritten.\nMost likely cause is that a Promise polyfill has been loaded after Zone.js (Polyfilling Promise api is not necessary when zone.js is loaded. If you must load one, do so before loading zone.js.)");}static get root(){let i=Y.current;for(;i.parent;)i=i.parent;return i;}static get current(){return b.zone;}static get currentTask(){return S;}static __load_patch(i,s,o=!1){if(D.hasOwnProperty(i)){let y=ae[ee("forceDuplicateZoneCheck")]===!0;if(!o&&y)throw Error("Already loaded patch: "+i);}else if(!ae["__Zone_disable_"+i]){let y="Zone:"+i;t(y),D[i]=s(ae,Y,R),a(y,y);}}get parent(){return this._parent;}get name(){return this._name;}constructor(i,s){this._parent=i,this._name=s?s.name||"unnamed":"<root>",this._properties=s&&s.properties||{},this._zoneDelegate=new l(this,this._parent&&this._parent._zoneDelegate,s);}get(i){let s=this.getZoneWith(i);if(s)return s._properties[i];}getZoneWith(i){let s=this;for(;s;){if(s._properties.hasOwnProperty(i))return s;s=s._parent;}return null;}fork(i){if(!i)throw new Error("ZoneSpec required!");return this._zoneDelegate.fork(this,i);}wrap(i,s){if(typeof i!="function")throw new Error("Expecting function got: "+i);let o=this._zoneDelegate.intercept(this,i,s),y=this;return function(){return y.runGuarded(o,this,arguments,s);};}run(i,s,o,y){b={parent:b,zone:this};try{return this._zoneDelegate.invoke(this,i,s,o,y);}finally{b=b.parent;}}runGuarded(i,s=null,o,y){b={parent:b,zone:this};try{try{return this._zoneDelegate.invoke(this,i,s,o,y);}catch(H){if(this._zoneDelegate.handleError(this,H))throw H;}}finally{b=b.parent;}}runTask(i,s,o){if(i.zone!=this)throw new Error("A task can only be run in the zone of creation! (Creation: "+(i.zone||J).name+"; Execution: "+this.name+")");let y=i,{type:H,data:{isPeriodic:I=!1,isRefreshable:se=!1}={}}=i;if(i.state===X&&(H===B||H===p))return;let le=i.state!=Z;le&&y._transitionTo(Z,d);let ue=S;S=y,b={parent:b,zone:this};try{H==p&&i.data&&!I&&!se&&(i.cancelFn=void 0);try{return this._zoneDelegate.invokeTask(this,y,s,o);}catch(ne){if(this._zoneDelegate.handleError(this,ne))throw ne;}}finally{let ne=i.state;if(ne!==X&&ne!==q)if(H==B||I||se&&ne===k)le&&y._transitionTo(d,Z,k);else{let h=y._zoneDelegates;this._updateTaskCount(y,-1),le&&y._transitionTo(X,Z,X),se&&(y._zoneDelegates=h);}b=b.parent,S=ue;}}scheduleTask(i){if(i.zone&&i.zone!==this){let o=this;for(;o;){if(o===i.zone)throw Error(`can not reschedule task to ${this.name} which is descendants of the original zone ${i.zone.name}`);o=o.parent;}}i._transitionTo(k,X);let s=[];i._zoneDelegates=s,i._zone=this;try{i=this._zoneDelegate.scheduleTask(this,i);}catch(o){throw i._transitionTo(q,k,X),this._zoneDelegate.handleError(this,o),o;}return i._zoneDelegates===s&&this._updateTaskCount(i,1),i.state==k&&i._transitionTo(d,k),i;}scheduleMicroTask(i,s,o,y){return this.scheduleTask(new _(V,i,s,o,y,void 0));}scheduleMacroTask(i,s,o,y,H){return this.scheduleTask(new _(p,i,s,o,y,H));}scheduleEventTask(i,s,o,y,H){return this.scheduleTask(new _(B,i,s,o,y,H));}cancelTask(i){if(i.zone!=this)throw new Error("A task can only be cancelled in the zone of creation! (Creation: "+(i.zone||J).name+"; Execution: "+this.name+")");if(!(i.state!==d&&i.state!==Z)){i._transitionTo(x,d,Z);try{this._zoneDelegate.cancelTask(this,i);}catch(s){throw i._transitionTo(q,x),this._zoneDelegate.handleError(this,s),s;}return this._updateTaskCount(i,-1),i._transitionTo(X,x),i.runCount=-1,i;}}_updateTaskCount(i,s){let o=i._zoneDelegates;s==-1&&(i._zoneDelegates=null);for(let y=0;y<o.length;y++)o[y]._updateTaskCount(i.type,s);}};Y.__symbol__=ee;let n=Y,c={name:"",onHasTask:(j,i,s,o)=>j.hasTask(s,o),onScheduleTask:(j,i,s,o)=>j.scheduleTask(s,o),onInvokeTask:(j,i,s,o,y,H)=>j.invokeTask(s,o,y,H),onCancelTask:(j,i,s,o)=>j.cancelTask(s,o)};class l{get zone(){return this._zone;}constructor(i,s,o){this._taskCounts={microTask:0,macroTask:0,eventTask:0},this._zone=i,this._parentDelegate=s,this._forkZS=o&&(o&&o.onFork?o:s._forkZS),this._forkDlgt=o&&(o.onFork?s:s._forkDlgt),this._forkCurrZone=o&&(o.onFork?this._zone:s._forkCurrZone),this._interceptZS=o&&(o.onIntercept?o:s._interceptZS),this._interceptDlgt=o&&(o.onIntercept?s:s._interceptDlgt),this._interceptCurrZone=o&&(o.onIntercept?this._zone:s._interceptCurrZone),this._invokeZS=o&&(o.onInvoke?o:s._invokeZS),this._invokeDlgt=o&&(o.onInvoke?s:s._invokeDlgt),this._invokeCurrZone=o&&(o.onInvoke?this._zone:s._invokeCurrZone),this._handleErrorZS=o&&(o.onHandleError?o:s._handleErrorZS),this._handleErrorDlgt=o&&(o.onHandleError?s:s._handleErrorDlgt),this._handleErrorCurrZone=o&&(o.onHandleError?this._zone:s._handleErrorCurrZone),this._scheduleTaskZS=o&&(o.onScheduleTask?o:s._scheduleTaskZS),this._scheduleTaskDlgt=o&&(o.onScheduleTask?s:s._scheduleTaskDlgt),this._scheduleTaskCurrZone=o&&(o.onScheduleTask?this._zone:s._scheduleTaskCurrZone),this._invokeTaskZS=o&&(o.onInvokeTask?o:s._invokeTaskZS),this._invokeTaskDlgt=o&&(o.onInvokeTask?s:s._invokeTaskDlgt),this._invokeTaskCurrZone=o&&(o.onInvokeTask?this._zone:s._invokeTaskCurrZone),this._cancelTaskZS=o&&(o.onCancelTask?o:s._cancelTaskZS),this._cancelTaskDlgt=o&&(o.onCancelTask?s:s._cancelTaskDlgt),this._cancelTaskCurrZone=o&&(o.onCancelTask?this._zone:s._cancelTaskCurrZone),this._hasTaskZS=null,this._hasTaskDlgt=null,this._hasTaskDlgtOwner=null,this._hasTaskCurrZone=null;let y=o&&o.onHasTask,H=s&&s._hasTaskZS;(y||H)&&(this._hasTaskZS=y?o:c,this._hasTaskDlgt=s,this._hasTaskDlgtOwner=this,this._hasTaskCurrZone=this._zone,o.onScheduleTask||(this._scheduleTaskZS=c,this._scheduleTaskDlgt=s,this._scheduleTaskCurrZone=this._zone),o.onInvokeTask||(this._invokeTaskZS=c,this._invokeTaskDlgt=s,this._invokeTaskCurrZone=this._zone),o.onCancelTask||(this._cancelTaskZS=c,this._cancelTaskDlgt=s,this._cancelTaskCurrZone=this._zone));}fork(i,s){return this._forkZS?this._forkZS.onFork(this._forkDlgt,this.zone,i,s):new n(i,s);}intercept(i,s,o){return this._interceptZS?this._interceptZS.onIntercept(this._interceptDlgt,this._interceptCurrZone,i,s,o):s;}invoke(i,s,o,y,H){return this._invokeZS?this._invokeZS.onInvoke(this._invokeDlgt,this._invokeCurrZone,i,s,o,y,H):s.apply(o,y);}handleError(i,s){return this._handleErrorZS?this._handleErrorZS.onHandleError(this._handleErrorDlgt,this._handleErrorCurrZone,i,s):!0;}scheduleTask(i,s){let o=s;if(this._scheduleTaskZS)this._hasTaskZS&&o._zoneDelegates.push(this._hasTaskDlgtOwner),o=this._scheduleTaskZS.onScheduleTask(this._scheduleTaskDlgt,this._scheduleTaskCurrZone,i,s),o||(o=s);else if(s.scheduleFn)s.scheduleFn(s);else if(s.type==V)F(s);else throw new Error("Task is missing scheduleFn.");return o;}invokeTask(i,s,o,y){return this._invokeTaskZS?this._invokeTaskZS.onInvokeTask(this._invokeTaskDlgt,this._invokeTaskCurrZone,i,s,o,y):s.callback.apply(o,y);}cancelTask(i,s){let o;if(this._cancelTaskZS)o=this._cancelTaskZS.onCancelTask(this._cancelTaskDlgt,this._cancelTaskCurrZone,i,s);else{if(!s.cancelFn)throw Error("Task is not cancelable");o=s.cancelFn(s);}return o;}hasTask(i,s){try{this._hasTaskZS&&this._hasTaskZS.onHasTask(this._hasTaskDlgt,this._hasTaskCurrZone,i,s);}catch(o){this.handleError(i,o);}}_updateTaskCount(i,s){let o=this._taskCounts,y=o[i],H=o[i]=y+s;if(H<0)throw new Error("More tasks executed then were scheduled.");if(y==0||H==0){let I={microTask:o.microTask>0,macroTask:o.macroTask>0,eventTask:o.eventTask>0,change:i};this.hasTask(this._zone,I);}}}class _{constructor(i,s,o,y,H,I){if(this._zone=null,this.runCount=0,this._zoneDelegates=null,this._state="notScheduled",this.type=i,this.source=s,this.data=y,this.scheduleFn=H,this.cancelFn=I,!o)throw new Error("callback is not defined");this.callback=o;let se=this;i===B&&y&&y.useG?this.invoke=_.invokeTask:this.invoke=function(){return _.invokeTask.call(ae,se,this,arguments);};}static invokeTask(i,s,o){i||(i=this),Q++;try{return i.runCount++,i.zone.runTask(i,s,o);}finally{Q==1&&K(),Q--;}}get zone(){return this._zone;}get state(){return this._state;}cancelScheduleRequest(){this._transitionTo(X,k);}_transitionTo(i,s,o){if(this._state===s||this._state===o)this._state=i,i==X&&(this._zoneDelegates=null);else throw new Error(`${this.type} '${this.source}': can not transition to '${i}', expecting state '${s}'${o?" or '"+o+"'":""}, was '${this._state}'.`);}toString(){return this.data&&typeof this.data.handleId<"u"?this.data.handleId.toString():Object.prototype.toString.call(this);}toJSON(){return{type:this.type,state:this.state,source:this.source,zone:this.zone.name,runCount:this.runCount};}}let T=ee("setTimeout"),m=ee("Promise"),C=ee("then"),E=[],P=!1,L;function z(j){if(L||ae[m]&&(L=ae[m].resolve(0)),L){let i=L[C];i||(i=L.then),i.call(L,j);}else ae[T](j,0);}function F(j){Q===0&&E.length===0&&z(K),j&&E.push(j);}function K(){if(!P){for(P=!0;E.length;){let j=E;E=[];for(let i=0;i<j.length;i++){let s=j[i];try{s.zone.runTask(s,null,null);}catch(o){R.onUnhandledError(o);}}}R.microtaskDrainDone(),P=!1;}}let J={name:"NO ZONE"},X="notScheduled",k="scheduling",d="scheduled",Z="running",x="canceling",q="unknown",V="microTask",p="macroTask",B="eventTask",D={},R={symbol:ee,currentZoneFrame:()=>b,onUnhandledError:W,microtaskDrainDone:W,scheduleMicroTask:F,showUncaughtError:()=>!n[ee("ignoreConsoleErrorUncaughtError")],patchEventTarget:()=>[],patchOnProperties:W,patchMethod:()=>W,bindArguments:()=>[],patchThen:()=>W,patchMacroTask:()=>W,patchEventPrototype:()=>W,isIEOrEdge:()=>!1,getGlobalObjects:()=>{},ObjectDefineProperty:()=>W,ObjectGetOwnPropertyDescriptor:()=>{},ObjectCreate:()=>{},ArraySlice:()=>[],patchClass:()=>W,wrapWithCurrentZone:()=>W,filterProperties:()=>[],attachOriginToPatched:()=>W,_redefineProperty:()=>W,patchCallbacks:()=>W,nativeScheduleMicroTask:z},b={parent:null,zone:new n(null,null)},S=null,Q=0;function W(){}return a("Zone","Zone"),n;}function _t(){let e=globalThis,t=e[ee("forceDuplicateZoneCheck")]===!0;if(e.Zone&&(t||typeof e.Zone.__symbol__!="function"))throw new Error("Zone already loaded.");return e.Zone??=dt(),e.Zone;}var be=Object.getOwnPropertyDescriptor,Ae=Object.defineProperty,je=Object.getPrototypeOf,Et=Object.create,Tt=Array.prototype.slice,He="addEventListener",ze="removeEventListener",Me=ee(He),Le=ee(ze),fe="true",he="false",Pe=ee("");function xe(e,t){return Zone.current.wrap(e,t);}function Ve(e,t,a,n,c){return Zone.current.scheduleMacroTask(e,t,a,n,c);}var A=ee,Se=typeof window<"u",ye=Se?window:void 0,$=Se&&ye||globalThis,pt="removeAttribute";function Ge(e,t){for(let a=e.length-1;a>=0;a--)typeof e[a]=="function"&&(e[a]=xe(e[a],t+"_"+a));return e;}function gt(e,t){let a=e.constructor.name;for(let n=0;n<t.length;n++){let c=t[n],l=e[c];if(l){let _=be(e,c);if(!tt(_))continue;e[c]=(T=>{let m=function(){return T.apply(this,Ge(arguments,a+"."+c));};return _e(m,T),m;})(l);}}}function tt(e){return e?e.writable===!1?!1:!(typeof e.get=="function"&&typeof e.set>"u"):!0;}var nt=typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope,De=!("nw"in $)&&typeof $.process<"u"&&$.process.toString()==="[object process]",Ue=!De&&!nt&&!!(Se&&ye.HTMLElement),rt=typeof $.process<"u"&&$.process.toString()==="[object process]"&&!nt&&!!(Se&&ye.HTMLElement),Ce={},mt=A("enable_beforeunload"),Ye=function(e){if(e=e||$.event,!e)return;let t=Ce[e.type];t||(t=Ce[e.type]=A("ON_PROPERTY"+e.type));let a=this||e.target||$,n=a[t],c;if(Ue&&a===ye&&e.type==="error"){let l=e;c=n&&n.call(this,l.message,l.filename,l.lineno,l.colno,l.error),c===!0&&e.preventDefault();}else c=n&&n.apply(this,arguments),e.type==="beforeunload"&&$[mt]&&typeof c=="string"?e.returnValue=c:c!=null&&!c&&e.preventDefault();return c;};function $e(e,t,a){let n=be(e,t);if(!n&&a&&be(a,t)&&(n={enumerable:!0,configurable:!0}),!n||!n.configurable)return;let c=A("on"+t+"patched");if(e.hasOwnProperty(c)&&e[c])return;delete n.writable,delete n.value;let l=n.get,_=n.set,T=t.slice(2),m=Ce[T];m||(m=Ce[T]=A("ON_PROPERTY"+T)),n.set=function(C){let E=this;if(!E&&e===$&&(E=$),!E)return;typeof E[m]=="function"&&E.removeEventListener(T,Ye),_&&_.call(E,null),E[m]=C,typeof C=="function"&&E.addEventListener(T,Ye,!1);},n.get=function(){let C=this;if(!C&&e===$&&(C=$),!C)return null;let E=C[m];if(E)return E;if(l){let P=l.call(this);if(P)return n.set.call(this,P),typeof C[pt]=="function"&&C.removeAttribute(t),P;}return null;},Ae(e,t,n),e[c]=!0;}function ot(e,t,a){if(t)for(let n=0;n<t.length;n++)$e(e,"on"+t[n],a);else{let n=[];for(let c in e)c.slice(0,2)=="on"&&n.push(c);for(let c=0;c<n.length;c++)$e(e,n[c],a);}}var oe=A("originalInstance");function ve(e){let t=$[e];if(!t)return;$[A(e)]=t,$[e]=function(){let c=Ge(arguments,e);switch(c.length){case 0:this[oe]=new t();break;case 1:this[oe]=new t(c[0]);break;case 2:this[oe]=new t(c[0],c[1]);break;case 3:this[oe]=new t(c[0],c[1],c[2]);break;case 4:this[oe]=new t(c[0],c[1],c[2],c[3]);break;default:throw new Error("Arg list too long.");}},_e($[e],t);let a=new t(function(){}),n;for(n in a)e==="XMLHttpRequest"&&n==="responseBlob"||function(c){typeof a[c]=="function"?$[e].prototype[c]=function(){return this[oe][c].apply(this[oe],arguments);}:Ae($[e].prototype,c,{set:function(l){typeof l=="function"?(this[oe][c]=xe(l,e+"."+c),_e(this[oe][c],l)):this[oe][c]=l;},get:function(){return this[oe][c];}});}(n);for(n in t)n!=="prototype"&&t.hasOwnProperty(n)&&($[e][n]=t[n]);}function de(e,t,a){let n=e;for(;n&&!n.hasOwnProperty(t);)n=je(n);!n&&e[t]&&(n=e);let c=A(t),l=null;if(n&&(!(l=n[c])||!n.hasOwnProperty(c))){l=n[c]=n[t];let _=n&&be(n,t);if(tt(_)){let T=a(l,c,t);n[t]=function(){return T(this,arguments);},_e(n[t],l);}}return l;}function yt(e,t,a){let n=null;function c(l){let _=l.data;return _.args[_.cbIdx]=function(){l.invoke.apply(this,arguments);},n.apply(_.target,_.args),l;}n=de(e,t,l=>function(_,T){let m=a(_,T);return m.cbIdx>=0&&typeof T[m.cbIdx]=="function"?Ve(m.name,T[m.cbIdx],m,c):l.apply(_,T);});}function _e(e,t){e[A("OriginalDelegate")]=t;}var Ke=!1,Ie=!1;function kt(){try{let e=ye.navigator.userAgent;if(e.indexOf("MSIE ")!==-1||e.indexOf("Trident/")!==-1)return!0;}catch{}return!1;}function vt(){if(Ke)return Ie;Ke=!0;try{let e=ye.navigator.userAgent;(e.indexOf("MSIE ")!==-1||e.indexOf("Trident/")!==-1||e.indexOf("Edge/")!==-1)&&(Ie=!0);}catch{}return Ie;}function Je(e){return typeof e=="function";}function Qe(e){return typeof e=="number";}var me=!1;if(typeof window<"u")try{let e=Object.defineProperty({},"passive",{get:function(){me=!0;}});window.addEventListener("test",e,e),window.removeEventListener("test",e,e);}catch{me=!1;}var bt={useG:!0},te={},st={},it=new RegExp("^"+Pe+"(\\w+)(true|false)$"),ct=A("propagationStopped");function at(e,t){let a=(t?t(e):e)+he,n=(t?t(e):e)+fe,c=Pe+a,l=Pe+n;te[e]={},te[e][he]=c,te[e][fe]=l;}function Pt(e,t,a,n){let c=n&&n.add||He,l=n&&n.rm||ze,_=n&&n.listeners||"eventListeners",T=n&&n.rmAll||"removeAllListeners",m=A(c),C="."+c+":",E="prependListener",P="."+E+":",L=function(k,d,Z){if(k.isRemoved)return;let x=k.callback;typeof x=="object"&&x.handleEvent&&(k.callback=p=>x.handleEvent(p),k.originalDelegate=x);let q;try{k.invoke(k,d,[Z]);}catch(p){q=p;}let V=k.options;if(V&&typeof V=="object"&&V.once){let p=k.originalDelegate?k.originalDelegate:k.callback;d[l].call(d,Z.type,p,V);}return q;};function z(k,d,Z){if(d=d||e.event,!d)return;let x=k||d.target||e,q=x[te[d.type][Z?fe:he]];if(q){let V=[];if(q.length===1){let p=L(q[0],x,d);p&&V.push(p);}else{let p=q.slice();for(let B=0;B<p.length&&!(d&&d[ct]===!0);B++){let D=L(p[B],x,d);D&&V.push(D);}}if(V.length===1)throw V[0];for(let p=0;p<V.length;p++){let B=V[p];t.nativeScheduleMicroTask(()=>{throw B;});}}}let F=function(k){return z(this,k,!1);},K=function(k){return z(this,k,!0);};function J(k,d){if(!k)return!1;let Z=!0;d&&d.useG!==void 0&&(Z=d.useG);let x=d&&d.vh,q=!0;d&&d.chkDup!==void 0&&(q=d.chkDup);let V=!1;d&&d.rt!==void 0&&(V=d.rt);let p=k;for(;p&&!p.hasOwnProperty(c);)p=je(p);if(!p&&k[c]&&(p=k),!p||p[m])return!1;let B=d&&d.eventNameToString,D={},R=p[m]=p[c],b=p[A(l)]=p[l],S=p[A(_)]=p[_],Q=p[A(T)]=p[T],W;d&&d.prepend&&(W=p[A(d.prepend)]=p[d.prepend]);function Y(r,f){return!me&&typeof r=="object"&&r?!!r.capture:!me||!f?r:typeof r=="boolean"?{capture:r,passive:!0}:r?typeof r=="object"&&r.passive!==!1?{...r,passive:!0}:r:{passive:!0};}let j=function(r){if(!D.isExisting)return R.call(D.target,D.eventName,D.capture?K:F,D.options);},i=function(r){if(!r.isRemoved){let f=te[r.eventName],v;f&&(v=f[r.capture?fe:he]);let w=v&&r.target[v];if(w){for(let g=0;g<w.length;g++)if(w[g]===r){w.splice(g,1),r.isRemoved=!0,r.removeAbortListener&&(r.removeAbortListener(),r.removeAbortListener=null),w.length===0&&(r.allRemoved=!0,r.target[v]=null);break;}}}if(r.allRemoved)return b.call(r.target,r.eventName,r.capture?K:F,r.options);},s=function(r){return R.call(D.target,D.eventName,r.invoke,D.options);},o=function(r){return W.call(D.target,D.eventName,r.invoke,D.options);},y=function(r){return b.call(r.target,r.eventName,r.invoke,r.options);},H=Z?j:s,I=Z?i:y,se=function(r,f){let v=typeof f;return v==="function"&&r.callback===f||v==="object"&&r.originalDelegate===f;},le=d&&d.diff?d.diff:se,ue=Zone[A("UNPATCHED_EVENTS")],ne=e[A("PASSIVE_EVENTS")];function h(r){if(typeof r=="object"&&r!==null){let f={...r};return r.signal&&(f.signal=r.signal),f;}return r;}let u=function(r,f,v,w,g=!1,N=!1){return function(){let O=this||e,M=arguments[0];d&&d.transferEventName&&(M=d.transferEventName(M));let G=arguments[1];if(!G)return r.apply(this,arguments);if(De&&M==="uncaughtException")return r.apply(this,arguments);let U=!1;if(typeof G!="function"){if(!G.handleEvent)return r.apply(this,arguments);U=!0;}if(x&&!x(r,G,O,arguments))return;let Ee=me&&!!ne&&ne.indexOf(M)!==-1,ie=h(Y(arguments[2],Ee)),Te=ie?.signal;if(Te?.aborted)return;if(ue){for(let ce=0;ce<ue.length;ce++)if(M===ue[ce])return Ee?r.call(O,M,G,ie):r.apply(this,arguments);}let Ne=ie?typeof ie=="boolean"?!0:ie.capture:!1,Fe=ie&&typeof ie=="object"?ie.once:!1,ht=Zone.current,Oe=te[M];Oe||(at(M,B),Oe=te[M]);let Be=Oe[Ne?fe:he],pe=O[Be],We=!1;if(pe){if(We=!0,q){for(let ce=0;ce<pe.length;ce++)if(le(pe[ce],G))return;}}else pe=O[Be]=[];let Re,Xe=O.constructor.name,qe=st[Xe];qe&&(Re=qe[M]),Re||(Re=Xe+f+(B?B(M):M)),D.options=ie,Fe&&(D.options.once=!1),D.target=O,D.capture=Ne,D.eventName=M,D.isExisting=We;let ke=Z?bt:void 0;ke&&(ke.taskData=D),Te&&(D.options.signal=void 0);let re=ht.scheduleEventTask(Re,G,ke,v,w);if(Te){D.options.signal=Te;let ce=()=>re.zone.cancelTask(re);r.call(Te,"abort",ce,{once:!0}),re.removeAbortListener=()=>Te.removeEventListener("abort",ce);}if(D.target=null,ke&&(ke.taskData=null),Fe&&(D.options.once=!0),!me&&typeof re.options=="boolean"||(re.options=ie),re.target=O,re.capture=Ne,re.eventName=M,U&&(re.originalDelegate=G),N?pe.unshift(re):pe.push(re),g)return O;};};return p[c]=u(R,C,H,I,V),W&&(p[E]=u(W,P,o,I,V,!0)),p[l]=function(){let r=this||e,f=arguments[0];d&&d.transferEventName&&(f=d.transferEventName(f));let v=arguments[2],w=v?typeof v=="boolean"?!0:v.capture:!1,g=arguments[1];if(!g)return b.apply(this,arguments);if(x&&!x(b,g,r,arguments))return;let N=te[f],O;N&&(O=N[w?fe:he]);let M=O&&r[O];if(M)for(let G=0;G<M.length;G++){let U=M[G];if(le(U,g)){if(M.splice(G,1),U.isRemoved=!0,M.length===0&&(U.allRemoved=!0,r[O]=null,!w&&typeof f=="string")){let Ee=Pe+"ON_PROPERTY"+f;r[Ee]=null;}return U.zone.cancelTask(U),V?r:void 0;}}return b.apply(this,arguments);},p[_]=function(){let r=this||e,f=arguments[0];d&&d.transferEventName&&(f=d.transferEventName(f));let v=[],w=lt(r,B?B(f):f);for(let g=0;g<w.length;g++){let N=w[g],O=N.originalDelegate?N.originalDelegate:N.callback;v.push(O);}return v;},p[T]=function(){let r=this||e,f=arguments[0];if(f){d&&d.transferEventName&&(f=d.transferEventName(f));let v=te[f];if(v){let w=v[he],g=v[fe],N=r[w],O=r[g];if(N){let M=N.slice();for(let G=0;G<M.length;G++){let U=M[G],Ee=U.originalDelegate?U.originalDelegate:U.callback;this[l].call(this,f,Ee,U.options);}}if(O){let M=O.slice();for(let G=0;G<M.length;G++){let U=M[G],Ee=U.originalDelegate?U.originalDelegate:U.callback;this[l].call(this,f,Ee,U.options);}}}}else{let v=Object.keys(r);for(let w=0;w<v.length;w++){let g=v[w],N=it.exec(g),O=N&&N[1];O&&O!=="removeListener"&&this[T].call(this,O);}this[T].call(this,"removeListener");}if(V)return this;},_e(p[c],R),_e(p[l],b),Q&&_e(p[T],Q),S&&_e(p[_],S),!0;}let X=[];for(let k=0;k<a.length;k++)X[k]=J(a[k],n);return X;}function lt(e,t){if(!t){let l=[];for(let _ in e){let T=it.exec(_),m=T&&T[1];if(m&&(!t||m===t)){let C=e[_];if(C)for(let E=0;E<C.length;E++)l.push(C[E]);}}return l;}let a=te[t];a||(at(t),a=te[t]);let n=e[a[he]],c=e[a[fe]];return n?c?n.concat(c):n.slice():c?c.slice():[];}function Rt(e,t){let a=e.Event;a&&a.prototype&&t.patchMethod(a.prototype,"stopImmediatePropagation",n=>function(c,l){c[ct]=!0,n&&n.apply(c,l);});}function wt(e,t){t.patchMethod(e,"queueMicrotask",a=>function(n,c){Zone.current.scheduleMicroTask("queueMicrotask",c[0]);});}var we=A("zoneTask");function ge(e,t,a,n){let c=null,l=null;t+=n,a+=n;let _={};function T(C){let E=C.data;E.args[0]=function(){return C.invoke.apply(this,arguments);};let P=c.apply(e,E.args);return Qe(P)?E.handleId=P:(E.handle=P,E.isRefreshable=Je(P.refresh)),C;}function m(C){let{handle:E,handleId:P}=C.data;return l.call(e,E??P);}c=de(e,t,C=>function(E,P){if(Je(P[0])){let L={isRefreshable:!1,isPeriodic:n==="Interval",delay:n==="Timeout"||n==="Interval"?P[1]||0:void 0,args:P},z=P[0];P[0]=function(){try{return z.apply(this,arguments);}finally{let{handle:Z,handleId:x,isPeriodic:q,isRefreshable:V}=L;!q&&!V&&(x?delete _[x]:Z&&(Z[we]=null));}};let F=Ve(t,P[0],L,T,m);if(!F)return F;let{handleId:K,handle:J,isRefreshable:X,isPeriodic:k}=F.data;if(K)_[K]=F;else if(J&&(J[we]=F,X&&!k)){let d=J.refresh;J.refresh=function(){let{zone:Z,state:x}=F;return x==="notScheduled"?(F._state="scheduled",Z._updateTaskCount(F,1)):x==="running"&&(F._state="scheduling"),d.call(this);};}return J??K??F;}else return C.apply(e,P);}),l=de(e,a,C=>function(E,P){let L=P[0],z;Qe(L)?(z=_[L],delete _[L]):(z=L?.[we],z?L[we]=null:z=L),z?.type?z.cancelFn&&z.zone.cancelTask(z):C.apply(e,P);});}function Ct(e,t){let{isBrowser:a,isMix:n}=t.getGlobalObjects();if(!a&&!n||!e.customElements||!("customElements"in e))return;let c=["connectedCallback","disconnectedCallback","adoptedCallback","attributeChangedCallback","formAssociatedCallback","formDisabledCallback","formResetCallback","formStateRestoreCallback"];t.patchCallbacks(t,e.customElements,"customElements","define",c);}function St(e,t){if(Zone[t.symbol("patchEventTarget")])return;let{eventNames:a,zoneSymbolEventNames:n,TRUE_STR:c,FALSE_STR:l,ZONE_SYMBOL_PREFIX:_}=t.getGlobalObjects();for(let m=0;m<a.length;m++){let C=a[m],E=C+l,P=C+c,L=_+E,z=_+P;n[C]={},n[C][l]=L,n[C][c]=z;}let T=e.EventTarget;if(!(!T||!T.prototype))return t.patchEventTarget(e,t,[T&&T.prototype]),!0;}function Dt(e,t){t.patchEventPrototype(e,t);}function ut(e,t,a){if(!a||a.length===0)return t;let n=a.filter(l=>l.target===e);if(!n||n.length===0)return t;let c=n[0].ignoreProperties;return t.filter(l=>c.indexOf(l)===-1);}function et(e,t,a,n){if(!e)return;let c=ut(e,t,a);ot(e,c,n);}function Ze(e){return Object.getOwnPropertyNames(e).filter(t=>t.startsWith("on")&&t.length>2).map(t=>t.substring(2));}function Nt(e,t){if(De&&!rt||Zone[e.symbol("patchEvents")])return;let a=t.__Zone_ignore_on_properties,n=[];if(Ue){let c=window;n=n.concat(["Document","SVGElement","Element","HTMLElement","HTMLBodyElement","HTMLMediaElement","HTMLFrameSetElement","HTMLFrameElement","HTMLIFrameElement","HTMLMarqueeElement","Worker"]);let l=kt()?[{target:c,ignoreProperties:["error"]}]:[];et(c,Ze(c),a&&a.concat(l),je(c));}n=n.concat(["XMLHttpRequest","XMLHttpRequestEventTarget","IDBIndex","IDBRequest","IDBOpenDBRequest","IDBDatabase","IDBTransaction","IDBCursor","WebSocket"]);for(let c=0;c<n.length;c++){let l=t[n[c]];l&&l.prototype&&et(l.prototype,Ze(l.prototype),a);}}function Ot(e){e.__load_patch("legacy",t=>{let a=t[e.__symbol__("legacyPatch")];a&&a();}),e.__load_patch("timers",t=>{let a="set",n="clear";ge(t,a,n,"Timeout"),ge(t,a,n,"Interval"),ge(t,a,n,"Immediate");}),e.__load_patch("requestAnimationFrame",t=>{ge(t,"request","cancel","AnimationFrame"),ge(t,"mozRequest","mozCancel","AnimationFrame"),ge(t,"webkitRequest","webkitCancel","AnimationFrame");}),e.__load_patch("blocking",(t,a)=>{let n=["alert","prompt","confirm"];for(let c=0;c<n.length;c++){let l=n[c];de(t,l,(_,T,m)=>function(C,E){return a.current.run(_,t,E,m);});}}),e.__load_patch("EventTarget",(t,a,n)=>{Dt(t,n),St(t,n);let c=t.XMLHttpRequestEventTarget;c&&c.prototype&&n.patchEventTarget(t,n,[c.prototype]);}),e.__load_patch("MutationObserver",(t,a,n)=>{ve("MutationObserver"),ve("WebKitMutationObserver");}),e.__load_patch("IntersectionObserver",(t,a,n)=>{ve("IntersectionObserver");}),e.__load_patch("FileReader",(t,a,n)=>{ve("FileReader");}),e.__load_patch("on_property",(t,a,n)=>{Nt(n,t);}),e.__load_patch("customElements",(t,a,n)=>{Ct(t,n);}),e.__load_patch("XHR",(t,a)=>{C(t);let n=A("xhrTask"),c=A("xhrSync"),l=A("xhrListener"),_=A("xhrScheduled"),T=A("xhrURL"),m=A("xhrErrorBeforeScheduled");function C(E){let P=E.XMLHttpRequest;if(!P)return;let L=P.prototype;function z(R){return R[n];}let F=L[Me],K=L[Le];if(!F){let R=E.XMLHttpRequestEventTarget;if(R){let b=R.prototype;F=b[Me],K=b[Le];}}let J="readystatechange",X="scheduled";function k(R){let b=R.data,S=b.target;S[_]=!1,S[m]=!1;let Q=S[l];F||(F=S[Me],K=S[Le]),Q&&K.call(S,J,Q);let W=S[l]=()=>{if(S.readyState===S.DONE)if(!b.aborted&&S[_]&&R.state===X){let j=S[a.__symbol__("loadfalse")];if(S.status!==0&&j&&j.length>0){let i=R.invoke;R.invoke=function(){let s=S[a.__symbol__("loadfalse")];for(let o=0;o<s.length;o++)s[o]===R&&s.splice(o,1);!b.aborted&&R.state===X&&i.call(R);},j.push(R);}else R.invoke();}else!b.aborted&&S[_]===!1&&(S[m]=!0);};return F.call(S,J,W),S[n]||(S[n]=R),B.apply(S,b.args),S[_]=!0,R;}function d(){}function Z(R){let b=R.data;return b.aborted=!0,D.apply(b.target,b.args);}let x=de(L,"open",()=>function(R,b){return R[c]=b[2]==!1,R[T]=b[1],x.apply(R,b);}),q="XMLHttpRequest.send",V=A("fetchTaskAborting"),p=A("fetchTaskScheduling"),B=de(L,"send",()=>function(R,b){if(a.current[p]===!0||R[c])return B.apply(R,b);{let S={target:R,url:R[T],isPeriodic:!1,args:b,aborted:!1},Q=Ve(q,d,S,k,Z);R&&R[m]===!0&&!S.aborted&&Q.state===X&&Q.invoke();}}),D=de(L,"abort",()=>function(R,b){let S=z(R);if(S&&typeof S.type=="string"){if(S.cancelFn==null||S.data&&S.data.aborted)return;S.zone.cancelTask(S);}else if(a.current[V]===!0)return D.apply(R,b);});}}),e.__load_patch("geolocation",t=>{t.navigator&&t.navigator.geolocation&&gt(t.navigator.geolocation,["getCurrentPosition","watchPosition"]);}),e.__load_patch("PromiseRejectionEvent",(t,a)=>{function n(c){return function(l){lt(t,c).forEach(T=>{let m=t.PromiseRejectionEvent;if(m){let C=new m(c,{promise:l.promise,reason:l.rejection});T.invoke(C);}});};}t.PromiseRejectionEvent&&(a[A("unhandledPromiseRejectionHandler")]=n("unhandledrejection"),a[A("rejectionHandledHandler")]=n("rejectionhandled"));}),e.__load_patch("queueMicrotask",(t,a,n)=>{wt(t,n);});}function Mt(e){e.__load_patch("ZoneAwarePromise",(t,a,n)=>{let c=Object.getOwnPropertyDescriptor,l=Object.defineProperty;function _(h){if(h&&h.toString===Object.prototype.toString){let u=h.constructor&&h.constructor.name;return(u||"")+": "+JSON.stringify(h);}return h?h.toString():Object.prototype.toString.call(h);}let T=n.symbol,m=[],C=t[T("DISABLE_WRAPPING_UNCAUGHT_PROMISE_REJECTION")]!==!1,E=T("Promise"),P=T("then"),L="__creationTrace__";n.onUnhandledError=h=>{if(n.showUncaughtError()){let u=h&&h.rejection;u?console.error("Unhandled Promise rejection:",u instanceof Error?u.message:u,"; Zone:",h.zone.name,"; Task:",h.task&&h.task.source,"; Value:",u,u instanceof Error?u.stack:void 0):console.error(h);}},n.microtaskDrainDone=()=>{for(;m.length;){let h=m.shift();try{h.zone.runGuarded(()=>{throw h.throwOriginal?h.rejection:h;});}catch(u){F(u);}}};let z=T("unhandledPromiseRejectionHandler");function F(h){n.onUnhandledError(h);try{let u=a[z];typeof u=="function"&&u.call(this,h);}catch{}}function K(h){return h&&h.then;}function J(h){return h;}function X(h){return I.reject(h);}let k=T("state"),d=T("value"),Z=T("finally"),x=T("parentPromiseValue"),q=T("parentPromiseState"),V="Promise.then",p=null,B=!0,D=!1,R=0;function b(h,u){return r=>{try{Y(h,u,r);}catch(f){Y(h,!1,f);}};}let S=function(){let h=!1;return function(r){return function(){h||(h=!0,r.apply(null,arguments));};};},Q="Promise resolved with itself",W=T("currentTaskTrace");function Y(h,u,r){let f=S();if(h===r)throw new TypeError(Q);if(h[k]===p){let v=null;try{(typeof r=="object"||typeof r=="function")&&(v=r&&r.then);}catch(w){return f(()=>{Y(h,!1,w);})(),h;}if(u!==D&&r instanceof I&&r.hasOwnProperty(k)&&r.hasOwnProperty(d)&&r[k]!==p)i(r),Y(h,r[k],r[d]);else if(u!==D&&typeof v=="function")try{v.call(r,f(b(h,u)),f(b(h,!1)));}catch(w){f(()=>{Y(h,!1,w);})();}else{h[k]=u;let w=h[d];if(h[d]=r,h[Z]===Z&&u===B&&(h[k]=h[q],h[d]=h[x]),u===D&&r instanceof Error){let g=a.currentTask&&a.currentTask.data&&a.currentTask.data[L];g&&l(r,W,{configurable:!0,enumerable:!1,writable:!0,value:g});}for(let g=0;g<w.length;)s(h,w[g++],w[g++],w[g++],w[g++]);if(w.length==0&&u==D){h[k]=R;let g=r;try{throw new Error("Uncaught (in promise): "+_(r)+(r&&r.stack?`
`+r.stack:""));}catch(N){g=N;}C&&(g.throwOriginal=!0),g.rejection=r,g.promise=h,g.zone=a.current,g.task=a.currentTask,m.push(g),n.scheduleMicroTask();}}}return h;}let j=T("rejectionHandledHandler");function i(h){if(h[k]===R){try{let u=a[j];u&&typeof u=="function"&&u.call(this,{rejection:h[d],promise:h});}catch{}h[k]=D;for(let u=0;u<m.length;u++)h===m[u].promise&&m.splice(u,1);}}function s(h,u,r,f,v){i(h);let w=h[k],g=w?typeof f=="function"?f:J:typeof v=="function"?v:X;u.scheduleMicroTask(V,()=>{try{let N=h[d],O=!!r&&Z===r[Z];O&&(r[x]=N,r[q]=w);let M=u.run(g,void 0,O&&g!==X&&g!==J?[]:[N]);Y(r,!0,M);}catch(N){Y(r,!1,N);}},r);}let o="function ZoneAwarePromise() { [native code] }",y=function(){},H=t.AggregateError;class I{static toString(){return o;}static resolve(u){return u instanceof I?u:Y(new this(null),B,u);}static reject(u){return Y(new this(null),D,u);}static withResolvers(){let u={};return u.promise=new I((r,f)=>{u.resolve=r,u.reject=f;}),u;}static any(u){if(!u||typeof u[Symbol.iterator]!="function")return Promise.reject(new H([],"All promises were rejected"));let r=[],f=0;try{for(let g of u)f++,r.push(I.resolve(g));}catch{return Promise.reject(new H([],"All promises were rejected"));}if(f===0)return Promise.reject(new H([],"All promises were rejected"));let v=!1,w=[];return new I((g,N)=>{for(let O=0;O<r.length;O++)r[O].then(M=>{v||(v=!0,g(M));},M=>{w.push(M),f--,f===0&&(v=!0,N(new H(w,"All promises were rejected")));});});}static race(u){let r,f,v=new this((N,O)=>{r=N,f=O;});function w(N){r(N);}function g(N){f(N);}for(let N of u)K(N)||(N=this.resolve(N)),N.then(w,g);return v;}static all(u){return I.allWithCallback(u);}static allSettled(u){return(this&&this.prototype instanceof I?this:I).allWithCallback(u,{thenCallback:f=>({status:"fulfilled",value:f}),errorCallback:f=>({status:"rejected",reason:f})});}static allWithCallback(u,r){let f,v,w=new this((M,G)=>{f=M,v=G;}),g=2,N=0,O=[];for(let M of u){K(M)||(M=this.resolve(M));let G=N;try{M.then(U=>{O[G]=r?r.thenCallback(U):U,g--,g===0&&f(O);},U=>{r?(O[G]=r.errorCallback(U),g--,g===0&&f(O)):v(U);});}catch(U){v(U);}g++,N++;}return g-=2,g===0&&f(O),w;}constructor(u){let r=this;if(!(r instanceof I))throw new Error("Must be an instanceof Promise.");r[k]=p,r[d]=[];try{let f=S();u&&u(f(b(r,B)),f(b(r,D)));}catch(f){Y(r,!1,f);}}get[Symbol.toStringTag](){return"Promise";}get[Symbol.species](){return I;}then(u,r){let f=this.constructor?.[Symbol.species];(!f||typeof f!="function")&&(f=this.constructor||I);let v=new f(y),w=a.current;return this[k]==p?this[d].push(w,v,u,r):s(this,w,v,u,r),v;}catch(u){return this.then(null,u);}finally(u){let r=this.constructor?.[Symbol.species];(!r||typeof r!="function")&&(r=I);let f=new r(y);f[Z]=Z;let v=a.current;return this[k]==p?this[d].push(v,f,u,u):s(this,v,f,u,u),f;}}I.resolve=I.resolve,I.reject=I.reject,I.race=I.race,I.all=I.all;let se=t[E]=t.Promise;t.Promise=I;let le=T("thenPatched");function ue(h){let u=h.prototype,r=c(u,"then");if(r&&(r.writable===!1||!r.configurable))return;let f=u.then;u[P]=f,h.prototype.then=function(v,w){return new I((N,O)=>{f.call(this,N,O);}).then(v,w);},h[le]=!0;}n.patchThen=ue;function ne(h){return function(u,r){let f=h.apply(u,r);if(f instanceof I)return f;let v=f.constructor;return v[le]||ue(v),f;};}return se&&(ue(se),de(t,"fetch",h=>ne(h))),Promise[a.__symbol__("uncaughtPromiseErrors")]=m,I;});}function Lt(e){e.__load_patch("toString",t=>{let a=Function.prototype.toString,n=A("OriginalDelegate"),c=A("Promise"),l=A("Error"),_=function(){if(typeof this=="function"){let E=this[n];if(E)return typeof E=="function"?a.call(E):Object.prototype.toString.call(E);if(this===Promise){let P=t[c];if(P)return a.call(P);}if(this===Error){let P=t[l];if(P)return a.call(P);}}return a.call(this);};_[n]=a,Function.prototype.toString=_;let T=Object.prototype.toString,m="[object Promise]";Object.prototype.toString=function(){return typeof Promise=="function"&&this instanceof Promise?m:T.call(this);};});}function It(e,t,a,n,c){let l=Zone.__symbol__(n);if(t[l])return;let _=t[l]=t[n];t[n]=function(T,m,C){return m&&m.prototype&&c.forEach(function(E){let P=`${a}.${n}::`+E,L=m.prototype;try{if(L.hasOwnProperty(E)){let z=e.ObjectGetOwnPropertyDescriptor(L,E);z&&z.value?(z.value=e.wrapWithCurrentZone(z.value,P),e._redefineProperty(m.prototype,E,z)):L[E]&&(L[E]=e.wrapWithCurrentZone(L[E],P));}else L[E]&&(L[E]=e.wrapWithCurrentZone(L[E],P));}catch{}}),_.call(t,T,m,C);},e.attachOriginToPatched(t[n],_);}function Zt(e){e.__load_patch("util",(t,a,n)=>{let c=Ze(t);n.patchOnProperties=ot,n.patchMethod=de,n.bindArguments=Ge,n.patchMacroTask=yt;let l=a.__symbol__("BLACK_LISTED_EVENTS"),_=a.__symbol__("UNPATCHED_EVENTS");t[_]&&(t[l]=t[_]),t[l]&&(a[l]=a[_]=t[l]),n.patchEventPrototype=Rt,n.patchEventTarget=Pt,n.isIEOrEdge=vt,n.ObjectDefineProperty=Ae,n.ObjectGetOwnPropertyDescriptor=be,n.ObjectCreate=Et,n.ArraySlice=Tt,n.patchClass=ve,n.wrapWithCurrentZone=xe,n.filterProperties=ut,n.attachOriginToPatched=_e,n._redefineProperty=Object.defineProperty,n.patchCallbacks=It,n.getGlobalObjects=()=>({globalSources:st,zoneSymbolEventNames:te,eventNames:c,isBrowser:Ue,isMix:rt,isNode:De,TRUE_STR:fe,FALSE_STR:he,ZONE_SYMBOL_PREFIX:Pe,ADD_EVENT_LISTENER_STR:He,REMOVE_EVENT_LISTENER_STR:ze});});}function At(e){Mt(e),Lt(e),Zt(e);}var ft=_t();At(ft);Ot(ft);(globalThis.$localize??={}).locale="cs-CZ";/**i18n:2237a3cbe440e53610d57f1824710169e1223f78f659ad5781a2710c778940c9*/