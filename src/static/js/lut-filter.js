/**
 * 目前的纹理图是铺满整个canvas，如果图片的比例和canvas的比例不一致时会出现图片变形
 * */
/**
 *  options 为obj，参数如下
 *  @param el canvas元素或canvas的选择器字符串   必传项
 *  @param oSrc 纹理图的Url  必传项
 *  @param fSrc 滤镜图的Url  必传项
 * */
(function(global,factory){
    // typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    //     typeof define === 'function' && define.amd ? define(factory) :
    //         (global = global || self, global.LutFilter = factory());
    window.LutFilter = factory()
}(window,function () {
    'use strict';
    // 顶点着色器
    var vertexShaderSource = `
        attribute vec4 position;
        attribute vec2 a_texCoordIn;
        varying vec2 v_TexCoordOut;

        void main(void) {
            v_TexCoordOut = a_texCoordIn;
            gl_Position = position;
        }
    `;
    // 片元着色器
    var fragmentShaderSource = `
        precision mediump float;
        varying vec2 v_TexCoordOut;

        uniform sampler2D inputImageTexture;
        uniform sampler2D inputImageTexture2; // lookup texture

        void main()
        {
            vec4 textureColor = texture2D(inputImageTexture, v_TexCoordOut);

            float blueColor = textureColor.b * 63.0;

            vec2 quad1;
            quad1.y = floor(floor(blueColor) / 8.0);
            quad1.x = floor(blueColor) - (quad1.y * 8.0);

            vec2 quad2;
            quad2.y = floor(ceil(blueColor) / 8.0);
            quad2.x = ceil(blueColor) - (quad2.y * 8.0);

            vec2 texPos1;
            texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
            texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);

            vec2 texPos2;
            texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
            texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);

            vec4 newColor1 = texture2D(inputImageTexture2, texPos1);
            vec4 newColor2 = texture2D(inputImageTexture2, texPos2);

            vec4 newColor = mix(newColor1, newColor2, fract(blueColor));
            gl_FragColor = mix(textureColor, vec4(newColor.rgb, textureColor.w), 0.8);
        }
    `;

    // 构造函数
    function LutFilter(options={el:false}){
        if(!(this instanceof LutFilter)){
          return console.error('LutFilter is a constructor and should be called with the `new` keyword')
        }
        this._init(options);
    }
    // 初始化构造函数
    initMixin();
    function initMixin() {
        LutFilter.prototype._init = function (options) {
            var lf = this;
            lf.vertexShaderSource = vertexShaderSource;
            lf.fragmentShaderSource = fragmentShaderSource;
            // 判断传的参数
            lf.options = options;
            if(!lf.options.el){
                return console.error('el is required in options')
            }
            lf.canvas = lf.options.el && query(lf.options.el);

            if(lf.canvas.nodeName !== 'CANVAS') console.error('el is required a canvas element');

            if(!lf.options.oSrc){
                return console.error('纹理图的(oSrc): oSrc is required in options')
            }

            if(!lf.options.fSrc){
                return console.error('滤镜图的(fSrc): fSrc is required in options')
            }

            // let lf = this;
            // lf.canvas.style.width = options.width + 'px' || '400px';
            lf.canvas.width = options.width || 400;
            // lf.canvas.style.height = options.height + 'px' || '300px';
            lf.canvas.height = options.height || 300;
            // 获取canvas绘制上下文
            lf.gl = lf.canvas.getContext('webgl');
            if(lf.gl === null){
                return alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            }

            lf.shaderProgram = initShaders(lf.gl);
            lf.vertexNum = initVertexBuffers(lf.gl, lf.shaderProgram);
            lf.imgTexture = initTexture(lf.gl)
            lf.filterTexture = initTexture(lf.gl)
        };
        /**
         * 更改滤镜
         * */
        LutFilter.prototype.changeFilter = function(filterImg){
            return new Promise((resolve, reject)=>{
                let lf = this;
                let gl = lf.gl;
                if(typeof filterImg === 'string'){
                    let image = new Image();
                    image.onload = function(){
                        gl.activeTexture(gl.TEXTURE1); //激活纹理单元
                        gl.bindTexture(gl.TEXTURE_2D, lf.filterTexture); //绑定纹理对象
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); //将纹理图像分配给纹理对象
                        gl.uniform1i(gl.getUniformLocation(lf.shaderProgram, 'inputImageTexture2'), 1); //将0号纹理传给着色器中的取样器变量
                        setTimeout(function () {
                            image = null;
                        },2000);
                        lf.draw();
                        resolve()
                    }
                    image.onerror = function(){
                        setTimeout(function () {
                            image = null;
                        },2000)
                        reject()
                        return console.error('更改的滤镜图片加载失败')
                    }
                    image.src = filterImg;
                }else if(filterImg.nodeName === 'IMG'){
                    gl.activeTexture(gl.TEXTURE1); //激活纹理单元
                    gl.bindTexture(gl.TEXTURE_2D, lf.filterTexture); //绑定纹理对象
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, filterImg); //将纹理图像分配给纹理对象
                    gl.uniform1i(gl.getUniformLocation(lf.shaderProgram, 'inputImageTexture2'), 1); //将0号纹理传给着色器中的取样器变量
                    lf.draw();
                    resolve()
                }else{
                    console.error('filterImg不是path或image实例')
                }
            })
        }
        LutFilter.prototype.draw = function () {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT); // Clear <canvas>
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexNum); // Draw the rectangle
        }
        LutFilter.prototype.loadTextureImg = function (){
            return Promise.all([this.imgTexture.loadImg(this.options.oSrc,'imgTexture',this.gl,this.shaderProgram),this.filterTexture.loadImg(this.options.fSrc,'filterTexture',this.gl,this.shaderProgram)]).then(()=>{
                    this.draw();
                    return true;
            })
        }
        /**
         * 导出图片
         * */
        LutFilter.prototype.exportCanvas = function () {
           return this.canvas
        }
    }

    /**
     * Query an element selector if it's not an element already.
     */
    function query (el) {
        if (typeof el === 'string') {
            var selected = document.querySelector(el);
            if (!selected) {
                console.error(
                    'Cannot find element: ' + el
                );
                return null
            }
            return selected
        } else{
            return el
        }
    }
    /**
     * 初始化着色器程序
     * */
    function initShaders(gl) {
        var vertexShader = getShader(gl, 'shader-vs');
        var fragmentShader = getShader(gl, 'shader-fs');

        // 创建着色器程序并绑定编译好的顶点着色器和片元着色器
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        // 链接着色器程序
        gl.linkProgram(shaderProgram);

        // 检查着色器是否成功链接
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            return null;
        }
        // 链接成功后激活渲染器程序
        gl.useProgram(shaderProgram);
        return shaderProgram;
    }

    /**
     * 编译着色器并返回
     * */
    function getShader(gl,type) {
        var shader;

        // 创建顶点着色器或片段着色器
        if (type === 'shader-fs') {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            // 编译着色器代码
            gl.shaderSource(shader, fragmentShaderSource);
        } else if (type === 'shader-vs') {
            shader = gl.createShader(gl.VERTEX_SHADER);
            // 编译着色器代码
            gl.shaderSource(shader, vertexShaderSource);
        } else {
            return null; // 非法类型返回null
        }

        gl.compileShader(shader);

        // 检查是否编译成功
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return null;
        }

        return shader;
    }
    /**
     * 初始化顶点 位置,纹理信息
     * */
    function initVertexBuffers(gl,shaderProgram) {
        //顶点坐标和纹理坐标映射关系
        var datas = new Float32Array([
            //顶点坐标、纹理坐标
            -1.0, 1.0, 0.0, 0.0,
            -1.0, -1.0, 0.0, 1.0,
            1.0, 1.0, 1.0, 0.0,
            1.0, -1.0, 1.0, 1.0,
        ]);

        var num = 4; //顶点数目
        var size = datas.BYTES_PER_ELEMENT; //数组中的每个元素的大小（以字节为单位）
        var vertexBuffer = gl.createBuffer(); //创建缓冲区对象
        if (!vertexBuffer) {
            console.error('Failed to create the buffer object!');
            return -1;
        }

        //将缓冲区对象绑定到目标并写入数据
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, datas, gl.STATIC_DRAW);

        //告诉显卡从当前绑定的缓冲区中读取顶点坐标和纹理坐标数据
        var a_Position = gl.getAttribLocation(shaderProgram, 'position');
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, size * 4, 0);
        gl.enableVertexAttribArray(a_Position);

        /**
         * vertexAttribPointer(index, size, type, normalized, stride, offset)
         * index 变量索引
         * size 变量大小
         * type 变量类型
         * normalized 是否归一化
         * stride 读取划分大小
         * offset 读取偏移
         *
         * gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, size * 4, 0);
         * 意味着从缓冲区中读取 a_Position 变量数据，该变量读取 2 位缓冲区，类型为浮点数，不归一化，每 4 位读取一次，偏移为 0
         */

        var a_TexCoord = gl.getAttribLocation(shaderProgram, 'a_texCoordIn');
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, size * 4, size * 2);
        gl.enableVertexAttribArray(a_TexCoord);

        return num;
    }
    /**
     * 初始化多个纹理
     * */
    function initTexture(gl) {
        var texture = gl.createTexture(); //创建纹理对象

        if (!texture) {
            console.error('Failed to create the texture object!');
            return false;
        }
        /**
         * @param imgSrc  纹理图片
         * @param textureType  纹理类型
         * @return promise
         * */
        texture.loadImg = function (imgSrc,textureType,gl,shaderProgram) {
            var self = this;
            return new Promise((resolve,reject)=>{
                var activeTexture; // 激活的纹理  例如： gl.texture0
                var sendTextureNum; // 将sendTextureNum 纹理传给着色器中的取样器变量
                var shaderVariable;
               //1.对纹理图像进行Y轴反转
                if(textureType === 'imgTexture'){
                    activeTexture = gl.TEXTURE0;
                    sendTextureNum = 0;
                    shaderVariable = gl.getUniformLocation(shaderProgram, 'inputImageTexture');
                }else if(textureType === 'filterTexture'){
                    activeTexture = gl.TEXTURE1;
                    sendTextureNum = 1;
                    shaderVariable = gl.getUniformLocation(shaderProgram, 'inputImageTexture2');
                }else{
                    return reject('纹理类型错误')
                }
                if(typeof imgSrc === 'string'){
                    let image = new Image();
                    image.src = imgSrc;
                    image.onload = function () {
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
                        gl.activeTexture(activeTexture); //激活纹理单元
                        gl.bindTexture(gl.TEXTURE_2D, self); //绑定纹理对象

                        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                            // Yes, it's a power of 2. Generate mips.
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //配置纹理对象的参数
                            // gl.generateMipmap(gl.TEXTURE_2D);
                        } else {
                            // No, it's not a power of 2. Turn of mips and set
                            // wrapping to clamp to edge
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                        }

                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); //将纹理图像分配给纹理对象

                        gl.uniform1i(shaderVariable, sendTextureNum); //将0号纹理传给着色器中的取样器变量
                        resolve()
                    }
                    image.onerror = function () {
                        return reject('texture图片加载失败')
                    }

                }else if(imgSrc.tagName === 'IMG' || imgSrc.tagName === 'CANVAS'){
                    gl.activeTexture(activeTexture); //激活纹理单元
                    gl.bindTexture(gl.TEXTURE_2D, self); //绑定纹理对象

                    if (isPowerOf2(imgSrc.width) && isPowerOf2(imgSrc.height)) {
                        // Yes, it's a power of 2. Generate mips.
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //配置纹理对象的参数
                        // gl.generateMipmap(gl.TEXTURE_2D);
                    } else {
                        // No, it's not a power of 2. Turn of mips and set
                        // wrapping to clamp to edge
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    }

                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imgSrc); //将纹理图像分配给纹理对象

                    gl.uniform1i(shaderVariable, sendTextureNum); //将0号纹理传给着色器中的取样器变量
                    resolve()
                }
            })
        }
        return texture
    }
    /**
     * 判断纹理的尺寸是否是2的幂次方
     * */
    function isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }

    return LutFilter
}));
