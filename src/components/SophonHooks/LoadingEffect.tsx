import * as React from 'react';
import {
    defaulGetErrorMsg,
    FunctionVariadic,
    getLocale,
    getTranslation,
    LoadingEffectOptions,
    showError,
    showMessage,
} from '../../utils';

export type PromiseFunctionWrapper<T> = (...args: any[]) => Promise<T>;

// 剔除 loadingTargetFunc 和 mainStoreFunc
export interface ILoadingEffectOption<T> extends Pick<LoadingEffectOptions<T>, Exclude<keyof LoadingEffectOptions<T>, 'loadingTargetFunc' | 'mainStoreFunc'>> {
    showSuccessMsg?: boolean;
}

// 用法可参考SophonParams_Test
export function useLoadingEffect<T = any>(func: FunctionVariadic, options?: ILoadingEffectOption<T>): [PromiseFunctionWrapper<T>, boolean] {
    const [flag, setFlag] = React.useState(false);
    const finalOption: ILoadingEffectOption<T> = {
        duration: 3,
        toBottom: 70,
        ...options,
    };

    // 返回tuple， 第一个为wrapped的function, 第二个为当前promise对应的loading flag
    return [async (...args: any[]) => {
        setFlag(true);
        try {
            // @ts-ignore
            const result = await (func.apply(this, args) as Promise<T>);

            if ((result as any) !== false && finalOption.showSuccessMsg) {
                if (finalOption.successMsgFunc) {
                    // @ts-ignore
                    showMessage(finalOption.successMsgFunc(this as any, result), finalOption.duration, finalOption.toBottom);
                } else {
                    showMessage(getTranslation(getLocale(), 'Operation Done'), finalOption.duration, finalOption.toBottom);
                }
            }
            return result;
        } catch (err) {
            if (!finalOption.suppressErrorMsg) {
                showError(defaulGetErrorMsg(err), finalOption.duration, finalOption.toBottom);
            }
            throw err;
        } finally {
            setFlag(false);
        }
    }, flag];
}
