var originDom = null;
var originChangePer = null;
var DomtoPage,DomSize;
var supportTouch = "ontouchend" in document;
export function setDarg($dragDom,$changePer,callBack) {
    originDom = null;
    originDom = $dragDom;
    originChangePer = null;
    originChangePer = $changePer;
    if(supportTouch){
        $dragDom.on('touchstart',{callBack:callBack},dragTouchStart)
    }else{
        $dragDom.on('mousedown',{callBack:callBack},dragMouseDwon)
    }
}
function preventEventPropagation(evt) {
    var e = evt || window.event;
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    return false
}

function dragTouchStart(evt) {
    var touches = evt.touches || evt.originalEvent.touches;
    var touch = touches[0];
    var offset = {
        "x": touch.pageX,
        "y": touch.pageY
    };
    dragStart(offset, evt.data.callBack);
    $(document).on('touchmove',{callBack:evt.data.callBack},dragTouchMove);
    $(document).on('touchend',dragTouchUp);
    return preventEventPropagation(evt)
}

function dragTouchMove(evt) {
    var touches = evt.touches || evt.originalEvent.touches;
    var touch = touches[0];
    var offset = {
        "x": touch.pageX,
        "y": touch.pageY
    };
    dragMove(offset,evt.data.callBack);
}

function dragTouchUp(evt) {
    $(document).off("touchmove", dragTouchMove);
    $(document).off("touchend", dragTouchUp);
    return preventEventPropagation(evt);
}

function dragMouseDwon(evt) {
    var offset = {
        "x": evt.pageX,
        "y": evt.pageY
    };
    dragStart(offset,evt.data.callBack);
    $(document).on('mousemove',{callBack:evt.data.callBack},dragMouseMove);
    $(document).on('mouseup',dragMouseUp);
    return preventEventPropagation(evt);
}

function dragMouseMove(evt) {
    var offset = {
        "x": evt.pageX,
        "y": evt.pageY
    };
    dragMove(offset,evt.data.callBack);
    return preventEventPropagation(evt)
}

function dragMouseUp(evt) {
    $(document).off("mousemove", dragMouseMove);
    $(document).off("mouseup", dragMouseUp);
    return preventEventPropagation(evt);
}



function dragStart(offset,callBack) {
    DomtoPage = originDom.offset();
    DomSize = {w:originDom.width()};
    var clickPosAtBar = offset.x - DomtoPage.left;
    var scale = clickPosAtBar / DomSize.w;
    if(scale<0) scale = 0;
    if(scale>1) scale = 1;

    originChangePer.css('width',Math.round(scale * 100)+ '%');
    callBack(scale);
}

function dragMove(offset,callBack) {
    var clickPosAtBar = offset.x - DomtoPage.left;
    var scale = clickPosAtBar / DomSize.w;
    if(scale<0) scale = 0;
    if(scale>1) scale = 1;
    originChangePer.css('width',Math.round(scale * 100)+ '%');
    callBack(scale);
}
