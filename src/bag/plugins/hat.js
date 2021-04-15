import errMsg from '@/bag/vueCommon/errMsg/1/e'
var supportTouch = ("ontouchend" in document);

function preventEventPropagation(evt) {
    var e = evt || window.event;
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    return false
}
window.preventEventPropagation = preventEventPropagation
let $hatStamp = null;
let parentPos;
/**
 * cloneFun  克隆回调返回
 * catCaller 用户返回是否编辑
 * */
export function setHat($hatLayer,cloneFun,catCaller) {
  parentPos = $('.filtersActive').offset();
  destroyHat();
  $hatStamp = $hatLayer;
  let scale = 1/$hatLayer.attr('scale');


        // <div class="anchor hat-anchor-reve" anchor="1" style="transform: scale(${scale})"></div>
        // <div class="anchor hat-anchor-remo" anchor="2" style="transform: scale(${scale})"></div>
        // <div class="anchor hat-anchor-clon" anchor="3" style="transform: scale(${scale})"></div>
  let drapTools = `
    <div class="drapTools">
                <div class="anchor hat-anchor-rota" anchor="4" style="transform: scale(${scale})"></div>
              </div>
  `;
  // 增加锚点工具
  $hatLayer.append(drapTools).attr({'id' : 'hatStamp'})
  $hatLayer.attr({
    'scale': $hatLayer.attr('scale') == undefined ? '1.0' : $hatLayer.attr('scale'),
    'rotation': $hatLayer.attr('rotation') == undefined ? '0' : $hatLayer.attr('rotation')
    // 'opacity': $hatLayer.attr('opacity') == undefined ? '1.0' : $hatLayer.attr('opacity')
  });
  // 增加触发功能
  if (supportTouch) {
      $hatLayer.on("touchstart", {cloneFun:cloneFun,catCaller:catCaller},hatTouchStart);
  } else {
      $hatLayer.on("mousedown", {cloneFun:cloneFun,catCaller:catCaller},hatMouseDown);
  }

}

// 解除绑定
export function destroyHat() {
  if($hatStamp == null){
    return
  }
  $hatStamp.removeAttr('id');
  if (supportTouch) {
      $hatStamp.off("touchstart");
  } else {
      $hatStamp.off("mousedown");
  }
  $('.drapTools').remove();
}

function hatTouchStart(evt) {
    var touches = evt.touches || evt.originalEvent.touches;
    var touch = touches[0];
    var offset = {
        "x": touch.pageX,
        "y": touch.pageY
    };
    hatDragStart(offset, touch.target,evt.data.cloneFun,evt.data.catCaller);
    return preventEventPropagation(evt)
}
function hatTouchMove(evt) {
    var touches = evt.touches || evt.originalEvent.touches;
    var touch = touches[0];
    var offset = {
        "x": touch.clientX,
        "y": touch.clientY
    };
    hatDragMove(offset,evt.data.catCaller);

    // return preventEventPropagation(evt);
}

function hatTouchEnd() {
  $hatStamp.off("touchmove", hatMouseMove);
  $hatStamp.off("touchend", hatTouchEnd);
  hatDragEnd();
  return preventEventPropagation();
}

function hatMouseDown(evt) {
    var offset = {
        "x": evt.pageX,
        "y": evt.pageY
    };
    hatDragStart(offset, evt.srcElement,evt.data.cloneFun,evt.data.catCaller);
    return preventEventPropagation(evt);
}

function hatMouseMove(evt) {
    var offset = {
        "x": evt.pageX,
        "y": evt.pageY
    };
    hatDragMove(offset,evt.data.catCaller);
    return preventEventPropagation(evt)
}

function hatMouseUp(evt) {
  $hatStamp.off("mousemove", hatMouseMove);
  $hatStamp.off("mouseup", hatMouseUp);
  hatDragEnd();
  return preventEventPropagation(evt);
}

var hatMode = null;
var hatOrigin = {};
var hatFrom = {};
var reverse = false;

function hatDragStart(pos, tgt,cloneFun,catCaller) {

    // var $hatStamp = $("#hatStamp")
    var hatStampTransform = $hatStamp.css("-webkit-transform");
    $hatStamp.css("transform", "")
    $hatStamp.css("-webkit-transform", "");
    var hatStampOrigin = $hatStamp.offset();
    console.log('hatStampOrigin',hatStampOrigin)
    $hatStamp.css("transform", hatStampTransform);
    $hatStamp.css("-webkit-transform", hatStampTransform);
    // var hatLayerOrigin = $("#hatLayer").offset();//父层的向外距离
    var hatLayerOrigin = $("body").offset();

    if ($(tgt).attr("anchor") == "1") {
        console.log($hatStamp.find('.hat-icon'))
        $hatStamp.find('.hat-icon').css('transform', reverse ? 'rotateY(0deg)' : 'rotateY(180deg)')
        $hatStamp.find('.hat-icon').css('-webkit-transform', reverse ? 'rotateY(0deg)' : 'rotateY(180deg)')
        reverse = !reverse;
        $hatStamp.attr('reverse', reverse ? 1 : 0);
        if(catCaller)catCaller();
    } else if (($(tgt).attr("anchor") == "2")) {
        destroyHat();
        $hatStamp.remove();
        $('.changeOpacity').css('visibility','hidden');
        $('.filterItem').removeClass('active');
        if(catCaller)catCaller();
    } else if (($(tgt).attr("anchor") == "3")) {
        if($('.filter').length>=12) return errMsg({text: '太多放不下了'});
        destroyHat();
        $('.filtersBox .filter').attr('active','0');
        cloneFun($hatStamp.clone());
        if(catCaller)catCaller();
    } else if(($(tgt).attr("anchor") == "4")){
        if(supportTouch){
            $hatStamp.off('mouseup',hatMouseUp).on("touchmove",{catCaller:catCaller}, hatTouchMove);
            $hatStamp.off('mouseup',hatMouseUp).on("touchend", hatTouchEnd);
        }else{
            $hatStamp.off('mousemove',hatMouseMove).on("mousemove",{catCaller:catCaller}, hatMouseMove);
            $hatStamp.off('mouseup',hatMouseUp).on("mouseup", hatMouseUp);
        }
        hatMode = "anchor";
        hatOrigin = {
            x:hatStampOrigin.left-hatLayerOrigin.left+hatStampOrigin.width*0.5,
            y:hatStampOrigin.top-hatLayerOrigin.top+hatStampOrigin.height*0.5,
            scale:parseFloat($hatStamp.attr("scale")),
            rotation:parseFloat($hatStamp.attr("rotation"))
        };
        hatFrom = {x:pos.x-hatLayerOrigin.left-hatOrigin.x, y:pos.y-hatLayerOrigin.top-hatOrigin.y};
    }else {
        if(supportTouch){
            $hatStamp.off('touchmove',hatMouseUp).on("touchmove",{catCaller:catCaller}, hatTouchMove);
            $hatStamp.off('touchend',hatMouseUp).on("touchend", hatTouchEnd);
        }else{
            $hatStamp.off('mousemove',hatMouseMove).on("mousemove", {catCaller:catCaller},hatMouseMove);
            $hatStamp.off('mouseup',hatMouseUp).on("mouseup", hatMouseUp);
        }
        hatMode = "drag";
        hatOrigin = {x:hatStampOrigin.left-hatLayerOrigin.left, y:hatStampOrigin.top-hatLayerOrigin.top};
        hatFrom = pos;
    }
}
function hatDragMove(pos,catCaller) {
    if (hatMode == "anchor") {
        // var hatLayerOrigin = $("#hatLayer").offset();//父层的向外距离
        var hatLayerOrigin = $("body").offset();
        var hatTo = {x:pos.x-hatLayerOrigin.left-hatOrigin.x, y:pos.y-hatLayerOrigin.top-hatOrigin.y};

        var distanceFrom = distanceBetweenPoints({x:0,y:0}, hatFrom);
        var distanceTo = distanceBetweenPoints({x:0,y:0}, hatTo);

        var scale = hatOrigin.scale * distanceTo / distanceFrom;

        var rotationFrom = angleBetweenPoints({x:0,y:0}, hatFrom);
        var rotationTo = angleBetweenPoints({x:0,y:0}, hatTo);
        var rotation = hatOrigin.rotation + rotationTo - rotationFrom;
        var degree = rotation * 180 / Math.PI;

        $hatStamp.find('.anchor').css("transform", "scale("+(1/scale).toFixed(2)+")");
        $hatStamp.attr("scale", scale);
        $hatStamp.attr("rotation", rotation);

        $hatStamp.css("transform", "scale("+scale+") rotate("+degree+"deg)");
        $hatStamp.css("-webkit-transform", "scale("+scale+") rotate("+degree+"deg)");
    } else if (hatMode == "drag") {
        var offset = {x:pos.x-hatFrom.x - parentPos.left, y:pos.y-hatFrom.y - parentPos.top};
        var current = {x:hatOrigin.x+offset.x, y:hatOrigin.y+offset.y};
        $hatStamp.css("left", [current.x, "px"].join(""));
        $hatStamp.css("top", [current.y, "px"].join(""));
    }
    if(catCaller)catCaller();
}
function hatDragEnd() {
    hatMode = null;
}

function distanceBetweenPoints(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
}

function angleBetweenPoints(p1, p2) {
    var angle = 0;
    if (p2.y > p1.y) {
        if (p2.x > p1.x) {
            angle = Math.atan((p2.y-p1.y)/(p2.x-p1.x));
        } else if (p2.x < p1.x) {
            angle = Math.PI - Math.atan((p2.y-p1.y)/(p1.x-p2.x));
        } else {
            angle = Math.PI * 0.5;
        }
    } else if (p2.y < p1.y) {
        if (p2.x > p1.x) {
            angle = Math.PI * 2 - Math.atan((p1.y-p2.y)/(p2.x-p1.x));
        } else if (p2.x < p1.x) {
            angle = Math.PI + Math.atan((p1.y-p2.y)/(p1.x-p2.x));
        } else {
            angle = Math.PI * 1.5;
        }
    } else {
        if (p2.x >= p1.x) {
            angle = 0;
        } else {
            angle = Math.PI;
        }
    }
    return angle;
}
