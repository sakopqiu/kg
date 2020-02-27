import {SectionChild, SectionChildType} from '../../interfaces';
import {Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import './index.scss';
import * as React from 'react';
import GridPng from './pngs/Grid.png';
import DagrePng from './pngs/Dagre.png';
import CirclePng from './pngs/Circle.png';
import ConcentricPng from './pngs/Concentric.png';
import BFSPng from './pngs/BFS.png';
import CosePng from './pngs/Cose.png';
import CoseBilkentPng from './pngs/CoseBilkent.png';
import KlayPng from './pngs/Klay.png';
import SpreadPng from './pngs/Spread.png';
import ColaPng from './pngs/Cola.png';
import {complexInject} from '../../DisplayCanvasUtils';
import {LayoutConfigs} from '../../CanvasDrawUtils';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../components/complex/ComplexModeCanvasComponent';

export function layoutSection2(locale: Locales, s: StatusService): SectionChild[] {
    return [
        {
            type: SectionChildType.CUSTOM,
            render: () => {
                return (
                    <div key='layout-section2-widgets' className='layout-section2-widgets'>
                        <LayoutWidget key={'grid'} img={GridPng} name={'Grid'} title={'Grid'}/>
                        <LayoutWidget key={'dagre'} img={DagrePng} name={'Dagre'} title={'Dagre'}/>
                        <LayoutWidget key={'circle'} img={CirclePng} name={'Circle'} title={'Circle'}/>
                        <LayoutWidget key={'concentric'} img={ConcentricPng} name={'Concentric'} title={'Concentric'}/>
                        <LayoutWidget key={'bfs'} img={BFSPng} name={'BFS'} title={'BFS'}/>
                        <LayoutWidget key={'cose'} img={CosePng} name={'Cose'} title={'Cose'}/>
                        <LayoutWidget key={'coseBilkent'} img={CoseBilkentPng} name={'Cose-bilkent'} title={'Bilkent'}/>
                        <LayoutWidget key={'klay'} img={KlayPng} name={'Klay'} title={'Klay'}/>
                        <LayoutWidget key={'spread'} img={SpreadPng} name={'Spread'} title={'Spread'}/>
                        <LayoutWidget key={'cola'} img={ColaPng} name={'Cola'} title={'Cola'}/>
                    </div>
                );
            },
        },
    ];
}

interface LayoutWidgetProps extends ComplexModeCanvasComponentProps {
    img: string;
    name: string;
    title: string;
}

@complexInject
class LayoutWidget extends ComplexModeCanvasComponent<LayoutWidgetProps> {

    private onClick = () => {
        const val = LayoutConfigs.find((config) => config.name === this.props.name)!.value;
        this.stateService.elementService.changeLayout(val);
    }

    render() {
        return (
            <div className='layout-section-widget' onClick={this.onClick}>
                <img src={this.props.img}/>
                <span>{this.props.title}</span>
            </div>
        );
    }
}
