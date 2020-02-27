import * as React from 'react';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
import classNames from 'classnames';
import '../../../../../common/common.scss';
import './index.scss';
import {DiffDetailsTab} from './DiffDetailsTab/DiffDetailsTab';
import {complexInject} from '../../../../DisplayCanvasUtils';
import {ComplexModeCanvasComponent, ComplexModeCanvasComponentProps} from '../../ComplexModeCanvasComponent';
import {getTranslation} from '../../../../../../utils';

@complexInject
export default class DiffDetailsPanel extends ComplexModeCanvasComponent {

    constructor(props: ComplexModeCanvasComponentProps) {
        super(props);
        this.toggle = this.toggle.bind(this);
    }

    private toggle() {
        this.diffService!.toggleDiffDetailsCollapsed();
    }

    public render() {
        const s = this.diffService;
        const collapsed = s.diffDetailsCollapsed;
        return (
            <div className={classNames('canvas-details-panel diff-details-panel',
                {collapsed})}>
                {collapsed ?
                    <div className='details-title'>
                        <Icon style={{cursor: 'pointer'}} type={'double-left'} onClick={this.toggle}/>
                    </div>
                    :
                    <React.Fragment>
                        <div className='details-title'>
                            <div>
                                {getTranslation(this.locale, 'Version Diff Details')}
                            </div>
                            <Icon style={{cursor: 'pointer'}} type={'double-right'} onClick={this.toggle}/>
                        </div>
                        <DiffDetailsTab data={this.canvasConfig!.diff!.result.inner}/>

                    </React.Fragment>
                }
            </div>
        );
    }
}
