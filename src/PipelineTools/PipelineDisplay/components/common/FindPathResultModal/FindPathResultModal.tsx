import * as React from 'react';
import './index.scss';
import {runInAction} from 'mobx';
import className from 'classnames';
import {AddMixtureType, CyState} from '../../../model/CyState';
import {DisplayModePipelineSchema} from '../../../interfaces';
import {getTranslation, Locales, showMessage} from '../../../../../utils';
import {CyAssortedInnerPath} from '../../../model/CyFindPathBeaconEdge';
import {CyEdge} from '../../../model/CyEdge';
import {CyNode} from '../../../model/CyNode';
import {usePositionHandlerHook} from '../../../context_menu/PositionHandler';
import {DisplayModeCanvasStore} from '../../../stores/DisplayModeCanvasStore';
import {SophonModal} from '../../../../../components/SophonModal';
import {SuperSimpleDisplayCanvas} from '../SuperSimpleDisplayCanvas/SuperSimpleDisplayCanvas';

export interface FindPathResultMenuProps {
    parentCyState: CyState;
    schema: DisplayModePipelineSchema;
    locale: Locales;
}

export const FIND_PATH_ID = 'find-path-id';

function redrawOnCanvas(cyState: CyState, assortedPath: CyAssortedInnerPath) {
    runInAction(() => {
        cyState.clearAll();
        // assortedInnerPath的一条路径可能包含多组子路径，子路径可能包含重复边
        const clonedEdgesMap: Map<string, CyEdge> = new Map<string, CyEdge>();
        const clonedNodes: CyNode[] = [];
        for (const e of assortedPath.edges) {
            if (!clonedEdgesMap.has(e.data.id)) {
                clonedEdgesMap.set(e.data.id, CyEdge.fromJSON(e, cyState));
            }
        }
        for (const n of assortedPath.vertices) {
            const clonedNode = CyNode.fromJSON(n, cyState);
            clonedNode.data.parent = '';
            clonedNodes.push(clonedNode);
        }

        cyState.addNormalNodesEdges({
            type: AddMixtureType.NORMAL,
            nodes: clonedNodes,
            edges: Array.from(clonedEdgesMap.values()),
            extraLayoutConfig: {
                fit: true,
                padding: 80,
                name: 'klay',
                spacingFactor: 2,
            },
            paths: [],
            pathResultHack: true,
        });
    });
}

export function FindPathResultModal(props: FindPathResultMenuProps) {
    const parentCyState = props.parentCyState;
    const drawService = parentCyState.drawService;
    const stateService = drawService.stateService;
    const ref = usePositionHandlerHook(drawService);
    const inited = React.useRef<boolean>(false);
    const cyStateRef = React.useRef<CyState>();

    const beaconEdgeData = parentCyState.cyFindPathBeaconEdge(stateService.canvasContextFindPathEdge!.id)!.data;
    const locale = props.locale;

    const [cursor, setCursor] = React.useState(0);

    React.useEffect(() => {
        if (inited.current) {
            redrawOnCanvas(cyStateRef.current!, beaconEdgeData.assortedInnerPaths[cursor]);
        }
    }, [cursor]);

    const lastCursor = beaconEdgeData.assortedInnerPaths.length - 1;
    return (
        <SophonModal
            className='find-path-result-modal'
            noShadow
            height={500}
            title={getTranslation(locale, 'Path Search Result')}
            showState={true}
            locale={locale}
            fref={ref}
            footer={null}
            draggble
            cancelOption={{
                showCross: true,
                onCancel() {
                    stateService.setShowFindPathResultModal(false);
                },
            }}
            style={{
                left: stateService.canvasContextMenuX, top: stateService.canvasContextMenuY,
            }}
            bodyStyle={{
                padding: 0,
                position: 'relative',
            }}
        >
            <div className='find-path-result-modal-header'>
                <div className='find-path-result-modal-header-left'>
                    <div>
                        {getTranslation(locale, 'Current Path')}:
                        <span><span style={{
                            color: '#549BE7',
                            marginLeft: 10,
                        }}>{cursor + 1}</span>/{lastCursor + 1}</span>
                    </div>
                </div>
                <div className='find-path-result-modal-header-right'>
                    <span
                        className={className('prev-or-next', {
                            disabled:
                            cursor === 0,
                        })}
                        onClick={() => {
                            if (cursor > 0) {
                                setCursor(cursor - 1);
                            }
                        }}
                    >

                        &lt; {getTranslation(locale, 'Prev')}
                     </span>
                    <span
                        onClick={() => {
                            if (cursor < lastCursor) {
                                setCursor(cursor + 1);
                            }
                        }}
                        className={className('prev-or-next', {
                            disabled:
                            cursor === lastCursor,
                        })}
                        style={{
                            marginLeft: 20,
                        }}>
                        {getTranslation(locale, 'Next')} &gt;
                    </span>
                </div>
            </div>
            <SuperSimpleDisplayCanvas
                useCaseName={FIND_PATH_ID}
                schema={props.schema}
                afterRendering={(store: DisplayModeCanvasStore, isFirstTime: boolean) => {
                    if (isFirstTime) {
                        cyStateRef.current = store.canvasDrawService.cyState;
                        redrawOnCanvas(cyStateRef.current!, beaconEdgeData.assortedInnerPaths[0]);
                        inited.current = true;
                    }
                }}
            />
            <div className='add-to-canvas-button' onClick={() => {
                stateService.setShowFindPathResultModal(false);
                setTimeout(() => {
                    const names = parentCyState.addFindPathEntry({
                        type: AddMixtureType.FIND_PATH_ENTRY,
                        beaconEdgeData,
                        assortedPath: beaconEdgeData.assortedInnerPaths[cursor],
                        nodes: [],
                        edges: [],
                    });
                    if (names) {
                        showMessage(getTranslation(locale,
                            'Expand Community First', {names}));

                    }
                }, 200);
            }}>
                {getTranslation(locale, 'Add To Canvas')}
            </div>
        </SophonModal>

    );

}
