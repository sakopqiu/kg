import {CanvasDrawService} from '../../../service/CanvasDrawService';
import {showDiffDetailsModal} from './PipelineDiffUtils';

export class PipelineDiffEventManager {
    constructor(public service: CanvasDrawService) {
    }

    get diffService() {
        return this.service.diffService;
    }

    public onBackgroundClicked = (e: any) => {
        if (e.target !== this.diffService.diffCy) {
            return;
        }
        this.hideDiffModal();
    }

    public hideDiffModal = () => {
        this.diffService.setCurrentSelectedDiffObj(undefined);
    }

    public onTapped = (e: any) => {
        showDiffDetailsModal(e.target, this.service, false);
    }
}
