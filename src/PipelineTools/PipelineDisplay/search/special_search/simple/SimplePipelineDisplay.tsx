import * as React from 'react';
import {observer} from 'mobx-react';
import {ContainerId, ISimpleDisplayModeContext} from '../../../interfaces';
import {SimpleDisplayModeCanvasConfigProvider} from '../../../DisplayCanvasUtils';
import {SimpleCanvasBackground} from './SimpleCanvasBackground';
import '../../../../common/common.scss';
import '../../canvas.scss';
import './index.scss';
import {runInAction} from 'mobx';
import SimpleDisplayModeTopToolBar from './SimpleDisplayModeTopToolBar';
import {RelationFilter} from './RelationFilter/RelationFilter';
import {SpecialDisplay} from '../SpecialDisplay';
import DetailsPanel from '../../../right/DetailsPanel/DetailsPanel';
import classNames from 'classnames';

export const SIMPLE_PIPELINE_ID = 'SIMPLE_PIPELINE_ID';

@observer
export class SimplePipelineDisplay extends SpecialDisplay<ISimpleDisplayModeContext> {

    get pipelineId() {
        return SIMPLE_PIPELINE_ID;
    }

    get containerId() {
        return ContainerId.simple;
    }

    async componentWillMount() {
        await super.componentWillMount();
        const canvasStore = this.props.mainStore;
        canvasStore.canvasDrawService.onFindPath = this.props.callbacks && this.props.callbacks.onFindPathConfirm;
    }

    public render() {
        const cyState = this.cyState;
        return (
            <SimpleDisplayModeCanvasConfigProvider value={this.props}>
                <div className={`pipelinetool-display-wrapper ${this.props.className || ''}`}
                     style={{...(this.props.style || {}), flexDirection: 'row'}}>
                    <div className='pipelinetool-canvas'
                         style={{width: this.mainStore.canvasWidth}}
                    >
                        <div className='drawing-context-wrapper' style={{width: '100%'}}>
                            {this.props.extraLoading || ''}
                            {this.mounted && <SimpleDisplayModeTopToolBar/>}
                            {this.mounted && <SimpleCanvasBackground/>}
                            {this.mounted &&
                            <div
                                className={classNames('simple-toolbox-area', {hideToolBox: !this.mainStore.showToolbox})}>
                                {this.props.extraContent || null}
                                {this.mainStore.showToolbox && <RelationFilter
                                    edgeFilterConditions={cyState.edgeFilterConditions}
                                    onSelectedAttributesChanged={(attrs) => {
                                        // 选择某些时间属性也许不会触发重绘，因为那条边不一定在图上
                                        // 但是为了历史记录中不出现奇怪的感觉，强制重绘并产生一条历史
                                        runInAction(() => {
                                            cyState.setEdgeFilterConditions(attrs);
                                            cyState.forceReRender();
                                        });
                                    }}
                                    locale={this.locale}
                                    schema={this.mainStore.displayModePipelineSchema}
                                />
                                }
                            </div>
                            }
                        </div>
                    </div>
                    {this.mounted && <DetailsPanel mainStore={this.mainStore} locale={this.locale}/>}
                </div>
            </SimpleDisplayModeCanvasConfigProvider>
        );
    }
}
