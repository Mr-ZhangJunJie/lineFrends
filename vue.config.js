'use strict'
const path = require('path')
// const vConsolePlugin = require('vconsole-webpack-plugin'); // 引入 移动端模拟开发者工具 插件 （另：https://github.com/liriliri/eruda）
const CompressionPlugin = require('compression-webpack-plugin'); //Gzip
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; //Webpack包文件分析器

function resolve(dir) {
  return path.join(__dirname, dir)
}

// You can change the port by the following method:
// port = 9527 npm run dev OR npm run dev --port = 9527
const port = process.env.port || process.env.npm_config_port || 8082 // dev port
let str = process.env.ENV === 'production' ? 'release' : 'beta'
console.log(`process.env===>  port: ${port} - ${str}; process.env.ENV: ${process.env.ENV}`)
// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: './',
  outputDir: `dist/${str}`,//在vue ui模式无效，在命令行已追加dest
  assetsDir: './static',
  // eslint-loader 是否在保存的时候检查
  lintOnSave: process.env.NODE_ENV === 'development',
  //生产环境是否生成 sourceMap 文件，一般情况不建议打开
  productionSourceMap: false,
  //以多页模式构建应用程序。
	pages: undefined,
	//是否使用包含运行时编译器的 Vue 构建版本
	runtimeCompiler: false,
  //调整 webpack 配置 https://cli.vuejs.org/zh/guide/webpack.html#%E7%AE%80%E5%8D%95%E7%9A%84%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F
	configureWebpack: config => {

    config.module.rules = [...config.module.rules,
      // html-withimg-loader
      {
        test: /\.(htm|html)$/i,
        use:['html-withimg-loader']
      }
    ]
    // config.plugins.push(
    //   new vConsolePlugin({
    //     filter: [], // 需要过滤的入口文件
    //     enable: true // 发布代码前记得改回 false
    //   })
    // )
    // 为生产环境修改配置
		if(process.env.NODE_ENV !== 'development') {
      // 去除console
      if(process.env.ENV == 'production') {
        // 去掉console
        config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
        // 专门打开一个页面解析代码大小
        // config.plugins.push(new BundleAnalyzerPlugin())
      } else {
        // config.plugins.push(
        //   new vConsolePlugin({
        //     filter: [], // 需要过滤的入口文件
        //     enable: false // 发布代码前记得改回 false
        //   })
        // )
      }
      //文件开启Gzip，也可以通过服务端(如：nginx)(https://github.com/webpack-contrib/compression-webpack-plugin)
			config.plugins.push(new CompressionPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$', ),
        threshold: 8192,
        minRatio: 0.8,
      }))

		} else {
			// 为开发环境修改配置...
      // config.plugins.push(
      //   new vConsolePlugin({
      //     filter: [], // 需要过滤的入口文件
      //     enable: true // 发布代码前记得改回 false
      //   })
      // )
		}
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    // name: name,
    // config.resolve.alias = {
    //   alias: {
    //     '@': resolve('src')//默认已加入这个别称
    //   }
    // }
	},
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    // 接口代理
    // proxy: {
    //   '/api': {
    //     // target: `http://127.0.0.1:${port}/mock`,
    //     target: `http://dev-zepeto-global-server-ncl.nfra.io`,
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/api': '/'
    //     }
    //   }
    // },
  },
  //对内部的 webpack 配置进行更细粒度的修改 https://github.com/neutrinojs/webpack-chain see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack(config) {
    /**
		 * 删除懒加载模块的prefetch，降低带宽压力
		 * https://cli.vuejs.org/zh/guide/html-and-static-assets.html#prefetch
		 * 而且预渲染时生成的prefetch标签是modern版本的，低版本浏览器是不需要的
		 */
    config.plugins.delete('preload') // TODO: need test
    config.plugins.delete('prefetch') // TODO: need test
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()
      // 修改 html-webpack-plugin 引入模板的路径
    config
      .plugin('html')
      .tap(args => {
        args[0].template = path.resolve(__dirname, './src/index.html')
        return args
      })
      .end()
    // config
    //   .when(process.env.NODE_ENV == 'staging',
    //     config => config.devtool('cheap-source-map')
    //   )
    //   .end()
    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          // 图片压缩
          config.module
            .rule('images')
            .use('image-webpack-loader')
            .loader('image-webpack-loader')
            .options({
                mozjpeg: {
                  progressive: true,
                  quality: 80
                },
                // optipng.enabled: false will disable optipng
                optipng: {
                  enabled: true,
                },
                pngquant: {
                  quality: '65-90',
                  speed: 4
                },
                gifsicle: {
                  interlaced: false,
                },
                // webp: {
                //   quality: 90
                // }
            })
            .end()
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          .end()
          config.optimization.runtimeChunk('single')
          .end()
        }
      )
  }
}
