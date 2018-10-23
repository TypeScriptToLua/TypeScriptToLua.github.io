import '../../assets/styles/landing.scss';
import 'highlight.js/styles/vs2015.css';

import {configure, highlightBlock} from 'highlight.js';

configure({languages: ["typescript", "lua"]});

document.addEventListener('DOMContentLoaded', () => {
    let codeBlocks = document.getElementsByClassName('example-item');
    for (let i = 0; i < codeBlocks.length; i++) {
        highlightBlock(codeBlocks[i]);
    }
});