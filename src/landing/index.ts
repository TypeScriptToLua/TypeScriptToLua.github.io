import "../../assets/styles/landing.scss";
import "highlight.js/styles/vs2015.css";

import { configure, highlightBlock } from "highlight.js";

configure({ languages: ["typescript", "lua"] });

document.querySelectorAll(".example-item").forEach(highlightBlock);
