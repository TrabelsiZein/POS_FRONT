import Vue from 'vue';

const layoutState = Vue.observable({
    colSize: 12
});

function updateColSize() {
    const width = window.innerWidth;
    console.log(`Window width: ${width}px`);

    if (width >= 1550) layoutState.colSize = 3;
    else if (width >= 1350) layoutState.colSize = 4;
    else if (width >= 800) layoutState.colSize = 6;
    else layoutState.colSize = 12;
}

window.addEventListener('resize', updateColSize);
updateColSize(); // initial

export default layoutState;
