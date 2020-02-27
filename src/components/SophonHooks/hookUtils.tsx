import {
    useCallback,
    useEffect,
    useState,
    useRef,
    MutableRefObject,
    Dispatch,
    SetStateAction,
    useLayoutEffect,
} from 'react';
import {FunctionVariadic, nextEventLoop} from '../../utils';

export function useHitOnClose(maskClosable: boolean, containerRef: React.RefObject<any>, onClose: () => void) {
    const closeOnHit = useCallback((e: MouseEvent) => {
        let target: any = e.target!;

        let inside = false;
        while (target) {
            if (target === containerRef.current) {
                inside = true;
                break;
            }
            if (target.className && target.className.indexOf('ant-calendar-date') !== -1) {
                inside = true;
                break;
            }
            target = target.parentElement;
        }
        if (!inside) {
            onClose();
        }
    }, [containerRef]);

    useEffect(() => {
        if (maskClosable) {
            nextEventLoop(() => {
                window.addEventListener('click', closeOnHit);
            });

            return () => {
                window.removeEventListener('click', closeOnHit);
            };
        } else {
            return () => {
            };
        }
    });
}

// 自定义hooks是为了解决 console 里的Warning:
// State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect().
export function useOnChangeHandler<T>(initialState: T): [T, (val: T) => void] {
    const [value, setValue] = useState<T>(initialState);
    const onChange = useCallback((val: T) => {
        setValue(val);
    }, []);
    return [value, onChange];
}

export function useInputValueChange(initialValue?: string)
    : [string | undefined, (event: React.ChangeEvent<HTMLInputElement>) => void, Dispatch<SetStateAction<string | undefined>>] {
    const [value, setValue] = useState<string | undefined>(initialValue);
    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    }, []);
    return [value, onChange, setValue];
}

// refElement 为想要全屏的元素
export function useToggleFullscreen(refElement: any = document.documentElement, open?: () => void, close?: () => void) {
    return useCallback(() => {
        const fullScreenElement = (document as any).fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement;
        if (fullScreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitCancelFullScreen) {
                (document as any).webkitCancelFullScreen();
            } else if ((document as any).mozCancelFullScreen) {
                (document as any).mozCancelFullScreen();
            }
            if (close) {
                close();
            }
        } else {
            if (refElement.requestFullscreen) {
                refElement.requestFullscreen();
            } else if (refElement.mozRequestFullScreen) {
                refElement.mozRequestFullScreen();
            } else if (refElement.msRequestFullscreen) {
                refElement.msRequestFullscreen();
            } else if (refElement.webkitRequestFullscreen) {
                refElement.webkitRequestFullScreen();
            }
            if (open) {
                open();
            }
        }
    }, [refElement, open, close]);
}

// 用来判断props是否发生变化，相当于willReceiveProps
export function useIfPropsChanged(props: any, func: FunctionVariadic) {
    const firstTimeRef = useRef(true);
    useEffect(() => {
        if (!firstTimeRef.current) {
            func();
        }
        firstTimeRef.current = false;
    }, [props]);
}

export function useIfMultiplePropsChanged(propsArr: any[], func: FunctionVariadic) {
    const firstTimeRef = useRef(true);
    useEffect(() => {
        if (!firstTimeRef.current) {
            func();
        }
        firstTimeRef.current = false;
    }, propsArr);
}

export function useGetElementRef<T>(): [MutableRefObject<T | undefined>, (ref: T) => void] {
    const elementRef = useRef<T>();
    const getElementRef = useCallback((ref: T) => {
        elementRef.current = ref;
    }, []);
    return [elementRef, getElementRef];
}

export function useBooleanToggle(initialValue?: boolean): [boolean | undefined, () => void, () => void] {
    const [value, setValue] = useState(initialValue);
    const toggleTrue = useCallback(() => {
        setValue(true);
    }, []);
    const toggleFalse = useCallback(() => {
        setValue(false);
    }, []);
    return [value, toggleTrue, toggleFalse];
}

export interface PoolingOption {
    duration: number;
    initialLoad?: boolean;
}

export type HttpPoolFunc = (timer?: number) => void;

// initialLoad, call first http request when didmount
export function useHttpPooling(func: HttpPoolFunc, option: PoolingOption) {
    const timer = useRef(-1);
    useEffect(() => {
        if (option.initialLoad) {
            func();
        }
        timer.current = setInterval(() => func(timer.current), option.duration);
        return () => {
            clearInterval(timer.current);
        };
    }, []);
}

/**
 * 一个组件是否被hover状态的hook
 */
export function useIsHovered(dependency: any[], onMouseEnterFunc?: () => any, onMouseLeaveFunc?: () => any): [boolean, () => any, () => any] {
    const [hovered, setHovered] = useState(false);
    const onMouseEnter = useCallback(() => {
        setHovered(true);
        if (onMouseEnterFunc) {
            onMouseEnterFunc();
        }
    }, dependency);

    const onMouseLeave = useCallback(() => {
        setHovered(false);
        if (onMouseLeaveFunc) {
            onMouseLeaveFunc();
        }
    }, dependency);

    return [hovered, onMouseEnter, onMouseLeave];
}

/**
 * @param {React.MutableRefObject<any>} affixElementRef 需要被定住的元素
 * @param {number} offsetTop 定住之后距离顶部的距离
 * @param {HTMLElement | Window} containerElement 元素的父组件中第一个带滚动条的容器，默认为window
 */
export function useAffix(affixElementRef: React.MutableRefObject<any>, offsetTop: number, containerElement: HTMLElement | Window = window) {

    // 需要等元素被render，并且layout过后再调用
    useLayoutEffect(() => {
        if (!affixElementRef.current) {
            return;
        }
        const affixElement = affixElementRef.current;

        function getScrollTop() {
            const scrollTop = containerElement instanceof Window ? containerElement.pageYOffset : containerElement.scrollTop;
            return scrollTop;
        }

        // boundingRectTop代表的是元素距离viewport顶端的距离，需要加上容器自身的scrollTop，才是元素离开页面真正的位置
        // 该hook只支持一层container，如果元素有多个带有滚动条的外层容器，实际上应该讲这些外层容器的scrollTop全部相加即可
        // 但是这样性能比较差，故只实现一层
        const boundingBox = affixElement.getBoundingClientRect();
        const affixElementOffsetTop = boundingBox.top + getScrollTop();

        const previousPosition = affixElement.style.position;
        const previousTop = affixElement.style.top;
        const previousZIndex = affixElement.style.zIndex;

        const parentElement = affixElement.parentElement;
        const stuffDivId = 'stuffDiv' + Math.random();
        const monitor = (e: Event) => {
            if (getScrollTop() >= affixElementOffsetTop) {
                affixElement.style.position = 'fixed';
                affixElement.style.top = offsetTop + 'px';
                affixElement.style.zIndex = 9999;

                if (!document.getElementById(stuffDivId)) {
                    // 在parent开始出插入一个一样高的组件填充空间，不然因为fixed不占static控件，导致scrollTop会缩小
                    const newDiv = document.createElement('div');
                    newDiv.id = stuffDivId;
                    newDiv.style.width = '100%';
                    newDiv.style.height = boundingBox.height + 'px';
                    const computedStyle = getComputedStyle(affixElement);
                    newDiv.style.marginTop = computedStyle.marginTop;
                    newDiv.style.marginBottom = computedStyle.marginBottom;
                    parentElement.insertBefore(newDiv, affixElement);
                }
            } else {
                affixElement.style.position = previousPosition;
                affixElement.style.top = previousTop;
                affixElement.style.zIndex = previousZIndex;
                if (document.getElementById(stuffDivId)) {
                    parentElement.removeChild(document.getElementById(stuffDivId)!);
                }
            }
        };
        containerElement.addEventListener('scroll', monitor);

        return () => {
            containerElement.removeEventListener('scroll', monitor);
        };

    }, [affixElementRef.current]);
}
