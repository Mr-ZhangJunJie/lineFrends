import BrowserChecker from "./tools/BrowserChecker"
import NullBridge from "./NullBridge"
import AndroidBridge from "./AndroidBridge"
import IosBridge from "./IosBridge"

class BridgeFactory {
    static getBridge() {
        if (BrowserChecker.isIos()) {
            return new IosBridge()
        } else if (window.FoodieBridgeInterface != undefined && BrowserChecker.isAndroid()) {
        // } else if (window.B612KajiBridgeInterface != undefined && BrowserChecker.isAndroid()) {
            return new AndroidBridge()
        } else {
            return new NullBridge()
        }
    }
}
const Bridge = BridgeFactory.getBridge();
export default Bridge
