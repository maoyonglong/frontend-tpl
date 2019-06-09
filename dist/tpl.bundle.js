!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).Tpl=e()}(this,function(){"use strict";var d=0,w=1,y=2,S=3,x=4,E=5,m=6,b=7,G=8,L=9,Q=10,T=11,q=12,v=13,A=14,D=15,H=16,_=17,O=18,j={single:["input","img","br","hr","link","meta"],isSingle:function(t){return 0<=this.single.indexOf(t)},isDouble:function(t){return this.single.indexOf(t)<0}},k={isLetter:function(t){return/[a-zA-Z]/.test(t)},isLg:function(t){return"<"===t},isGt:function(t){return">"===t},isExclamatory:function(t){return"!"===t},isHyphen:function(t){return"-"===t},isSlash:function(t){return"/"===t},isSpace:function(t){return" "===t},isEqual:function(t){return"="===t},isSingleQuote:function(t){return"'"===t},isDoubleQuote:function(t){return'"'===t},isQuote:function(t){return this.isSingleQuote(t)||this.isDoubleQuote(t)}};function t(){this.p=0,this.len=0}function e(){}function i(){this.parser=new t,this.render=new e}function n(t){this.str=t,this.compiler=new i}return t.prototype.parse=function t(e){var i,n=0===this.p,s=d,r=[],o="",c="",a="",h="",u="",p="",l="",f="";for(this.len=e.length;this.p<this.len;){var g=e.charAt(this.p);switch(s){case d:i={},r.push(i),k.isLg(g)?(s=w,f=g):(s=Q,i.type="text",h=g),this.p++;continue;case w:if(k.isExclamatory(g))s=D;else if(k.isLetter(g))s=y,i.type="tag",o=g;else{if(!k.isSpace(g)){if(n)throw new Error("The tag name is illegal in ".concat(this.p,"."));return this.p--,r.pop(),r}s=Q,i.type="text",h=f+g,f=""}this.p++;continue;case y:if(k.isLetter(g))o+=g;else if(k.isSpace(g))s=S,i.tag=o;else{if(!k.isGt(g))throw new Error("The tag name is illegal in ".concat(this.p,"."));s=E,i.tag=o}this.p++;continue;case S:k.isSlash(g)||k.isSpace(g)||(s=T,c=g),k.isSlash(g)&&(s=x,f=g),k.isGt(g)&&(s=E),this.p++;continue;case x:k.isGt(g)&&(s=E),this.p++;continue;case E:if(j.isSingle(o)){s=d,o="";continue}if(k.isSlash(f))throw new Error("The ".concat(o," is not a single tag."));k.isLg(g)?(s=m,this.p++):i.children=t.call(this,e);continue;case m:f="",k.isSlash(g)?s=G:(this.p--,i.children=t.call(this,e)),this.p++;continue;case G:if(k.isSpace(g)||k.isGt(g)||k.isSlash(g))throw new Error("A letter is expected in ".concat(this.p," but got ").concat(g,"."));s=b,f+=g,this.p++;continue;case b:if(k.isSlash(g))throw new Error("A letter is expected in ".concat(this.p," but got ").concat(g,"."));k.isGt(g)?s=L:f+=g,this.p++;continue;case L:if(o!==f)throw new Error("The tag name is not similar in ".concat(this.p-1));if(!j.isDouble(o))throw new Error("The ".concat(o," is not a double tag in ").concat(this.p-1));o="",s=d;continue;case Q:k.isLg(g)?(i.text=h,h="",s=d):(h+=g,this.p++);continue;case T:k.isSpace(g)?s=q:k.isEqual(g)?s=v:c+=g,this.p++;continue;case q:k.isSpace(g)||k.isEqual(g)||(s=T),k.isEqual(g)&&(s=v),this.p++;continue;case v:k.isQuote(g)&&(s=A,p=g),this.p++;continue;case A:g!==p?a+=g:(s=S,void 0===i.attrs&&(i.attrs={}),i.attrs[c]=a,a=""),this.p++;continue;case D:if(!k.isHyphen(g))throw new Error("'-' is expected in ".concat(this.p," but got ").concat(g,"."));i.type="note",s=H,l="left",this.p++;continue;case H:if(k.isHyphen(g));else if(k.isGt(g))s=O,f=g;else{if("left"!==l)throw new Error("'-' or '>' is expected in ".concat(this.p," but got ").concat(g,"."));s=_,u+=g}this.p++;continue;case _:if(k.isHyphen(g))s=H,l="right";else{if(k.isGt(g))throw new Error("'-' is expected in ".concat(this.p," but got ").concat(g,"."));u+=g}this.p++;continue;case O:i.text=u,l=u="",s=d;continue}}return h&&(i.text=h),u&&(i.note=u),this.p=0,r},i.prototype.parse=function(t){return this.parser.parse(t)},i.prototype.render=function(t){return this.render.render(t)},n.prototype.parse=function(t){return this._ast=this.compiler.parse(this.str||t),this},n.prototype.render=function(t){return this._dom=this.compiler.render(this._ast||t),this},n});
