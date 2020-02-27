declare module '*.png' {
    const value: string;
    export = value;
}

declare module '*.jpg' {
    const value: string;
    export = value;
}

declare module '*.svg' {
    const value: string;
    export = value;
}

declare namespace JSX {
    interface IntrinsicElements {
        feDropShadow: any;
    }
}

declare module 'timer-decorator' {
    const timer: any;
    export = timer;
}

declare module 'cytoscape.cjs';
declare module 'cytoscape-dagre';
declare module 'cytoscape-klay';
declare module 'cytoscape-cxtmenu';
declare module 'cytoscape-spread';
declare module 'cytoscape-cola';
declare module 'cytoscape-cose-bilkent';
declare module 'cytoscape-springy';
declare module 'cytoscape-node-resize';
declare module 'konva';
declare module 'jquery';
declare module 'qs';
declare module 'jStat';
declare module 'try-cy';
declare module 'react-horizontal-timeline';
declare module 'react-addons-css-transition-group';
declare module 'react-infinite-scroller'; // ts bugs for @types
declare module 'kld-polynomial';
