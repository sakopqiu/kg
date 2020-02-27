import * as React from 'react';
import {complexInject} from '../../../DisplayCanvasUtils';
import {getTranslation} from '../../../../../utils';
import {TalkIcon} from '../../../../../icons/TalkIcon';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../components/complex/ComplexModeCanvasComponent';
import {HoverButtons} from './HoverButtons';

@complexInject
export class CytoHoverButtons extends ComplexModeCanvasComponent {

    public constructor(props: ComplexModeCanvasComponentProps) {
        super(props);
        this.showCommunityPanel = this.showCommunityPanel.bind(this);
    }

    private showCommunityPanel() {
        this.stateService.closeAllContextMenu();
        this.stateService!.setShowCommunityPanel(true);
    }

    showSettingPanel = () => {
        this.stateService.closeAllContextMenu();
        this.stateService!.setShowSettingPanel(true);
    }

    get communityExplorationButton() {
        return {
            icon: <TalkIcon />,
            title: getTranslation(this.locale, 'Community Exploration'),
            onClick: this.showCommunityPanel,
        };
    }

    get upperHoverButtons() {
        return (this.canvasConfig.displayModeConfig!.hoverButtons || []).concat(this.communityExplorationButton);
    }

    get lowerHoverButtons() {
        return this.canvasConfig.displayModeConfig!.lowerHoverButtons || [];
    }

    public preprocessOnClick = () => {
        this.stateService.closeAllContextMenu();
    }

    public render() {

        return (
            <HoverButtons
                upperHoverButtons={this.upperHoverButtons}
                lowerHoverButtons={this.lowerHoverButtons}
                preprocessOnClick={this.preprocessOnClick}
            />
        );
    }
}
