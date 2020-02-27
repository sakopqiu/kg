import * as React from 'react';
import {observer} from 'mobx-react-lite';
import {SophonModal} from '../../../../../components/SophonModal';
import {antdSelectFilterOptions, getTranslation, Locales} from '../../../../../utils';
import {SqlAttribute, SqlRuleStore} from '../../../../../AttributeSelector/sql/SqlRuleStore';
import {SingleSqlRuleComponentImpl} from '../../../../../AttributeSelector/sql/SingleSqlRuleComponentImpl/SingleSqlRuleComponentImpl';
import {DisplayModeCanvasStore} from '../../../stores/DisplayModeCanvasStore';
import Select from 'antd/es/select';
import 'antd/es/select/style';
import {EdgeStyleConfig} from '../../../model/EdgeStyleConfig';
import './index.scss';
import Divider from 'antd/es/divider';
import 'antd/es/divider/style';
import {StyleColorSquare} from '../../common/StyleColorSquare/StyleColorSquare';
import Slider from 'antd/es/slider';
import 'antd/es/slider/style';
import {LineOpacitySliderMarker, SpecialLineColors} from '../interface';
import Radio from 'antd/es/radio';
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
import {complexCanvasConfig} from '../../../DisplayCanvasUtils';

export interface GlobalEdgeSettingModalProps {
    locale: Locales;
    mainStore: DisplayModeCanvasStore;
}

class MyEdgeStyleConfig {
    id: string = uuidv1();
    edgeStyleConfig: EdgeStyleConfig;
    sqlRuleStore: SqlRuleStore;

    toJSON() {
        return {
            edgeStyleConfig: this.edgeStyleConfig,
            sqlRuleStore: this.sqlRuleStore.toJson,
        };
    }
}

class GlobalEdgeSettingModalStore {
    @observable myEdgeConfigs: MyEdgeStyleConfig[] = []; // 组件的本地状态，因为edgeConfigs是深度克隆的，不会影响当前画布
}

function GlobalEdgeSettingModalFunc(props: GlobalEdgeSettingModalProps) {

    const {locale} = props;

    const storeRef = React.useRef(new GlobalEdgeSettingModalStore());
    const canvasSetting = props.mainStore.canvasDrawService.cyState.canvasSetting;

    React.useEffect(() => {
        const edgeStyleConfigs = canvasSetting.globalEdgeConfig.edgeStyleConfigs;

        // 用户只有按确认键才生效，为了不实时破坏当前画布的状态，所以传递进去的config是一个克隆对象
        function cloneConfig(config: EdgeStyleConfig) {
            return EdgeStyleConfig.fromJSON(config, false)!;
        }

        runInAction(() => {
            storeRef.current.myEdgeConfigs = edgeStyleConfigs.map((e) => {
                const myEdgeConfig = new MyEdgeStyleConfig();
                // sqlRuleStore不用赋值，子组件第一次渲染时会生成一个store，并且在内部赋值给myEdgeConfig
                myEdgeConfig.edgeStyleConfig = cloneConfig(e)!;
                return myEdgeConfig;
            });
        });
    }, []);

    const reset = React.useCallback(() => {
        runInAction(() => {
            // 创建一个子config，且内容为空
            const singleEmptyConfig = new MyEdgeStyleConfig();
            singleEmptyConfig.edgeStyleConfig = EdgeStyleConfig.emptyObj();
            // sqlRuleStore不用赋值，子组件第一次渲染时会生成一个store，并且在内部赋值给myEdgeConfig
            storeRef.current.myEdgeConfigs = [singleEmptyConfig];
        });
    }, []);

    const confirm = React.useCallback(() => {
        // 先验证
        const validConfigs = _filter(storeRef.current.myEdgeConfigs, config => {
            const r = config.sqlRuleStore.firstRule() as SqlRule;
            return r.isFilterable;
        }).map(config => {
            return {
                label: config.edgeStyleConfig.label,
                rule: config.sqlRuleStore.firstRule().toJson(),
                colorConfig: config.edgeStyleConfig.colorConfig,
            } as EdgeStyleConfig;
        });

        runInAction(() => {
            canvasSetting.globalEdgeConfig.setEdgeStyleConfigs(validConfigs);
            props.mainStore.canvasDrawService.stateService.setShowRelationStyleModal(false);
        });

        console.log(JSON.stringify(storeRef.current, null, 2));
    }, []);

    const footer = React.useMemo(() => {
        return (
            <div className='edge-more-setting-modal-footer'>
                <Button style={{marginRight: 12}} onClick={reset}>{getTranslation(locale, 'Reset')}</Button>
                <Button type='primary' onClick={confirm}>{getTranslation(locale, 'Confirm')}</Button>
            </div>
        );
    }, []);

    const addNewFilter = React.useCallback(() => {
        const newConfig = new MyEdgeStyleConfig();
        newConfig.edgeStyleConfig = EdgeStyleConfig.emptyObj();
        runInAction(() => {
            storeRef.current.myEdgeConfigs.push(newConfig);
        });
    }, []);

    return (
        <SophonModal
            style={{maxHeight: 730}}
            bodyStyle={{padding: 15}}
            locale={locale}
            width={640}
            height={'fit-content'}
            topPadding={100}
            footer={footer}
            className='edge-more-setting-modal'
            cancelOption={{
                showCross: true,
                onCancel: () => {
                    props.mainStore.canvasDrawService.stateService.setShowRelationStyleModal(false);
                },
            }}
            hitShadowClose
            title={getTranslation(locale, 'Edge Style')} showState={true}>
            <div className='add-filter-part' onClick={addNewFilter}>
                <PlusIcon style={{marginRight: 10}}/>
                <span>{getTranslation(locale, 'Add Filter')}</span>
            </div>
            {storeRef.current.myEdgeConfigs.map(config => {
                return (
                    <RuleColorSetter
                        deletable={storeRef.current.myEdgeConfigs.length > 1}
                        key={config.id}
                        locale={props.locale} myConfig={config}
                        mainStore={props.mainStore}
                        onDelete={() => {
                            runInAction(() => {
                                _remove(storeRef.current.myEdgeConfigs, (c) => config.id === c.id);
                            });
                        }}
                    />
                );
            })}
            <div className='edge-setting-modal-title'>
                {getTranslation(locale, 'Apply To')}
            </div>

            <Radio.Group>
                <Radio>{getTranslation(locale, 'Current Canvas')}</Radio>
            </Radio.Group>
        </SophonModal>
    );
}

interface RuleColorSetterProps {
    myConfig: MyEdgeStyleConfig;
    locale: Locales;
    mainStore: DisplayModeCanvasStore;
    deletable: boolean;
    onDelete: () => any;
}

const RuleColorSetter = observer((props: RuleColorSetterProps) => {
    const {locale, mainStore} = props;
    const sqlRuleStoreRef = React.useRef(new SqlRuleStore(locale, false, true));
    const sqlRuleStore = sqlRuleStoreRef.current;
    const edgeNames = mainStore.schemaEdgeNames;

    const config = props.myConfig.edgeStyleConfig;

    React.useEffect(() => {
        props.myConfig.sqlRuleStore = sqlRuleStore;
    }, []);
    const fieldAlias = React.useContext(complexCanvasConfig).fieldAlias!;

    const candidates: SqlAttribute[] = React.useMemo(() => {
        if (!config.label) {
            return [];
        }
        const edgeSchema = mainStore.getEdgeSchema(config.label);
        return edgeSchema.fields.map(f => {
            return {
                attribute: f.fieldName,
                attributeDisplayName: fieldAlias(f.fieldName),
                attributeType: f.fieldType,
            } as any;
        });
    }, [config.label]);

    return (
        <div className='edge-setting-modal-filter'>
            <div className='edge-setting-part1'>
                <span className='edge-setting-modal-title'>
                    {getTranslation(locale, 'If Relation')}
                </span>
                {props.deletable &&
                <DeleteIcon className='edge-setting-modal-delete-filter' onClick={props.onDelete}/>
                }
            </div>
            <div>
                <Select
                    showSearch
                    placeholder={getTranslation(locale, 'Select Relation')}
                    style={{marginRight: 10, width: 160}}
                    value={config.label || undefined}
                    onChange={config.setLabel.bind(config)}
                    filterOption={antdSelectFilterOptions}
                >
                    {edgeNames.map(eName => (
                        <Select.Option value={eName}>
                            {eName}
                        </Select.Option>
                    ))}
                </Select>
                <SingleSqlRuleComponentImpl
                    candidates={candidates}
                    mainStore={sqlRuleStore}
                    defaultRuleJson={config.rule}
                    locale={props.locale}/>
            </div>

            <div className='edge-setting-modal-title' style={{marginTop: 10}}>
                {getTranslation(locale, 'Then Set Style')}
            </div>
            <div className='edge-setting-part2-titles'>
                <div>{getTranslation(locale, 'Line Color')}</div>
                <div
                    style={{
                        position: 'relative',
                        left: -85,
                    }}
                >{getTranslation(locale, 'Line Opacity')}</div>
            </div>
            <div className='edge-setting-part2-body'>
                <div className='edge-setting-part2-colors'>
                    {
                        [SpecialLineColors.COLOR1, SpecialLineColors.COLOR2, SpecialLineColors.COLOR3, SpecialLineColors.COLOR4]
                            .map(color => (
                                <StyleColorSquare
                                    key={color}
                                    selected={config.colorConfig.color === color}
                                    color={color}
                                    onClick={() => {
                                        config.colorConfig.setColor(color);
                                    }}/>
                            ))
                    }

                </div>
                <Slider
                    style={{width: 150}}
                    marks={LineOpacitySliderMarker} min={0} max={100}
                    value={config.colorConfig.opacity} onChange={(val: any) => {
                    config.colorConfig.setOpacity(val);
                }}
                />
            </div>

            <Divider/>

        </div>

    );
});

export const EdgeMoreSettingModal = observer(GlobalEdgeSettingModalFunc);
