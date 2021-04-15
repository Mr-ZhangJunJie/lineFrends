export default class VideoResult {
  constructor(videoPath, success){
    this.videoPath = videoPath
    this.success = success
  }
  static from (result) {
    const {videoPath, success} = JSON.parse(result)
    return new VideoResult(videoPath, success)
  }
}
