import * as React from 'react';
import {ICanvasComponentProps} from '../../../../common/CanvasComponent';
import './index.scss';
import {getTranslation, isNumberType, loadingEffect} from '../../../../../utils';
import {SophonModal} from '../../../../../components/SophonModal';
import Form, {FormComponentProps} from 'antd/es/form';
import 'antd/es/form/style';
import InputNumber from 'antd/es/input-number';
import 'antd/es/input-number/style';
import Input from 'antd/es/input';
import 'antd/es/input/style';

import {ValueSelector} from '../../../../../components/FormElements/ValueSelector';
import {NodeTypeConfig} from '../../../model/NodeTypeConfig';
import {LoadingTargets} from '../../../../../stores/LoadableStoreImpl';
import className from 'classnames';
import {complexInject} from '../../../DisplayCanvasUtils';
import {runInAction} from 'mobx';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../components/complex/ComplexModeCanvasComponent';
import {FieldSchema} from '../../../interfaces';
import {getKgFields} from '../../../CanvasDrawUtils';
import Radio from 'antd/es/radio';
import 'antd/es/radio/style';
import {
    communityByKeywords, communityByMacro,
    communityByPrefix,
    communityBySuffix,
    executeMacro,
} from '../../../MacroEngine/MacroEngine';

enum MatchingType {
    WHOLE = 'WHOLE',
    PREFIX = 'PREFIX',
    SUFFIX = 'SUFFIX',
    AMBIGUOUS = 'AMBIGUOUS',
    MACRO = 'MACRO',
}

const RadioGroup = Radio.Group;
const radioStyle = {
    display: 'block',
    marginTop: 10,
    marginBottom: 10,
};
const TextArea = Input.TextArea;

// interface CommunityPanelState {
//     type: CommunityPanelStateType;
//     prefix: string;
//     suffix: string;
//     ambiguousText: string;
//     macro: string;
// }

class CommunityPanelClass extends ComplexModeCanvasComponent<ComplexModeCanvasComponentProps & FormComponentProps> {

    constructor(props: ICanvasComponentProps & FormComponentProps) {
        super(props);
        this.changeConceptType = this.changeConceptType.bind(this);
        this.closePanel = this.closePanel.bind(this);
        this.updateCommunity = this.updateCommunity.bind(this);
        // this.state = {
        //     type: 'prefix',
        //     prefix: '',
        //     suffix: '',
        //     ambiguousText: '',
        //     macro: '',
        // };
    }

    get conceptTypes() {
        return Array.from(this.cyState.nodeTypeConfigs.values())
            .map((n: NodeTypeConfig) => {
                return n.name + '@@' + n.name;
            });
    }

    private closePanel() {
        this.stateService.setShowCommunityPanel(false);
    }

    private updateCommunity() {
        this.props.form.validateFieldsAndScroll((err: any) => {
            if (!err) {
                this.doUpdate();
            }
        });
    }

    @loadingEffect(LoadingTargets.CANVAS_LAYOUT)
    private async doUpdate() {
        const matchingType = this.props.form.getFieldValue('matchingRuleType');
        const nodeType = this.currNodeTypeConfig.name;
        const attr = this.props.form.getFieldValue('attribute');
        const attribute = this.props.form.getFieldValue('attribute');
        const isByNumber = this.isClusterByNumber(attribute);
        if (isByNumber || matchingType === MatchingType.WHOLE) {
            await this.stateService.communityService.updateManualCommunity(
                nodeType, attr,
                this.props.form.getFieldValue('communityCount'));
            runInAction(() => {
                this.timeFilterService.setShowTimeFilter(false);
                this.stateService.setShowCommunityPanel(false);
                this.stateService.setAttributeTab('COMMUNITY_DISCOVERY');
            });
        } else if (matchingType === MatchingType.PREFIX) {
            const prefixLength = this.props.form.getFieldValue('prefixLength');
            const macroConfig = communityByPrefix(nodeType, attr.split(':')[0], prefixLength);
            executeMacro(this.cyState, macroConfig);
            this.stateService.setShowCommunityPanel(false);
        } else if (matchingType === MatchingType.SUFFIX) {
            const prefixLength = this.props.form.getFieldValue('suffixLength');
            const macroConfig = communityBySuffix(nodeType, attr.split(':')[0], prefixLength);
            executeMacro(this.cyState, macroConfig);
            this.stateService.setShowCommunityPanel(false);
        } else if (matchingType === MatchingType.AMBIGUOUS) {
            const keywords = this.props.form.getFieldValue('ambiguousKeyWord');
            const macroConfig = communityByKeywords(nodeType, attr.split(':')[0], keywords);
            executeMacro(this.cyState, macroConfig);
            this.stateService.setShowCommunityPanel(false);
        } else if (matchingType === MatchingType.MACRO) {
            const macro = this.props.form.getFieldValue('macro');
            const macroConfig = communityByMacro(nodeType, attr.split(':')[0], macro);
            executeMacro(this.cyState, macroConfig);
            this.stateService.setShowCommunityPanel(false);
        } else {
            throw new Error('Unhandled matchingType ' + matchingType);
        }
    }

    attributeOptions(nodeType: string) {
        const s = this.currentActiveStore!;
        const schema = s.getNodeSchema(nodeType);
        const schemaFields = getKgFields(schema.fields, (f: FieldSchema) => f.fieldName);
        return schemaFields
        // 社群不使用id或name，因为他们一般唯一表示一个节点
            .map((field) => {
                const value = field.fieldName + ':' + field.fieldType;
                const showName = this.fieldAlias(field.fieldName) + ` (${field.fieldType})`;
                return value + '@@' + showName;
            });
    }

    private changeConceptType(val: string) {
        this.stateService.setConceptType(val);
        this.props.form.setFieldsValue({
            attribute: '',
            communityCount: 10,
        });
    }

    private isClusterByNumber(val: string) {
        if (!val) {
            return false;
        }
        const arr = val.split(':');
        if (arr.length !== 2) {
            return false;
        }
        return isNumberType(arr[1]);
    }

    get conceptType() {
        const s = this.stateService!;
        const defaultConceptType = this.cyState.nodeTypeConfigs.keys().next().value;
        return s.conceptType || defaultConceptType;
    }

    get currNodeTypeConfig() {
        return this.cyState.nodeTypeConfigs.get(this.conceptType)!;
    }

    public render() {
        const conceptType = this.conceptType;
        const width = 200;
        const nodeTypeConfig = this.currNodeTypeConfig;
        const {getFieldDecorator} = this.props.form;
        const attribute = this.props.form.getFieldValue('attribute');
        // 交互规定，如果选中的属性是数字类型的话，按照取值范围分为几个社群，如果是其他类型，则允许用户做更多的调节
        // 个人认为对于数字类型也需要一视同仁对待，这样才灵活，希望维护者以后可以优化这段逻辑
        const isByNumber = this.isClusterByNumber(attribute);
        const showAdvancedOptions = !isByNumber && attribute;

        const matchingType = this.props.form.getFieldValue('matchingRuleType') || MatchingType.WHOLE;

        const style = {width: 183, marginTop: -10};
        return (
            <SophonModal
                showState={this.stateService.showCommunityPanel}
                shadowStyles={{position: 'absolute', justifyContent: 'flex-start'}}
                className={className('community-panel')}
                locale={this.locale}
                title={getTranslation(this.locale, 'Community Exploration')}
                confirmOption={{
                    text: getTranslation(this.locale, 'Confirm'),
                    onConfirm: this.updateCommunity,
                }}
                cancelOption={{
                    text: getTranslation(this.locale, 'Cancel'),
                    showCross: true,
                    onCancel: this.closePanel,
                    disabled: this.mainStore.isLoading(LoadingTargets.CANVAS_LAYOUT),
                }}
                loading={this.mainStore.isLoading(LoadingTargets.CANVAS_LAYOUT)}
                width={375}
                hitShadowClose={true}
                buttonAlign='right'
                bottomPadding={25}
            >
                <div className='manual-discovery-title'>
                    {getTranslation(this.locale, 'Discovery Hint')}
                </div>
                <Form className='manual-discovery-body'>
                    <Form.Item label={getTranslation(this.locale, 'Concept Type')}>
                        <ValueSelector
                            style={{width}}
                            hideLabel
                            disallowClear
                            locale={this.locale}
                            value={conceptType} required={false}
                            options={this.conceptTypes}
                            onChange={this.changeConceptType}
                            multiple={false}/>
                    </Form.Item>

                    {!!nodeTypeConfig &&
                    <Form.Item label={getTranslation(this.locale, 'Cluster By')} key={nodeTypeConfig.name}>
                        {getFieldDecorator('attribute',
                            {
                                rules: [{
                                    required: true,
                                    message: getTranslation(this.locale, 'Attribute is required'),
                                }],
                            })(
                            <ValueSelector
                                style={{width}}
                                hideLabel
                                locale={this.locale}
                                options={this.attributeOptions(conceptType)}
                                // value={this.props.form.getFieldValue("attribute")}
                                onChange={async (e: string) => {
                                    this.props.form.setFieldsValue({attribute: e});
                                }}
                                required={false}
                                multiple={false}/>)}
                    </Form.Item>
                    }
                    {isByNumber &&
                    <Form.Item label={getTranslation(this.locale, 'Community Size')}>
                        {getFieldDecorator('communityCount',
                            {
                                initialValue: 10,
                                rules: [{
                                    required: true,
                                    message: getTranslation(this.locale, 'Community Size is required'),
                                }],
                            })(
                            <InputNumber
                                width={width}
                                min={1}
                                // value={this.props.form.getFieldValue('communityCount')}
                                onChange={(value: any) => {
                                    this.props.form.setFieldsValue({
                                        communityCount: value,
                                    });
                                }}
                            />,
                        )}
                    </Form.Item>}

                    {showAdvancedOptions &&
                    <Form.Item label={getTranslation(this.locale, 'Community Matching Rule')}>
                        {getFieldDecorator('matchingRuleType',
                            {
                                initialValue: MatchingType.WHOLE,
                            })(
                            <RadioGroup>
                                <Radio style={radioStyle} value={MatchingType.WHOLE}>
                                    {getTranslation(this.locale, 'As a whole')}
                                </Radio>
                                <Radio style={radioStyle} value={MatchingType.PREFIX}>
                                    {getTranslation(this.locale, 'Prefix matching')}
                                </Radio>
                                <Radio style={radioStyle} value={MatchingType.SUFFIX}>
                                    {getTranslation(this.locale, 'Suffix matching')}
                                </Radio>
                                <Radio style={radioStyle} value={MatchingType.AMBIGUOUS}>
                                    {getTranslation(this.locale, 'Keyword matching')}
                                </Radio>
                                <Radio style={radioStyle} value={MatchingType.MACRO}>
                                    {getTranslation(this.locale, 'Custom macro')}
                                </Radio>
                            </RadioGroup>)}
                    </Form.Item>
                    }

                    {showAdvancedOptions && matchingType === MatchingType.PREFIX
                    &&
                    <Form.Item>
                        {getFieldDecorator('prefixLength', {
                            initialValue: 3,
                            rules: [{
                                required: true,
                                message: getTranslation(this.locale, 'Prefix length is required'),
                            }],
                        })(
                            <InputNumber style={style} placeholder={getTranslation(this.locale, 'Prefix Length')}
                                         min={1}/>,
                        )}
                    </Form.Item>
                    }
                    {showAdvancedOptions && matchingType === MatchingType.SUFFIX
                    &&
                    <Form.Item>
                        {getFieldDecorator('suffixLength', {
                            initialValue: 3,
                            rules: [{
                                required: true,
                                message: getTranslation(this.locale, 'Suffix length is required'),
                            }],
                        })(
                            <InputNumber style={style} placeholder={getTranslation(this.locale, 'Suffix Length')}
                                         min={1}/>,
                        )}
                    </Form.Item>
                    }

                    {showAdvancedOptions && matchingType === MatchingType.AMBIGUOUS
                    &&
                    getFieldDecorator('ambiguousKeyWord',
                        {
                            initialValue: '',
                            rules: [{
                                required: true,
                                message: getTranslation(this.locale, 'Keywords is required'),
                            }],
                        })(
                        <Input style={style}
                               placeholder={getTranslation(this.locale, 'Ambiguous hint')} min={1}/>,
                    )}

                    {showAdvancedOptions && matchingType === MatchingType.MACRO
                    &&
                    getFieldDecorator('macro',
                        {
                            initialValue: '',
                            rules: [{
                                required: true,
                                message: getTranslation(this.locale, 'Macro string is required'),
                            }],
                        })(
                        <TextArea style={{...style, width: 320, height: 200}}
                                  placeholder={getTranslation(this.locale, 'Custom macro hint')}/>,
                    )}
                </Form>
            </SophonModal>
        );
    }
}

export const CommunityPanel = Form.create()(complexInject(CommunityPanelClass));
