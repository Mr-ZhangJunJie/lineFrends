// 手势框
// 不要给drop图片加transition
/**
 *  pageX，pageY 相对于HTML文档的距离
 *  clientX,clientY 返回触点相对于可见视区(visual viewport)左边沿的的X坐标。不包括任何滚动偏移.这个值会根据用户对可见视区的缩放行为而发生变化.
 *  screenX,screenY 触点相对于屏幕左边沿的X坐标，不包含页面滚动的偏移量
 *  element.getBoundingClientRect()   方法返回元素的大小及其相对于可见视区的位置。
 * */
(function(){
    let supportTouch = ("ontouchend" in document);
    // let supportTouch = ('createTouch' in document);
    // 阻止事件冒泡
    function preventEventPropagation(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        return false;
    }

    /**
     * 获取节点的transform值
     * @param Node
     * @return {{translate: {x: number, y: number}, scale: number}}
     */
    function _getTransform(Node) {
        let str = Node.style.transform;
        str = str.trim();
        let arr = str.split(') ');
        let obj = {translate:{x:0,y:0},scale:1};
        for(let i =0,j = arr.length; i <j ; i++){
            if(arr[i].trim().startsWith('translate')){
                let pos = arr[i].split('(')[1].split(',');
                obj.translate = {
                    x:parseFloat(pos[0]),
                    y:parseFloat(pos[1])
                }
            }else if(arr[i].trim().startsWith('scale')){
                let sca = arr[i].split('(')[1];
                obj.scale = parseFloat(sca)
            }
        }
        return obj
    }

    // 手势开始触发
    function gestureTouchStart(evt) {
        let touches = evt.touches || evt.originalEvent.touches;
        let touch = touches[0];
        // 获取第一个点 相对于 HTML文档左上角的位置
        let offset = {
            'x': touch.clientX,
            'y': touch.clientY
        };
        // 如果触摸点 大于等于 2指
        if (touches.length >= 2) {
            // 获取第二点的
            let touch2 = touches[1];
            // 获取第二个点 相对于 HTML文档左上角的位置
            let offset2 = {
                'x': touch2.clientX,
                'y': touch2.clientY
            };
            this.gesturePinchStart([offset, offset2]);
        } else {
            this.gesturePanStart(offset);
        }

        return preventEventPropagation(evt);
    }
    // 手势移动
    function gestureTouchMove(evt) {
        let touches = evt.touches || evt.originalEvent.touches;
        let touch = touches[0];
        // 平移过程中第一个点在可视区域的坐标
        let offset = {
            'x': touch.clientX,
            'y': touch.clientY
        };

        if (touches.length >= 2) {
            // 如果大于一个触摸点，则获取第二个点坐标
            let touch2 = touches[1];
            let offset2 = {
                'x': touch2.clientX,
                'y': touch2.clientY
            };
            this.gesturePinchChange([offset, offset2]);
        } else {
            this.gesturePanMove(offset);
        }

        return preventEventPropagation(evt);
    }
    // 手势结束
    function gestureTouchEnd(evt) {
        this.gesturePanEnd();
        this.gesturePinchEnd();
        return preventEventPropagation(evt);
    }
    // 鼠标开始点击
    function gestureMouseDown(evt) {
        let offset = {
            'x': evt.clientX,
            'y': evt.clientY
        };
        this.gesturePanStart(offset);

        return preventEventPropagation(evt);
    }
    // 鼠标移动
    function gestureMouseMove(evt) {
        let offset = {
            'x': evt.clientX,
            'y': evt.clientY
        };
        this.gesturePanMove(offset);
        return preventEventPropagation(evt);
    }
    // 鼠标抬起
    function gestureMouseUp(evt) {
        this.gesturePanEnd();
        return preventEventPropagation(evt);
    }
    // 平移开始  offset 触摸点在页面坐标的位置
    function gesturePanStart(offset) {

        // 禁止缩放过程操作
        this.gesturePinchEnabled = false;
        // 记录开始坐标点
        this.gesturePanFrom = offset;

        let transform = _getTransform(this.targetDom);
        this.gesturePanOrigin.x = transform.translate.x;
        this.gesturePanOrigin.y = transform.translate.y;

        // 开启移动操作
        this.gesturePanEnabled = true;

        return false;
    }
    // 手势平移过程
    function gesturePanMove(offset) {
        // offset 获取移动过程中点在可视区域的坐标
        if (this.gesturePanEnabled) {
            let targetOriginX = ~~(this.gesturePanOrigin.x + offset.x - this.gesturePanFrom.x);
            let targetOriginY = ~~(this.gesturePanOrigin.y +offset.y - this.gesturePanFrom.y);
            this.targetDom.style.transform = `translate(${targetOriginX}px,${targetOriginY}px)`;
        }
        return false;
    }
    // 手势平移结束
    function gesturePanEnd() {
        // $('.selectArea').css('opacity', 0)
        if (this.gesturePanEnabled) {
            let targetRect = this.targetDom.getBoundingClientRect();
            let targetOriginX = targetRect.left - this.containerRect.left;
            let targetOriginY = targetRect.top - this.containerRect.top;


            // 如果图片距离框左边有空白区域
            if (targetOriginX > 0) {
                targetOriginX = 0;
            } else {
                let targetWidth = targetRect.width;
                let containerWidth = this.containerRect.width;
                // 在图片左边隐藏的条件下，如果 右边有空白区域
                if ((targetOriginX + targetWidth) < containerWidth) {
                    targetOriginX = containerWidth - targetWidth;
                }
            }

            if (targetOriginY > 0) {
                targetOriginY = 0;
            } else {
                let targetHeight = targetRect.height;
                let containerHeight = this.containerRect.height;

                if ((targetOriginY + targetHeight) < containerHeight) {
                    targetOriginY = containerHeight - targetHeight;
                }
            }

            this.targetDom.style.transform = `translate(${targetOriginX}px,${targetOriginY}px)`;

            this.gesturePanEnabled = false;
        }

        return false;
    }
    // 手势缩放开始
    function gesturePinchStart(offsets) {
        // 禁用平移功能
        this.gesturePanEnabled = false;
        // 两个点 X轴方向的距离， Y轴方向的距离
        let distanceX = Math.abs(offsets[1].x - offsets[0].x);
        let distanceY = Math.abs(offsets[1].y - offsets[0].y);
        // 两个触摸点的长度值
        this.gesturePinchFrom = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (this.gesturePinchFrom > 0) {

            // 获取拖拽元素的尺寸
            let targetRect = this.targetDom.getBoundingClientRect();

            let centerX = (offsets[0].x + offsets[1].x) * 0.5 - targetRect.left;
            let centerY = (offsets[0].y + offsets[1].y) * 0.5 - targetRect.top;

            // 缩放中心点在原图中的比例
            this.gesturePinchOrigin.x = centerX / targetRect.width;
            this.gesturePinchOrigin.y = centerY / targetRect.height;

            this.gesturePinchSize.width = targetRect.width;
            this.gesturePinchSize.height = targetRect.height;

            this.gesturePinchEnabled = true;
        }

        return false;
    }
    // 手势缩放过程
    //
    function gesturePinchChange(offsets) {
        if (this.gesturePinchEnabled) {

            // 两个点 X轴方向的距离， Y轴方向的距离
            let distanceX = Math.abs(offsets[1].x - offsets[0].x);
            let distanceY = Math.abs(offsets[1].y - offsets[0].y);
            // 触摸过程中，两个触摸点的距离
            let gesturePinchTo = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            // 缩放的比例
            let scale = gesturePinchTo / this.gesturePinchFrom;
            // 设置大小
            let targetWidth = ~~ this.gesturePinchSize.width * scale;
            let targetHeight = ~~ this.gesturePinchSize.height * scale;

            // 获取移动过程中的中心点
            let centerX = ~~((offsets[0].x + offsets[1].x) * 0.5 - this.containerRect.left);
            let centerY = ~~((offsets[0].y + offsets[1].y) * 0.5 - this.containerRect.top);

            let targetOriginX = ~~((centerX - targetWidth * this.gesturePinchOrigin.x));
            let targetOriginY = ~~((centerY - targetHeight * this.gesturePinchOrigin.y));

            this.targetDom.style.width = `${targetWidth}px`;
            this.targetDom.style.height = `${targetHeight}px`;
            this.targetDom.style.transform = `translate(${targetOriginX}px,${targetOriginY}px)`;
        }

        return false;
    }
    // 手势缩放过程
    function gesturePinchEnd() {
        if (this.gesturePinchEnabled) {

            let targetRect = this.targetDom.getBoundingClientRect();
            let targetOriginX = targetRect.left - this.containerRect.left;
            let targetOriginY = targetRect.top - this.containerRect.top;

            let targetWidth = targetRect.width;
            let targetHeight = targetRect.height;

            let dragImgRatio = (targetWidth / targetHeight).toFixed(3);
            //clientWidth 获取节点除边框外的尺寸，没有单位度量
            let showPicAreaRatio = (this.containerDom.clientWidth / this.containerDom.clientHeight).toFixed(3);
            if(dragImgRatio > showPicAreaRatio){
                if(targetHeight < this.containerDom.clientHeight){
                    targetHeight = this.containerDom.clientHeight;
                    targetWidth = ~~(targetHeight * dragImgRatio);
                    targetOriginX = -(targetWidth - this.containerDom.clientWidth)>>1;
                    targetOriginY = 0;
                }
            } else {
                if(targetWidth < this.containerDom.clientWidth){
                    targetWidth = this.containerDom.clientWidth;
                    targetHeight = ~~(targetWidth / dragImgRatio);
                    targetOriginX = 0;
                    targetOriginY = -(targetHeight - this.containerDom.clientHeight)>>1;
                }
            }


            if (targetOriginX > 0) {
                targetOriginX = 0;
            } else {
                let containerWidth = this.containerRect.width;
                if ((targetOriginX + targetWidth) < containerWidth) {
                    targetOriginX = containerWidth - targetWidth;
                }
            }

            if (targetOriginY > 0) {
                targetOriginY = 0;
            } else {
                let containerHeight = this.containerRect.height;
                if ((targetOriginY + targetHeight) < containerHeight) {
                    targetOriginY = containerHeight - targetHeight;
                }
            }
            this.targetDom.style.width = `${targetWidth}px`;
            this.targetDom.style.height = `${targetHeight}px`;
            this.targetDom.style.transform = `translate(${targetOriginX}px,${targetOriginY}px)`;
            this.gesturePinchEnabled = false;
        }

        return false;
    }
    // 绑定事件
    function bindEvents() {
        let self = this;
        if (supportTouch) {
            self.containerDom.ontouchstart = function(evt){ self.gestureTouchStart(evt); return preventEventPropagation(evt); };
            self.containerDom.ontouchmove = function(evt){ self.gestureTouchMove(evt); return preventEventPropagation(evt); };
            self.containerDom.ontouchend = function(evt){ self.gestureTouchEnd(evt); return preventEventPropagation(evt); };
            self.containerDom.ontouchcancel = function(evt){ self.gestureTouchEnd(evt); return preventEventPropagation(evt); };
        } else {
            self.containerDom.onmousedown = function(evt){ self.gestureMouseDown(evt); return preventEventPropagation(evt); };
            self.containerDom.onmousemove = function(evt){ self.gestureMouseMove(evt); return preventEventPropagation(evt); };
            self.containerDom.onmouseup = function(evt){ self.gestureMouseUp(evt); return preventEventPropagation(evt); };
            self.containerDom.onmouseout = function(evt){ self.gestureMouseUp(evt); return preventEventPropagation(evt); };
        }
    }
    // 解绑事件
    function unbindEvents() {
        let self = this;
        if (supportTouch) {
            self.containerDom.ontouchstart = null;
            self.containerDom.ontouchmove = null;
            self.containerDom.ontouchend = null;
        } else {
            self.containerDom.onmousedown = null;
            self.containerDom.onmousemove = null;
            self.containerDom.onmouseup = null;
        }
    }
    // 手势类
    let EZGestureClass = function(containerDom, targetDom){
        this.containerDom = containerDom;
        this.targetDom = targetDom;
        this.gesturePanEnabled = false;    // 平移开关
        this.gesturePanFrom = {x:0, y:0};  // 平移开始时，触摸点在浏览器可视区域的位置
        this.gesturePanOrigin = {x:0, y:0};// 平移开始时，原来的位置
        this.gesturePinchEnabled = false;  // 缩放开关
        this.gesturePinchFrom = 0;   //开始缩放，两个触摸点的距离
        this.gesturePinchOrigin = {x:0, y:0}; // 图片再缩放前，缩放中心点在图片中的比例
        this.gesturePinchSize = {width:0, height:0}; // 开始缩放时  targetDom 的尺寸
        this.containerRect = this.containerDom.getBoundingClientRect(); // containerDom 的尺寸

        this.bindEvents();
    }
    EZGestureClass.prototype.gestureTouchStart = gestureTouchStart;
    EZGestureClass.prototype.gestureTouchMove = gestureTouchMove;
    EZGestureClass.prototype.gestureTouchEnd = gestureTouchEnd;
    EZGestureClass.prototype.gestureMouseDown = gestureMouseDown;
    EZGestureClass.prototype.gestureMouseMove = gestureMouseMove;
    EZGestureClass.prototype.gestureMouseUp = gestureMouseUp;
    EZGestureClass.prototype.gesturePanStart = gesturePanStart;
    EZGestureClass.prototype.gesturePanMove = gesturePanMove;
    EZGestureClass.prototype.gesturePanEnd = gesturePanEnd;
    EZGestureClass.prototype.gesturePinchStart = gesturePinchStart;
    EZGestureClass.prototype.gesturePinchChange = gesturePinchChange;
    EZGestureClass.prototype.gesturePinchEnd = gesturePinchEnd;
    EZGestureClass.prototype.bindEvents = bindEvents;
    EZGestureClass.prototype.unbindEvents = unbindEvents;

    window.EZGesture = EZGestureClass;
})();
