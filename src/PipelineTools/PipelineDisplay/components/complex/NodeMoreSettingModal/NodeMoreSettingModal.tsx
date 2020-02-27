import * as React from 'react';
import {observer} from 'mobx-react-lite';
import {SophonModal} from '../../../../../components/SophonModal';
import {antdSelectFilterOptions, getTranslation, Locales} from '../../../../../utils';
import {SqlAttribute, SqlRuleStore} from '../../../../../AttributeSelector/sql/SqlRuleStore';
import {SingleSqlRuleComponentImpl} from '../../../../../AttributeSelector/sql/SingleSqlRuleComponentImpl/SingleSqlRuleComponentImpl';
import {DisplayModeCanvasStore} from '../../../stores/DisplayModeCanvasStore';
import Select from 'antd/es/select';
import 'antd/es/select/style';
import './index.scss';
import Divider from 'antd/es/divider';
import 'antd/es/divider/style';
import 'antd/es/slider/style';
import Radio, {RadioChangeEvent} from 'antd/es/radio';
import 'antd/es/radio/style';
import Button from 'antd/es/button';
import 'antd/es/button/style';
import {observable, runInAction} from 'mobx';
import uuidv1 from 'uuid/v1';
import _filter from 'lodash/filter';
import {SqlRule} from '../../../../../AttributeSelector/sql/SqlRule';
import {PlusIcon} from '../../../../../icons/PlusIcon';
import {DeleteIcon} from '../../../../../icons/DeleteIcon';
import _remove from 'lodash/remove';
import {NodeStyleConfig} from '../../../model/NodeStyleConfig';
import {EntitySizeConfigurer} from '../../../context_menu/complex/NodeStyleConfigurer/EntitySizeConfigurer';
import {ShapeConfigurer} from '../../../context_menu/complex/NodeStyleConfigurer/ShapeConfigurer';
import {BorderColorConfigurer} from '../../../context_menu/complex/NodeStyleConfigurer/BorderColorConfigurer';
import {complexCanvasConfig} from '../../../DisplayCanvasUtils';

export interface GlobalNodeSettingModalProps {
    locale: Locales;
    mainStore: DisplayModeCanvasStore;
}

class TempNodeStyleConfig {
    id: string = uuidv1();
    nodeStyleConfig: NodeStyleConfig;
    sqlRuleStore: SqlRuleStore;

    toJSON() {
        return {
            nodeStyleConfig: this.nodeStyleConfig,
            sqlRuleStore: this.sqlRuleStore.toJson,
        };
    }
}

class GlobalNodeSettingModalStore {
    @observable tempNodeStyleConfigs: TempNodeStyleConfig[] = []; // 组件的本地状态，因为nodeConfigs是深度克隆的，不会影响当前画布
}

function GlobalNodeSettingModalFunc(props: GlobalNodeSettingModalProps) {

    const {locale} = props;

    const storeRef = React.useRef(new GlobalNodeSettingModalStore());
    const canvasSetting = props.mainStore.canvasDrawService.cyState.canvasSetting;

    React.useEffect(() => {
        const tempNodeStyleConfigs = canvasSetting.globalNodeConfig.nodeStyleConfigs;

        // 用户只有按确认键才生效，为了不实时破坏当前画布的状态，所以传递进去的config是一个克隆对象
        function cloneConfig(config: NodeStyleConfig) {
            return NodeStyleConfig.fromJSON(config)!;
        }

        runInAction(() => {
            storeRef.current.tempNodeStyleConfigs = tempNodeStyleConfigs.map((e) => {
                const config = new TempNodeStyleConfig();
                // sqlRuleStore不用赋值，子组件第一次渲染时会生成一个store，并且在内部赋值给tempNodeConfig
                config.nodeStyleConfig = cloneConfig(e)!;
                return config;
            });
        });
    }, []);

    const reset = React.useCallback(() => {
        runInAction(() => {
            // 创建一个子config，且内容为空
            const singleEmptyConfig = new TempNodeStyleConfig();
            singleEmptyConfig.nodeStyleConfig = NodeStyleConfig.emptyObj();
            // sqlRuleStore不用赋值，子组件第一次渲染时会生成一个store，并且在内部赋值给tempNodeConfig
            storeRef.current.tempNodeStyleConfigs = [singleEmptyConfig];
        });
    }, []);

    const confirm = React.useCallback(() => {
        // 先验证
        const validConfigs = _filter(storeRef.current.tempNodeStyleConfigs, config => {
            const r = config.sqlRuleStore.firstRule() as SqlRule;
            return r.isFilterable;
        }).map(config => {
            const nodeStyleConfig = NodeStyleConfig.emptyObj();
            nodeStyleConfig.label = config.nodeStyleConfig.label;
            nodeStyleConfig.rule = config.sqlRuleStore.firstRule().toJson();
            nodeStyleConfig.borderColor = config.nodeStyleConfig.borderColor;
            nodeStyleConfig.size = config.nodeStyleConfig.size;
            nodeStyleConfig.shape = config.nodeStyleConfig.shape;
            return nodeStyleConfig;
        });

        runInAction(() => {
            canvasSetting.globalNodeConfig.setNodeStyleConfigs(validConfigs);
            props.mainStore.canvasDrawService.elementService.applyNodeStyleConfig();
            props.mainStore.canvasDrawService.stateService.setShowNodeStyleModal(false);
        });

        console.log(JSON.stringify(storeRef.current, null, 2));
    }, []);

    const footer = React.useMemo(() => {
        return (
            <div className='node-more-setting-modal-footer'>
                <Button style={{marginRight: 12}} onClick={reset}>{getTranslation(locale, 'Reset')}</Button>
                <Button type='primary' onClick={confirm}>{getTranslation(locale, 'Confirm')}</Button>
            </div>
        );
    }, []);

    const addNewFilter = React.useCallback(() => {
        const newConfig = new TempNodeStyleConfig();
        newConfig.nodeStyleConfig = NodeStyleConfig.emptyObj();
        runInAction(() => {
            storeRef.current.tempNodeStyleConfigs.push(newConfig);
        });
    }, []);

    return (
        <SophonModal
            style={{maxHeight: 730}}
            bodyStyle={{padding: 15}}
            locale={locale}
            width={623}
            height={'fit-content'}
            topPadding={100}
            footer={footer}
            className='node-more-setting-modal'
            cancelOption={{
                showCross: true,
                onCancel: () => {
                    props.mainStore.canvasDrawService.stateService.setShowNodeStyleModal(false);
                },
            }}
            hitShadowClose
            title={getTranslation(locale, 'Entity Style')} showState={true}>
            <div className='add-filter-part' onClick={addNewFilter}>
                <PlusIcon style={{marginRight: 10}}/>
                <span>{getTranslation(locale, 'Add Filter')}</span>
            </div>
            {storeRef.current.tempNodeStyleConfigs.map(config => {
                return (
                    <NodeRuleSetter
                        deletable={storeRef.current.tempNodeStyleConfigs.length > 1}
                        key={config.id}
                        locale={props.locale}
                        tempConfig={config}
                        mainStore={props.mainStore}
                        onDelete={() => {
                            runInAction(() => {
                                _remove(storeRef.current.tempNodeStyleConfigs, (c) => config.id === c.id);
                            });
                        }}
                    />
                );
            })}
            <div className='node-setting-modal-title'>
                {getTranslation(locale, 'Apply To')}
            </div>

            <Radio.Group>
                <Radio>{getTranslation(locale, 'Current Canvas')}</Radio>
            </Radio.Group>
        </SophonModal>
    );
}

interface RuleColorSetterProps {
    tempConfig: TempNodeStyleConfig;
    locale: Locales;
    mainStore: DisplayModeCanvasStore;
    deletable: boolean;
    onDelete: () => any;
}

const NodeRuleSetter = observer((props: RuleColorSetterProps) => {
    const {locale, mainStore} = props;
    const sqlRuleStoreRef = React.useRef(new SqlRuleStore(locale, false, true));
    const sqlRuleStore = sqlRuleStoreRef.current;
    const nodeNames = mainStore.schemaNodeNames;

    const config = props.tempConfig.nodeStyleConfig;

    React.useEffect(() => {
        props.tempConfig.sqlRuleStore = sqlRuleStore;
    }, []);
    const fieldAlias = React.useContext(complexCanvasConfig).fieldAlias!;

    const candidates: SqlAttribute[] = React.useMemo(() => {
        if (!config.label) {
            return [];
        }
        const nodeSchema = mainStore.getNodeSchema(config.label);
        return nodeSchema.fields.map(f => {
            return {
                attribute: f.fieldName,
                attributeDisplayName: fieldAlias(f.fieldName),
                attributeType: f.fieldType,
            } as any;
        });
    }, [config.label]);

    return (
        <div className='node-setting-modal-filter'>
            <div className='node-setting-part1'>
                <span className='node-setting-modal-title'>
                    {getTranslation(locale, 'If Entity')}
                </span>
                {props.deletable &&
                <DeleteIcon className='node-setting-modal-delete-filter' onClick={props.onDelete}/>
                }
            </div>
            <div>
                <Select
                    showSearch
                    placeholder={getTranslation(locale, 'Select Entity')}
                    style={{marginRight: 10, width: 160}}
                    value={config.label || undefined}
                    onChange={config.setLabel.bind(config)}
                    filterOption={antdSelectFilterOptions}
                >
                    {nodeNames.map(nName => (
                        <Select.Option value={nName}>
                            {nName}
                        </Select.Option>
                    ))}
                </Select>
                <SingleSqlRuleComponentImpl
                    candidates={candidates}
                    mainStore={sqlRuleStore}
                    defaultRuleJson={config.rule}
                    locale={props.locale}/>
            </div>

            <div className='node-setting-modal-title' style={{marginTop: 10}}>
                {getTranslation(locale, 'Then Set Style')}
            </div>
            <div className='node-setting-part2'>
                <EntitySizeConfigurer
                    locale={locale}
                    onChange={(e: RadioChangeEvent) => {
                        config.setSize(e.target.value);
                    }} value={config.size}/>
                <ShapeConfigurer locale={locale} onChange={config.setShape.bind(config)} shape={config.shape}/>
                <BorderColorConfigurer
                    locale={locale} color={config.borderColor}
                    onChange={config.setBorderColor.bind(config)}/>
            </div>
            <Divider/>

        </div>

    );
});

export const NodeMoreSettingModal = observer(GlobalNodeSettingModalFunc);
