import {CyState} from '../model/CyState';
import {debug} from '../../../utils';
import invariant from 'invariant';
import {runInAction} from 'mobx';
import {Community} from '../model/Community';

export type MacroEngineType = 'community' | 'selection';

export interface MarcoEngineConfig {
    macro: string; // 运行宏，返回结果将被使用
    macroDefault?: string; // 宏返回null，undefined，或者执行宏失败了的默认返回值，不填写的话为空字符串
    type: MacroEngineType;
    communityOption?: {
        nodeType: string; // 节点类型，比如人，公司
        attr: string; // 实体属性
    };
    extra?: any[]; // 参见communityByKeyWord
    target?: 'node' | 'edge' | 'node_edge'; // 目前实现只针对node，预留其他情况
}

function getEvalScript(macro: string, macroDefault: string) {
    const script = `
    (function gen(){
      return function (node, extra){// extra是除了node之外可以另外传的参数
         try{
            ${macro}
         }catch(e){
            console.error(e);
            return ${macroDefault};
         }
      }
    })();
    `;
    debug('macro script', script);
    try {
        return eval(script);
    } catch (e) {
        console.error(e);
        return () => {
            return macroDefault;
        };
    }
}

function getOrCreateCommunity(state: CyState, nodeType: string, attr: string, map: Map<string, Community>, name: string) {
    if (map.has(name)) {
        return map.get(name)!;
    }
    const colorManager = state.drawService.colorManager;
    const newCommunity = Community.newManualCommunity(state, nodeType, attr, name, name);
    const newColor = colorManager.getColorForType(newCommunity.name);
    newCommunity.setColor(newColor);
    state.addNewCommunity(newCommunity);
    // key不能用newCommunity.name，因为newCommunity.name在内部被处理过
    map.set(name, newCommunity);
    return newCommunity;
}

export function executeMacro(state: CyState, props: MarcoEngineConfig) {
    const {macro, macroDefault = '', type} = props;
    runInAction(() => {
        if (type === 'community') {
            const {nodeType, attr} = props.communityOption!;
            // 清理原来的社群
            state.clearCommunities();
            const newCommunitiesMap: Map<string, Community> = new Map<string, Community>();
            const newParentFunction = getEvalScript(macro, macroDefault);
            state.cyNodes.forEach(node => {
                if (node.data.nodeType === nodeType) {
                    const newParentName = newParentFunction(node, props.extra);
                    if (!!newParentName) {
                        const newCommunity = getOrCreateCommunity(state, nodeType, attr, newCommunitiesMap, newParentName);
                        node.data.parent = newCommunity.id;
                    }
                } else {
                    node.data.parent = '';
                }
            });

        } else if (type === 'selection') {
            const selectedFunction = getEvalScript(macro, macroDefault);
            state.cyNodes.forEach(node => {
                node.selected = !!selectedFunction(node);
            });
        }
    });
}

/**
 * 根据前缀分社群
 * @param {string} nodeType cyNode的nodeType
 * @param {string} attr cyNode的某个属性
 * @param {number} length 前缀长度
 * @returns {MarcoEngineConfig}
 */
export function communityByPrefix(nodeType: string, attr: string, length: number): MarcoEngineConfig {
    invariant(nodeType, 'nodeType必须提供');
    invariant(attr, 'attr必须提供');
    invariant(length > 0, 'length必须为证正数');
    return {
        type: 'community',
        communityOption: {
            nodeType,
            attr,
        },
        macro: `return node.getValue('${attr}').substring(0, ${length})`,
        macroDefault: '',
    };
}

/**
 * 根据后缀分社群
 * @param {string} nodeType cyNode的nodeType
 * @param {string} attr cyNode的某个属性
 * @param {number} length 后缀长度
 * @returns {MarcoEngineConfig}
 */
export function communityBySuffix(nodeType: string, attr: string, length: number): MarcoEngineConfig {
    invariant(nodeType, 'nodeType必须提供');
    invariant(attr, 'attr必须提供');
    invariant(length > 0, 'length必须为证正数');
    return {
        type: 'community',
        communityOption: {
            nodeType,
            attr,
        },
        macro: `
            const value = node.getValue('${attr}') || '';
            return value.substring(value.length - ${length})
        `,
        macroDefault: '',
    };
}

/**
 * 根据前缀分社群
 * @param {string} nodeType cyNode的nodeType
 * @param {string} attr cyNode的某个属性
 * @param {number} length 前缀长度
 * @returns {MarcoEngineConfig}
 */
export function communityByKeywords(nodeType: string, attr: string, keywordStr: string): MarcoEngineConfig {
    invariant(nodeType, 'nodeType必须提供');
    invariant(attr, 'attr必须提供');
    const keywords = keywordStr.trim().split(',');
    invariant(keywords.length > 0, 'keywordStr不能为空');
    return {
        type: 'community',
        communityOption: {
            nodeType,
            attr,
        },
        macro: `
           const keywords = extra;
           for(let i = 0;i < extra.length;i++){
               const keyword = extra[i].toLowerCase();
               if(!keyword){continue;}
               const attrValue = (node.getValue('${attr}') || '').toLowerCase();
               if(attrValue.indexOf(keyword) !== -1){
                   return 'contains ' + keyword;
               }
           }
           return '';//没有匹配上任何keyword,不分组
        `,
        extra: keywords,
        macroDefault: '',
    };
}

// 用户自己能提供的宏
export function communityByMacro(nodeType: string, attr: string, macro: string): MarcoEngineConfig {
    invariant(nodeType, 'nodeType必须提供');
    invariant(attr, 'attr必须提供');
    invariant(macro, 'macro不能为空');
    return {
        type: 'community',
        communityOption: {
            nodeType,
            attr,
        },
        macro,
        macroDefault: '',
    };
}
