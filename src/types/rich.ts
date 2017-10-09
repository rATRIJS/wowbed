import WithDimensions from "./with-dimensions";
import WithHtml from "./with-html";

interface Rich extends WithDimensions, WithHtml {
    // nothing else
}

export { Rich };

export default Rich;