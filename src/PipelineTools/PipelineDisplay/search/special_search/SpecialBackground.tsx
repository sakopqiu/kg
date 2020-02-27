import {SpecialSearchDisplayModeCanvasComponent} from './SpecialSearchDisplayModeCanvasComponent';
import {debug} from '../../../../utils';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import klay from 'cytoscape-klay';
import cola from 'cytoscape-cola';
import spread from 'cytoscape-spread';
import coseBilkent from 'cytoscape-cose-bilkent';
import springy from 'cytoscape-springy';

cytoscape.use(dagre);
cytoscape.use(klay); // https://github.com/cytoscape/cytoscape.js-klay
cytoscape.use(spread); // https://github.com/cytoscape/cytoscape.js-klay
cytoscape.use(cola); // https://github.com/cytoscape/cytoscape.js-cola
cytoscape.use(coseBilkent);
cytoscape.use(springy);

export class SpecialBackground extends SpecialSearchDisplayModeCanvasComponent {
    componentWillUnmount() {
        const s = this.mainStore;
        if (s.cy) {
            s.cy.destroy();
            debug('cy is destroyed');
        }
        s.canvasDrawService.miniMapService.setMiniMapVisible(false);
        document.removeEventListener('keydown', this.keyDown, true);
        document.removeEventListener('contextmenu', this.banContextMenu, true);
    }

    componentDidMount() {
        document.addEventListener('keydown', this.keyDown, true);
        document.addEventListener('contextmenu', this.banContextMenu, true);
    }

    // patch for windows
    private banContextMenu = (e: any) => {
        if (e.target && e.target.classList.contains('canvas-context-menu')) {
            e.preventDefault();
            return false;
        }
        return true;
    }

    private keyDown = (e: any) => {
        this.mainStore.canvasDrawService.eventService.keyDown(e);
    }
}
