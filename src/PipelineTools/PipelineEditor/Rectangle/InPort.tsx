import * as React from 'react';
import {computed} from 'mobx';
import {editCanvasInject} from '../EditCanvasUtils';
import {WidgetModel} from '../../../models/WidgetModel';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';
import {PipelineLink} from '../../../models/LinkModel';
import {EditModeCanvasStore} from '../stores/EditModeCanvasStore';
import {observer as HookObserver} from 'mobx-react-lite';

interface IInPortProps extends IEditModeCanvasComponentProps {
    widget: WidgetModel;
    parentWidth: number;
    parentCornerRadius: number;
    portRadius: number;
}

@editCanvasInject
export default class InPorts extends EditModeCanvasComponent<IInPortProps> {
    constructor(props: IInPortProps) {
        super(props);
    }

    // 当前的这个Widget上有多少线连了进来
    @computed
    get allLinks() {
        return this.currentActiveStore!.allInBoundLinksFor(this.props.widget);
    }

    render() {
        const {widget, parentWidth, parentCornerRadius} = this.props;
        const portPositions = this.currentActiveStore!.inPortsPositions(widget, parentWidth, parentCornerRadius);
        const isCandidate = this.currentActiveStore!.isWidgetCandidate(widget);

        const boundInPorts = this.allLinks.map((link, index) => {
            return <InPort
                widget={this.props.widget}
                link={link}
                key={link.id}
                store={this.currentActiveStore!}
                portRadius={this.props.portRadius}
                x={portPositions.get(link.id)!}
            />;
        });

        const candidatePort = isCandidate && <InPort
            widget={this.props.widget}
            key={'candidate'}
            store={this.currentActiveStore!}
            portRadius={this.props.portRadius}
            x={portPositions.get('candidate')!}
        />;

        return <>
            {boundInPorts}
            {candidatePort}
        </>;
    }
}

export interface InPortProps {
    link?: PipelineLink; // 如果该属性为空表明widget未被绑定，如果不为空表明被绑定了
    widget: WidgetModel; // 某个inport所属于的widget
    store: EditModeCanvasStore;
    portRadius: number;
    x: number;
}

function InPortFunc(props: InPortProps) {

    const {store, link, widget, portRadius} = props;
    const isBound = !!link;

    const isCandidate = store.isWidgetCandidate(widget);
    const showBigIcon = !isBound && isCandidate;
    return (
        <React.Fragment>
            {showBigIcon ? <circle
                    className='big-icon inport'
                    onMouseEnter={() => {
                        store.setCurrentHoveredInPort(props.widget);
                    }}
                    onMouseLeave={() => {
                        store.setCurrentHoveredInPort(null);
                    }}
                    cx={props.x} cy={0} r={portRadius + 6}/>
                : <circle className='inport' cx={props.x} cy={0} r={1}/>
            }
        </React.Fragment>
    );
}

const InPort = HookObserver(InPortFunc);
