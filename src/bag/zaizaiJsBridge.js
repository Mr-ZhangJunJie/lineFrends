export default class zzBridge{
 //
 static Render(message, callback, error) {
  if (window.hasOwnProperty("ZEPETO")) {
   ZEPETO.invoke("Render", message, function (result) {
    if (!result.isSuccess) {
     error();
     return;
    }
    var bstr = window.atob(result.result);
    let n = bstr.length
    let u8arr = new Uint8Array(n)
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    var blob = new Blob([u8arr], { type: "image/png" });

    var url = URL.createObjectURL(blob);
    callback(url);
   });
  }
 }

 static WaitZEPETO(callback) {
  if (window.hasOwnProperty("ZEPETO") == false) {
   document.addEventListener("ZepetoLoaded", callback);
  } else {
   callback();
  }
 }
}

function Render(message, callback, error) {
 if (window.hasOwnProperty("ZEPETO")) {
  ZEPETO.invoke("Render", message, function (result) {
   if (!result.isSuccess) {
    error();
    return;
   }

   var bstr = window.atob(result.result);
   let n = bstr.length
   let u8arr = new Uint8Array(n)
   while (n--) u8arr[n] = bstr.charCodeAt(n);
   var blob = new Blob([u8arr], { type: "image/png" });

   var url = URL.createObjectURL(blob);
   callback(url);

  });
 }

}

function WaitZEPETO(callback) {
 if (window.hasOwnProperty("ZEPETO") == false) {
  document.addEventListener("ZepetoLoaded", callback);
 } else {
  callback();
 }
}

/*
 获取用户动作形象
type: 目前固定photobooth
width、height 宽高
characterHashCodes: 崽崽Id
renderData：模板id
2GUPPPVatyMAia8AogyiOm       逢考必过崽
4qJxCsI8tm2qegEAbfowMl          金榜题名崽
4kJBi54behSBty8yfqoxBU            超常发挥崽
1YMo0aqH0fd1kcMnxa3bZm       一路开挂崽
6WumctNIOof7NfW9YZndjR        考神附体崽
2LHUzQklfz6er97P5b2ZZS          绝版幸运崽
3Y28J7
 */
// WaitZEPETO(function () {
//  Render({
//   "type": "photobooth",
//   // "renderData": "6DNT99uNuTqTjn6c0r9N6i",//之前可以，后来报错
//   "renderData": "2tLoaGiLd5A4FT2ZCrnVun",//模板id
//   "width": 520,
//   "height": 520,
//   "bones": [],
//   // 崽崽id，可多人
//   "characterHashCodes": [
//    "3Y28J7"
//   ]
//  }, url => {
//   var img = new Image();
//   img.style.cssText = 'width:50%;border:1px red solid'
//   img.src = url;
//   console.log('zzBridge.Render ready');
//   document.body.appendChild(img);
//  }, error => {
//   alert(error);
//  })
// })


// WaitZEPETO(function () {
// 	Render({
// 		"type": "photobooth",
// 		"renderData": "4XF7OvHpnaEaOQsEUSkimi",
// 		"width": 512,
// 		"height": 512,
// 		"bones": [
// 		],
// 		"characterHashCodes": [
// 			"3Y28J7"
// 		]
// 	}, url => {
// 		var img = new Image();
// 		img.src = url;
// 		document.body.appendChild(img);
// 	}, error => {
// 		alert(error);
// 	})
//
// })
