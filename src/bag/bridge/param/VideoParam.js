import BridgeParam from "./BridgeParam";

export default class VideoParam extends BridgeParam {
  constructor({maxDuration = 15, maxResolution = 1080} = {}) {
    super()
    this.maxDuration = maxDuration
    this.maxResolution = maxResolution
  }
}
