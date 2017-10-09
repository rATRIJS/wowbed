import WithDimensions from "./with-dimensions";
import WithHtml from "./with-html";

interface Video extends WithDimensions, WithHtml {
    // nothing else
}

export { Video };

export default Video;