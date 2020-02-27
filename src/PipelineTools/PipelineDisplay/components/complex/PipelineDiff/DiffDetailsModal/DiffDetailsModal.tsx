import * as React from 'react';
import './index.scss';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import _find from 'lodash/find';
import className from 'classnames';
import {complexInject, vertexName} from '../../../../DisplayCanvasUtils';
import {ComplexModeCanvasComponent} from '../../ComplexModeCanvasComponent';
import {CommonElementData, FieldDataJson} from '../../../../kg-interface';
import {getTranslation, Locales} from '../../../../../../utils';

@complexInject
export class DiffDetailsModal extends ComplexModeCanvasComponent {

    private mutations(currEle: CommonElementData) {
        // 过滤出所有有变化的属性
        let mutatedTag: FieldDataJson | null = null;
        let mutatedNote: FieldDataJson | null = null;
        const mutatedProperties: FieldDataJson[] = [];
        // 如果是发生过变化的节点或关系
        if (currEle.mutationName === 'Edit') {
            Object.values(currEle.fieldsMap).forEach((f) => {
                if (f.fieldName === '__name' || f.fieldName === '__icon') {
                    return;
                }
                if (!!f.mutation) {
                    if (f.fieldName === '__note') {
                        mutatedNote = f;
                    } else if (f.fieldName === '__tag') {
                        mutatedTag = f;
                    } else {
                        mutatedProperties.push(f);
                    }
                }
            });
        } else if (!!currEle.mutationName) {// 新增的或者删除的，把所有的属性都纳入范围
            Object.values(currEle.fieldsMap).forEach((f) => {
                if (f.fieldName === '__name' || f.fieldName === '__icon') {
                    return;
                }
                if (f.fieldName === '__note') {
                    mutatedNote = f;
                } else if (f.fieldName === '__tag') {
                    mutatedTag = f;
                } else {
                    mutatedProperties.push(f);
                }
            });
        }
        const obj = this.diffService.currentSelectedDiffObj!;
        const {eleType} = obj;
        const name = eleType === 'vertex' ? vertexName(currEle) + ` (${currEle.label})` : currEle.label;

        return (
            <div className='mutations-wrapper'>
                <div style={{color: '#40526F', marginBottom: 10}}>
                    {name}
                </div>
                {mutatedTag &&
                <Mutation locale={this.locale} key={mutatedTag!.fieldName} field={mutatedTag}/>
                }
                {mutatedNote &&
                <Mutation locale={this.locale} key={mutatedNote!.fieldName} field={mutatedNote}/>
                }
                <div style={{color: '#40526F', marginTop: 8, marginBottom: 8}}>
                    {getTranslation(this.locale, 'Attrs')}
                </div>
                {mutatedProperties.map((f: FieldDataJson) => <Mutation locale={this.locale} key={f.fieldName}
                                                                       field={f}/>)}
            </div>
        );
    }

    public render() {
        if (this.diffService.currentSelectedDiffObj) {
            const obj = this.diffService.currentSelectedDiffObj;
            const {eleId, eleType} = obj;
            const allElements = eleType === 'vertex' ? this.canvasConfig.diff!.result.inner.vertices
                : this.canvasConfig.diff!.result.inner.edges;
            const currEle = _find(allElements, (ele) => ele.id === eleId)!;
            if (!currEle.mutationName) {
                // 没有发生过变化的元素，不需要显示详细内容（以后可能会改)
                return null;
            }

            const {x, y} = obj;

            return (
                <Tooltip overlayClassName={'element-update-overlay'} placement={'right'}
                         title={this.mutations(currEle)}
                         visible={true}>
                    <div style={{left: x, top: y}}
                         className='diff-details-assist'>
                    </div>
                </Tooltip>
            );
        }
        return null;
    }
}

class Mutation extends React.Component<{ field: FieldDataJson, locale: Locales }> {

    private processedName(name: string, noChange = false) {
        if (name === '__tag') {
            if (noChange) {
                return getTranslation(this.props.locale, 'Tags') + ':';
            } else {
                return getTranslation(this.props.locale, 'Tag Change') + ':';
            }
        } else if (name === '__note') {
            if (noChange) {
                return getTranslation(this.props.locale, 'Note') + ':';
            } else {
                return getTranslation(this.props.locale, 'Note Change') + ':';
            }
        }
        return name + ':';
    }

    private processedValue(value: string, isTag: boolean) {
        if (!value) {
            return 'N/A';
        } else if (!isTag) {
            return value;
        } else {
            const tags = value.split(',');
            return (
                <div className='mutation-tags'>
                    {tags.map((t) =>
                        <span className='mutation-tag'>{t}</span>,
                    )}
                </div>
            );
        }
    }

    render() {
        const {field} = this.props;
        const isTag = field.fieldName === '__tag';
        const isSpecial = field.fieldName === '__note' || isTag;

        // 未发生过变化的实体或者关系的所有属性都没有mutation，因此走这个逻辑
        if (!field.mutation) {
            return (
                <div className={className('diff-mutation', {isSpecial})}>
                    <div className='mutation-key'>
                        {this.processedName(field.fieldName, true)}
                    </div>

                    <div className='mutation-value'>
                        {this.processedValue(field.fieldValue, isTag)}
                    </div>
                </div>
            );
        } else if (field.mutation!.name === 'EditElementField') {
            return (
                <div className={className('diff-mutation', {isSpecial})}>
                    <div className='mutation-key'>
                        {this.processedName(field.fieldName)}
                    </div>
                    <div className='old-to-new mutation-value'>
                        <span className='deleted-marker'>
                            {this.processedValue(field.mutation!.prev!.fieldValue, isTag)}
                        </span>
                        <span className='old-to-new-arrow'>
                            {'\u2192'}
                        </span>
                        {this.processedValue(field.fieldValue, isTag)}
                    </div>
                </div>
            );
        } else if (field.mutation!.name === 'AddElementField') {
            return (
                <div className={className('diff-mutation', {isSpecial})}>
                    <div className='mutation-key'>
                        <div className='mutation-add'>
                            +
                        </div>
                        {this.processedName(field.fieldName)}
                    </div>
                    <div className='mutation-value'>
                        {this.processedValue(field.fieldValue, isTag)}
                    </div>
                </div>
            );
        } else if (field.mutation!.name === 'DeleteElementField') {
            return (
                <div className={className('diff-mutation', {isSpecial})}>
                    <div className='mutation-key'>
                        <div className='mutation-delete'>
                            -
                        </div>
                        <span className='deleted-marker'>
                            {this.processedName(field.fieldName)}
                        </span>
                    </div>
                    <div className='deleted-marker mutation-value'>
                        {this.processedValue(field.fieldValue, isTag)}
                    </div>
                </div>
            );
        }
        return null;
    }
}
