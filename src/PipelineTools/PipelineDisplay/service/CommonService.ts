import {CanvasDrawService} from './CanvasDrawService';

export class CommonService {
    constructor(public drawService: CanvasDrawService) {
    }

    get simpleMode() {
        return this.drawService.simpleMode;
    }

    get cy() {
        return this.drawService.cy;
    }

    get cyState() {
        return this.drawService.cyState;
    }

    get dataDriverProcessor() {
        return this.drawService.dataDriverProcessor;
    }

    get mainStore() {
        return this.drawService.canvasStore.parent;
    }

    get elementService() {
        return this.drawService.elementService;
    }

    get historyService() {
        return this.drawService.historyService;
    }

    get algorithmService() {
        return this.drawService.algoService;
    }

    get eventService() {
        return this.drawService.eventService;
    }

    get communityService() {
        return this.drawService.communityService;
    }

    get selectionService() {
        return this.drawService.selectionService;
    }

    get serializationService() {
        return this.drawService.serializationService;
    }

    get statsService() {
        return this.drawService.statsService;
    }

    get helperService() {
        return this.drawService.helperService;
    }

    get statusService() {
        return this.drawService.statusService;
    }

    get miniMapService() {
        return this.drawService.miniMapService;
    }

    get diffService() {
        return this.drawService.diffService;
    }

    get timeFilterService() {
        return this.drawService.timeFilterService;
    }

    get stateService() {
        return this.drawService.stateService;
    }
}
