import * as React from 'react';
import {HOVERED_TERMINUS_RADIUS, TERMINUS_RADIUS} from '../../interfaces';
import {disableOsDefault, IPoint} from '../../../../utils';
import './index.scss';
import {Terminus} from '../../../../models/WidgetModel';
import {observer} from 'mobx-react-lite';
import {EditModeCanvasStore} from '../../stores/EditModeCanvasStore';
import {useIsHovered} from '../../../../components/SophonHooks/hookUtils';
import classNames from 'classnames';

export interface TerminusProps {
    position: IPoint;
    terminus: Terminus;
    mainStore: EditModeCanvasStore;
}

function TerminusWidgetFunc(props: TerminusProps) {
    const {x, y} = props.position;
    const mainStore = props.mainStore;
    const terminus = props.terminus;
    const isCandidate = mainStore.isTerminusCandidate(terminus);
    const [isHovered, onMouseEnter, onMouseLeave] = useIsHovered([],
        () => {
            mainStore.setCurrentHoveredTerminus(terminus);
        },
        () => {
            mainStore.setCurrentHoveredTerminus(null);
        },
    );

    return (
        <circle
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onContextMenu={disableOsDefault}
            onMouseUp={(e) => {
                mainStore.clearAllSelections();
                if (e.button === 2) {
                    e.stopPropagation();
                    mainStore.setShowTerminusContextMenu(true);
                    mainStore.setCurrentTerminus(terminus);
                    mainStore.setClickEventPosition({x: e.clientX, y: e.clientY});
                }
            }}
            className={classNames('pipeline-terminus',
                {
                    isHovered,
                    isCandidate,
                    notAllowed: !!mainStore.currentSelectedOutPortWidget && isHovered && !isCandidate,
                })}
            cx={x} cy={y} r={isCandidate || isHovered ? HOVERED_TERMINUS_RADIUS : TERMINUS_RADIUS}
        />
    );

}

export const TerminusWidget = observer(TerminusWidgetFunc);
