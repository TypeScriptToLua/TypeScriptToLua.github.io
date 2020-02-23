// @ts-ignore
import Prism from "prism-react-renderer/prism";

(globalThis as any).Prism = Prism;
require("prismjs/components/prism-lua");
(globalThis as any).Prism = undefined;
