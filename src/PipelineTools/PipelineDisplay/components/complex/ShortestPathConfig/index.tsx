import React from 'react';
import './index.scss';
import {getTranslation} from '../../../../../utils';
import Button from 'antd/es/button';
import 'antd/es/button/style';
import Select from 'antd/es/select';
import 'antd/es/select/style';
import Divider from 'antd/es/divider';
import 'antd/es/divider/style';

import {action, observable} from 'mobx';
import {PathAlgos} from '../../../service/CanvasDrawService';
import {WeightConfig} from './WeightConfig';
import {PositionHandler} from '../../../context_menu/PositionHandler';
import {TagLabels} from '../TagLabels';
import {complexInject} from '../../../DisplayCanvasUtils';

enum Scene {
    MAIN = 'main',
    WEIGHT_CONFIG = 'weightConfig',
}

const WeightSupportedAlgorithms = new Set<PathAlgos>([PathAlgos.DIJKSTRA, PathAlgos.ASTAR]);

const Option = Select.Option;

@complexInject
export class ShortestPathConfig extends PositionHandler {

    @observable public currentScene: Scene = Scene.MAIN;
    @observable public selectedAlgorithm: PathAlgos = PathAlgos.DIJKSTRA; // Default is
    // key is the relationship and value is selected field, it could be null
    // initialize the config with this.stateService.edgeConfigs
    @observable public weightConfig: Map<string, string | null> = this.initializeWeightConfig;
    // previous old config
    private oldConfig: Map<string, string | null>;

    get initializeWeightConfig() {
        return Array.from(this.cyState.edgeConfigs.keys()).reduce((result, edge) => {
            result.set(edge, null);
            return result;
        }, new Map<string, string | null>());
    }

    get renderMain() {
        return (
            <React.Fragment>
                <div className='neighbor-header'>
                    <span>{getTranslation(this.locale, 'Find shortest path algorithm')}</span>
                </div>
                <Select value={this.selectedAlgorithm} onChange={this.onAlgorithmChange}>
                    {Object.values(PathAlgos).filter((item) => WeightSupportedAlgorithms.has(item)).map((algorithm) => (
                        <Option key={algorithm} value={algorithm}>{getTranslation(this.locale, algorithm)}</Option>
                    ))}
                </Select>
                <div className='neighbor-header' style={{marginTop: 25}}>
                    <span>{getTranslation(this.locale, 'Configure Weight')}</span>
                    <span className='tool-btn' onClick={this.openWeightConfig}>
                        {getTranslation(this.locale, 'Select Fields')}
                    </span>
                </div>
                <div className='neighbor-body'>
                    {this.weightConfig.size === 0 && getTranslation(this.locale, 'Weight Hint')}
                    {this.weightConfig.size !== 0 && <TagLabels
                        labels={Array.from(this.weightConfig).map((entry) => `${entry[0]}${entry[1] ? ` - ${entry[1]}` : ''}`)}/>}
                </div>
            </React.Fragment>
        );
    }

    public render() {
        return (
            <div
                ref={this.ref}
                className={`${this.currentScene === Scene.MAIN ? 'context-menu-common' : 'weight-config-modal'}`}
                style={{left: this.stateService.canvasContextMenuX, top: this.stateService.canvasContextMenuY}}
            >
                <div className='context-menu-content'>
                    {this.currentScene === Scene.MAIN && this.renderMain}
                    {this.currentScene === Scene.WEIGHT_CONFIG &&
                    <WeightConfig values={this.weightConfig} onChange={this.onWeightChange}/>}
                </div>
                {this.currentScene === Scene.WEIGHT_CONFIG && <Divider/>}
                <div className='buttons'>
                    <Button className='cancel' size={'small'}
                            onClick={this.cancel}>{getTranslation(this.locale, 'Cancel')}</Button>
                    <Button size={'small'} onClick={this.confirm}
                            type='primary'>{getTranslation(this.locale, 'Confirm')}</Button>
                </div>
            </div>
        );
    }

    @action
    private onAlgorithmChange = (value: PathAlgos) => {
        this.selectedAlgorithm = value;
    }

    @action
    private onWeightChange = (values: Map<string, string | null>) => {
        this.weightConfig = values;
    }

    @action
    private cancel = () => {
        if (this.currentScene === Scene.WEIGHT_CONFIG) {
            this.weightConfig = this.oldConfig;
            this.currentScene = Scene.MAIN;
        } else {
            this.stateService.setShowShortestPathConfigModal(false);
        }
    }

    @action
    private confirm = () => {
        if (this.currentScene !== Scene.MAIN) {
            this.currentScene = Scene.MAIN;
        } else {
            const eleService = this.stateService.elementService;
            const callbacks = this.canvasConfig!.displayModeConfig!.callbacks;
            this.stateService.elementService.updateEdgesWeight(this.weightConfig);

            this.algoService.findShortestPath(this.selectedAlgorithm, this.weightConfig, eleService.pathStart!, eleService.pathEnd!);
            this.stateService.setShowShortestPathConfigModal(false);
            if (callbacks && callbacks.onFindShortestPathConfirm) {
                callbacks.onFindShortestPathConfirm(eleService.pathStart!, eleService.pathEnd!, this.selectedAlgorithm, this.weightConfig);
            }
        }
    }

    @action
    private openWeightConfig = () => {
        this.currentScene = Scene.WEIGHT_CONFIG;
        this.oldConfig = this.weightConfig;
    }
}
