import BridgeParam from "./BridgeParam";

// 从相册或拍照获取:
const types = {
    imageCamera: 'imageCamera',
    imageAlbum: 'imageAlbum',
    videoCamera: 'videoCamera'//选取拍照视频
};

const cameraPositions = {
    front: '0',
    back: '1'
};

export default class EventCameraParam extends BridgeParam {
  /*
    type 模式: imageCamera-相机 imageAlbum-相册 videoCamera-视频
    cameraPosition： 用前置后置摄像头
    filterId：滤镜id、categoryId：分栏id、stickerId：贴纸id，collageId：比例id(一般不用)
    autoDownload：选择的贴纸是否自动下载(一般固定为true)
  */
    constructor({type = '', cameraPosition = '0', filterId = undefined, categoryId = undefined, stickerId = undefined, collageId = undefined} = {}) {
        super()
        if (!types[type]) throw `[illegal type] ${type}`
        this.type = type
        this.cameraPosition = cameraPosition
        this.filterId = filterId
        this.categoryId = categoryId
        this.stickerId = stickerId
        this.collageId = collageId
        this.autoDownload = 'true'
    }

    static get types() {
        return types
    }

    static get cameraPositions() {
        return cameraPositions
    }
}
