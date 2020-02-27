import * as React from 'react';
import classNames from 'classnames';
import {ValueInput} from '../../../components/FormElements/ValueInput';
import {ValueSelector} from '../../../components/FormElements/ValueSelector';
import {ValueTextArea} from '../../../components/FormElements/ValueTextArea';
import {editCanvasInject, rightPanelWidth} from '../EditCanvasUtils';
import {getTranslation, KEY_VALUE_SEPARATOR} from '../../../utils';
import {IWidgetParamDef, ValueStyle, ILinkParamDef, USE_DEFAULT_BEHAVIOR} from '../interfaces';
import '../../PipelineDisplay/right/DetailsPanel/index.scss';
import {ConfirmableValueInput} from '../components/ConfirmableValueInput';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';
import {ValueLabel} from '../../../components/FormElements/ValueLabel';
import uuidv1 from 'uuid/v1';
import {computed} from 'mobx';
import _get from 'lodash/get';

@editCanvasInject
export default class WidgetDetailsPanel extends EditModeCanvasComponent {

    constructor(props: IEditModeCanvasComponentProps) {
        super(props);
        this.toggle = this.toggle.bind(this);
    }

    private toggle() {
        this.currentActiveStore!.toggleDetailsPanelCollapsed();
        setTimeout(() => {
            this.currentActiveStore!.updateCanvasClientPosition();
        }, 100);
    }

    private renderAttr(def: IWidgetParamDef | ILinkParamDef) {
        const s = this.currentActiveStore!;
        const w = s.currentWidget! || s.currentLink!;
        const key = def.name!;
        // 如果提供了renderFunc并且指定了no_label，那么用户可能是想自定义渲染内容的，此时name和desc都被忽略
        const value = w.params.getValue(def.name || '');

        if (def.value_style === ValueStyle.FUNC) {
            return def.no_label ?
                (def.renderFunc as any)(w, w.params, key, def)
                :
                (
                    <div className='user-def-render value-render' key={def.key}>
                        <ValueLabel required={def.required || false} label={def.desc || ''} hint={def.hint}/>
                        {(def.renderFunc as any)(w, w.params, key)}
                    </div>
                );
        } else if (def.value_style === ValueStyle.HIDDEN) {
            return null;
        } else if (def.value_style === ValueStyle.INPUT) {
            return (
                <ValueInput
                    required={def.required || false}
                    key={def.key}
                    placeholder={def.placeholder}
                    hint={def.hint}
                    label={def.desc || ''} value={value} onChange={(e: React.ChangeEvent<any>) => {
                    w.params.setValue(key, e.target.value);
                }}/>
            );
        } else if (def.value_style === ValueStyle.SELECT || def.value_style === ValueStyle.MULTI_SELECT) {
            const options = def.value_range!.split(',');
            return (
                <ValueSelector
                    locale={this.locale}
                    required={def.required || false}
                    multiple={def.value_style === ValueStyle.MULTI_SELECT}
                    key={def.key}
                    label={def.desc || ''}
                    placeholder={def.placeholder}
                    value={value}
                    options={options}
                    onSelectAll={() => {
                        w.params.setValue(key, options);
                    }}
                    onChange={(val: string) => {
                        w.params.setValue(key, val);
                    }}
                />
            );
        } else if (def.value_style === ValueStyle.TEXTAREA) {
            return (
                <ValueTextArea
                    placeholder={def.placeholder}
                    required={def.required || false}
                    key={def.key}
                    label={def.desc || ''} value={value} onChange={(e: React.ChangeEvent<any>) => {
                    w.params.setValue(key, e.target.value);
                }}/>
            );
        } else {
            throw new Error('Unhandled valueStyle ' + def.value_style);
        }
    }

    @computed
    // 由左侧数据集组成的Select控件的Options
    get datasetOptions() {
        return this.currentActiveStore!.datasetTree.flattenedFiles.map(dataset => dataset.key + KEY_VALUE_SEPARATOR + dataset.name);
    }

    private renderAttrs() {
        const s = this.currentActiveStore;
        const result: React.ReactNode[] = [];
        if (s && s.currentWidget) {
            const w = s.currentWidget;
            const paramDefs = w.paramDefs!;
            for (const def of paramDefs) {
                result.push(this.renderAttr(def));
            }
            // 算子名字
            if (!this.canvasConfig.hideLabel) {
                const labelPairs = this.canvasConfig.label ? this.canvasConfig.label({widget: w} as any) : [
                    getTranslation(this.locale, 'Name'),
                    ''];
                if (!this.canvasConfig.singleton) {
                    result.unshift(<ValueInput
                        required
                        key={'widget-name'}
                        label={labelPairs[0]}
                        hint={labelPairs[1]}
                        value={w.name}
                        onChange={(e: React.ChangeEvent<any>) => {
                            w.setName(e.target.value);
                        }}/>);
                } else {
                    result.unshift(
                        <ConfirmableValueInput
                            key={'widget-name' + uuidv1()}
                            locale={this.locale}
                            label={labelPairs[0]}
                            hint={labelPairs[1]}
                            value={w.name || ''}
                            errorMsg={getTranslation(this.locale, 'Widget with the same name exists')}
                            onConfirm={(val: string) => {
                                if (val === w.name) {
                                    return true;
                                }
                                if (this.currentActiveStore!.allWidgetNamesSet.has(val)) {
                                    return false;
                                }
                                w.setName(val);
                                return true;
                            }}
                        />);
                }
            }
            if (!this.canvasConfig.hideWidgetType) {
                const typeNamePairs = this.canvasConfig.typeName || [getTranslation(this.locale, 'Type'), ''];
                const disabled = !!this.canvasConfig.disableWidgetType;
                result.unshift(
                    <ValueSelector
                        disabled={disabled}
                        locale={this.locale}
                        required={!disabled}
                        multiple={false}
                        key={'$$dataset'}
                        label={typeNamePairs[0]}
                        hint={typeNamePairs[1]}
                        value={w.nodeType}
                        options={this.datasetOptions}
                        onChange={(val: string) => {
                            w.setNodeType(val);
                        }}
                    />,
                );
            }
            return result;
        } else if (s && s.currentLink && s.currentLink.linkParamDefs) {
            for (const def of s.currentLink.linkParamDefs) {
                result.push(this.renderAttr(def));
            }
            const currLink = s.currentLink;
            const labelPairs = this.canvasConfig.linkDescValue ? this.canvasConfig.linkDescValue(currLink) :
                [getTranslation(this.locale, 'Relationship'), ''];

            result.unshift(<ConfirmableValueInput
                key={'link-name' + uuidv1()}
                locale={this.locale}
                label={labelPairs[0]}
                hint={labelPairs[1]}
                value={currLink.name || ''}
                errorMsg={getTranslation(this.locale, 'Edge with the same name exists')}
                onConfirm={(val: string) => {
                    if (val === currLink.name) {
                        return true;
                    }
                    if (this.currentActiveStore!.allLinkNamesSet.has(val)) {
                        return false;
                    }
                    currLink.setName(val);
                    return true;
                }}
            />);

            return result;
        }
        return null;
    }

    public render() {
        const s = this.currentActiveStore;
        const collapsed = s && s.detailsPanelCollapsed;
        const customPanelDef = _get(this.props.canvasConfig!.callbacks, 'customDetailPanel');
        let body: React.ReactNode = null;

        if (customPanelDef) {
            if (!s) {
                return null;
            } else {
                body = customPanelDef(s, s.currentWidget || s.currentTerminus || s.currentLink || s.currentTerminusLink);
                if (body === USE_DEFAULT_BEHAVIOR) {
                    body = this.renderAttrs();
                }
            }
        } else {
            body = this.renderAttrs();
        }

        const width = collapsed ? 18 : rightPanelWidth(this.canvasConfig);
        return (
            <div style={{width}}
                 className={`widget-details-panel ${classNames({collapsed})}`}>
                <div className='collapse-handle' onClick={this.toggle}/>
                {!collapsed &&
                <React.Fragment>
                    <div className='details-title'>
                        <div>
                            {getTranslation(this.locale, 'Attrs')}
                        </div>
                    </div>
                    <div className='attributes'>
                        {body}
                    </div>
                </React.Fragment>
                }
            </div>
        );
    }
}
