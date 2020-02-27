import * as React from 'react';
import {complexInject} from '../../../DisplayCanvasUtils';
import {PositionHandler} from '../../PositionHandler';
import Button from 'antd/es/button';
import 'antd/es/button/style';
import {getTranslation} from '../../../../../utils';
import {NodeShape} from '../../../interfaces';
import {RadioChangeEvent} from 'antd/es/radio';
import {EntitySizeConfigurer} from './EntitySizeConfigurer';
import {NODE_NORMAL_SIZE} from '../../../../common/cytoscapeCommonStyle';
import {ShapeConfigurer} from './ShapeConfigurer';
import {BorderColorConfigurer} from './BorderColorConfigurer';
import {ComplexModeCanvasComponentProps} from '../../../components/complex/ComplexModeCanvasComponent';

export interface NodeStyleConfigurerState {
    size: number;
    shape: NodeShape;
    color: string;
}

@complexInject
export class NodeStyleConfigurer extends PositionHandler<ComplexModeCanvasComponentProps, NodeStyleConfigurerState> {

    constructor(props: ComplexModeCanvasComponentProps) {
        super(props);
        this.state = {
            size: NODE_NORMAL_SIZE,
            shape: 'polygon',
            color: '#35DC57',
        };
    }

    private close = () => {
        this.stateService.closeAllContextMenu();
    }

    private changeSize = (event: RadioChangeEvent) => {
        this.setState({
            size: event.target.value,
        });
    }

    private changeShape = (shape: NodeShape) => {
        this.setState({
            shape,
        });
    }

    private changeColor = (color: string) => {
        this.setState({
            color,
        });
    }

    private applyChanges = () => {
        try {
            this.stateService.elementService.applyNodeStyle(this.state);
        } finally {
            this.stateService.closeAllContextMenu();
        }
    }

    public render() {
        return (
            <div ref={this.ref}
                 style={{
                     left: this.stateService.canvasContextMenuX, top: this.stateService.canvasContextMenuY,
                 }}
                 className='node-style-configurer'>
                <EntitySizeConfigurer locale={this.locale}
                                      onChange={this.changeSize}
                                      value={this.state.size}/>

                <ShapeConfigurer
                    locale={this.locale}
                    onChange={this.changeShape} shape={this.state.shape}/>

                <BorderColorConfigurer locale={this.locale} color={this.state.color} onChange={
                    this.changeColor
                }/>

                <div className='configurer-buttons'>
                    <Button onClick={this.close} size={'small'}>{getTranslation(this.locale, 'Cancel')}</Button>
                    <Button onClick={this.applyChanges} size={'small'} type='primary' style={{marginLeft: 10}}>
                        {getTranslation(this.locale, 'Confirm')}
                    </Button>
                </div>
            </div>
        );
    }
}
