import {IPipeline} from './PipelineTools/PipelineEditor/interfaces';

const ACCESS_TOKEN = 'accessToken';
export const LOCALE_VAR = 'LOCALE';
export const THEME_VAR = 'THEME';
import {getFromLocalStorage, saveToLocalStorage, Locales} from './utils';
import {IPipelineParent} from './models/SimplePipelineModel';

export interface IPipelineIntro {
    pipelineName: string;
    pipelineId: string;
    parents?: IPipelineParent[];
}

export class CacheUtils {
    FLOW_TABS = 'FLOW_TABS';
    LAB_LIST_CONFIG = 'LAB_LIST_CONFIG';
    CURRENT_SELECTED_PATH = 'CURRENT_SELECTED_PATH';
    LAST_LAB_PATH = 'LAST_LAB_PATH';
    RECTANGLE_FLOW = 'RECTANGLE_FLOW';
    CIRCLE_FLOW1 = 'CIRCLE_FLOW1';
    CIRCLE_FLOW2 = 'CIRCLE_FLOW2';
    CURRENT_SELECTED_EDITOR_PIPELINE = 'CURRENT_SELECTED_EDITOR_PIPELINE';
    CURRENT_SELECTED_DISPLAY_PIPELINE = 'CURRENT_SELECTED_DISPLAY_PIPELINE';

    saveOpenTabs(flowIDs: string[]) {
        return saveToLocalStorage(this.FLOW_TABS, flowIDs, 0);
    }

    getOpenTabs() {
        return getFromLocalStorage<string[]>(this.FLOW_TABS);
    }

    getLocale(): Locales {
        return getFromLocalStorage<Locales>(LOCALE_VAR) || Locales.zh;
    }

    saveLocale(local: Locales) {
        saveToLocalStorage(LOCALE_VAR, local);
    }

    saveUserToken(token: string) {
        saveToLocalStorage(ACCESS_TOKEN, token, 0);
    }

    getUserToken() {
        return getFromLocalStorage<string>(ACCESS_TOKEN);
    }

    deleteUserToken() {
        localStorage.removeItem(ACCESS_TOKEN);
    }

    saveRectangleFlow(json: IPipeline) {
        saveToLocalStorage(this.RECTANGLE_FLOW, JSON.stringify(json), 0);
    }

    getRectangleFlow() {
        const str = getFromLocalStorage<string>(this.RECTANGLE_FLOW) || '{}';
        const obj = JSON.parse(str);
        if (!obj.pipeline_id) {
            obj.pipeline_id = this.RECTANGLE_FLOW;
            obj.pipeline_name = this.RECTANGLE_FLOW;
        }
        return obj as IPipeline;
    }

    setCurrentSelectedEditablePipeline(id: string, name: string, parents?: IPipelineParent[]) {
        const savedData: IPipelineIntro = {
            pipelineId: id,
            pipelineName: name,
            parents,
        };
        saveToLocalStorage(this.CURRENT_SELECTED_EDITOR_PIPELINE, JSON.stringify(savedData));
    }

    getCurrentSelectedEditablePipeline(): IPipelineIntro {
        const str = getFromLocalStorage<string>(this.CURRENT_SELECTED_EDITOR_PIPELINE) || '{}';
        return JSON.parse(str) as IPipelineIntro;
    }

    setCurrentSelectedDisplayPipeline(id: string, name: string, parents?: IPipelineParent[]) {
        const savedData: IPipelineIntro = {
            pipelineId: id,
            pipelineName: name,
            parents,
        };
        saveToLocalStorage(this.CURRENT_SELECTED_DISPLAY_PIPELINE, JSON.stringify(savedData));
    }

    getCurrentSelectedDisplayPipeline(): IPipelineIntro {
        const str = getFromLocalStorage<string>(this.CURRENT_SELECTED_DISPLAY_PIPELINE) || '{}';
        return JSON.parse(str) as IPipelineIntro;
    }

    saveCircleFlow(json: IPipeline) {
        saveToLocalStorage(this.CIRCLE_FLOW1, JSON.stringify(json), 0);
    }

    getCircleFlow() {
        const str = getFromLocalStorage<string>(this.CIRCLE_FLOW1) || '{}';
        const obj = JSON.parse(str);
        if (!obj.pipeline_id) {
            obj.pipeline_id = this.CIRCLE_FLOW1;
            obj.pipeline_name = this.CIRCLE_FLOW1;
        }
        return obj as IPipeline;
    }

    saveCircleFlow2(json: IPipeline) {
        saveToLocalStorage(this.CIRCLE_FLOW2, JSON.stringify(json), 0);
    }

    getCircleFlow2() {
        const str = getFromLocalStorage<string>(this.CIRCLE_FLOW2) || '{}';
        const obj = JSON.parse(str);
        if (!obj.pipeline_id) {
            obj.pipeline_id = this.CIRCLE_FLOW2;
            obj.pipeline_name = this.CIRCLE_FLOW2;
        }
        return obj as IPipeline;
    }

    clearCache() {
        localStorage.clear();
    }

    getLabListConfig() {
        return getFromLocalStorage<{}>(this.LAB_LIST_CONFIG);
    }

    saveLabListConfig(config: {}) {
        saveToLocalStorage(this.LAB_LIST_CONFIG, config);
    }

    saveCurrentSelectedPath(path: string) {
      if (path) {
        sessionStorage.setItem(this.CURRENT_SELECTED_PATH, path);
      }
    }

    getCurrentSelectedPath() {
        return sessionStorage.getItem(this.CURRENT_SELECTED_PATH);
    }

    saveLastLabPath(path: string) {
        saveToLocalStorage(this.LAST_LAB_PATH, path);
    }

    getLastLabPath() {
        return getFromLocalStorage<string>(this.LAST_LAB_PATH);
    }
}

export const cacheUtils = new CacheUtils();
