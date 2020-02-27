import * as React from 'react';
import {complexInject} from '../../../DisplayCanvasUtils';
import './index.scss';
import {getTranslation, loadingEffect} from '../../../../../utils';
import {SophonModal} from '../../../../../components/SophonModal';
import Radio from 'antd/es/radio';
import 'antd/es/radio/style';
import Form, {FormComponentProps} from 'antd/es/form';
import 'antd/es/form/style';
import 'antd/es/checkbox/style';

import {LoadingTargets} from '../../../../../stores/LoadableStoreImpl';
import {runInAction} from 'mobx';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../components/complex/ComplexModeCanvasComponent';
import Slider from 'antd/es/slider';
import 'antd/es/slider/style';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const SliderMarker = {
    12: '12',
    18: '18',
    24: '24',
    30: '30',
    36: '36',
};

@complexInject
class CanvasSettingPanel extends ComplexModeCanvasComponent<ComplexModeCanvasComponentProps & FormComponentProps> {
    private closePanel = () => {
        this.stateService.setShowSettingPanel(false);
    }

    public render() {
        const {getFieldDecorator} = this.props.form;
        const {hideNodeLabel} = this.cyState.canvasSetting;
        const {hideEdgeLabel, edgeFontSize} = this.cyState.canvasSetting.globalEdgeConfig;

        return (
            <SophonModal
                showState={this.stateService.showSettingPanel}
                shadowStyles={{position: 'absolute', justifyContent: 'flex-start'}}
                className={'community-panel setting-panel'}
                locale={this.locale}
                title={getTranslation(this.locale, 'Graph Display Setting')}
                confirmOption={{
                    text: getTranslation(this.locale, 'Confirm'),
                    onConfirm: this.refreshCanvas,
                }}
                cancelOption={{
                    text: getTranslation(this.locale, 'Cancel'),
                    showCross: true,
                    onCancel: this.closePanel,
                    disabled: this.mainStore.isLoading(LoadingTargets.CANVAS_LAYOUT),
                }}
                loading={this.mainStore.isLoading(LoadingTargets.CANVAS_LAYOUT)}
                width={400}
                hitShadowClose={true}
                buttonAlign='right'
                bottomPadding={25}
            >
                <FormItem colon={false} label={getTranslation(this.locale, 'Entity Name')}>
                    {getFieldDecorator('showNodeLabel', {
                        initialValue: !hideNodeLabel,
                    })(
                        <RadioGroup>
                            <Radio value={true}>{getTranslation(this.locale, 'Show')}</Radio>
                            <Radio value={false}>{getTranslation(this.locale, 'Hide')}</Radio>
                        </RadioGroup>,
                    )}
                </FormItem>
                <FormItem colon={false} label={getTranslation(this.locale, 'Edge Name')}>
                    {getFieldDecorator('showEdgeLabel', {
                        initialValue: !hideEdgeLabel,
                    })(
                        <RadioGroup>
                            <Radio value={true}>{getTranslation(this.locale, 'Show')}</Radio>
                            <Radio value={false}>{getTranslation(this.locale, 'Hide')}</Radio>
                        </RadioGroup>,
                    )}
                </FormItem>

                <div className='divider'/>

                <FormItem colon={false} label={getTranslation(this.locale, 'Edge Font Size')}>
                    {getFieldDecorator('edgeFontSize', {
                        initialValue: edgeFontSize,
                    })(
                        <Slider min={12} max={36} marks={SliderMarker}/>,
                    )}
                </FormItem>
            </SophonModal>
        );
    }

    private refreshCanvas = () => {
        this.props.form.validateFields((error, values) => {
            if (!error) {
                this.doRefresh(values);
            }
        });
    }

    @loadingEffect(LoadingTargets.CANVAS_LAYOUT)
    private async doRefresh(values: any) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const oldSetting = this.cyState.canvasSetting;

                    const newSetting = Object.assign({}, oldSetting, {
                        hideNodeLabel: !values.showNodeLabel,
                        globalEdgeConfig: {
                            ...oldSetting.globalEdgeConfig,
                            hideEdgeLabel: !values.showEdgeLabel,
                            edgeFontSize: values.edgeFontSize,
                        },
                    });

                    setTimeout(() => {
                        runInAction(() => {
                            this.timeFilterService.setShowTimeFilter(false);
                            this.stateService.elementService.updateCanvasFromSetting(oldSetting, newSetting);
                            this.stateService.setShowSettingPanel(false);
                        });
                        resolve();
                    });
                } catch (err) {
                    reject(err);
                }
            });
        });
    }
}

export default Form.create()(CanvasSettingPanel);
