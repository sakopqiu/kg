import * as React from 'react';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import Popover from 'antd/es/popover';
import 'antd/es/popover/style';
import Tooltip, {TooltipTrigger} from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import {extractNumeric, getLocale, getTranslation} from '../../utils';
import {MoreIcon} from '../../icons/MoreIcon';
import './index.hook.scss';
import _debounce from 'lodash/debounce';
import classNames from 'classnames';

const MenuItem = Menu.Item;
const moreBtnWidth = 20;
const moreBtnMarginLeft = 5;

export interface SophonMoreToolsHookProps {
    children: React.ReactNode;
    debugId?: string;
    hideAll?: boolean; // 如果设为true宽度不足以让元素完全展开时将收起所有元素
    moreBtnText?: string | React.ReactNode; // 自定义moreBtn
    awareWindowResize?: boolean;
    className?: string;
    style?: React.CSSProperties;
    moreToolMenuItem?: (index: number) => React.ReactNode;
    moreBtntrigger?: TooltipTrigger;
    moreBtnStyle?: React.CSSProperties;
    // moreBtn的宽度可能被定义在了moreBtnStyle中，但是控件内部计算可用宽度时需要知道moreBtn的宽度，因此需显式传入
    moreBtnWidth?: number;
    moreBtnHint?: string;
    moreBtnMenuClassName?: string;
}

interface MoreToolButton {
    splitIndex: number;
    total: number;
    renderAllItem?: boolean;
    btnText?: string | React.ReactNode;
    copyNodes?: React.ReactNode[];
    moreToolMenuItem?: (index: number) => React.ReactNode;
    moreBtnStyle?: React.CSSProperties;
    moreBtnWidth?: number;
    moreBtnTrigger?: TooltipTrigger;
    moreBtnHint?: string;
    moreBtnMenuClassName?: string;
}

function MoreToolButton(props: MoreToolButton) {
    const listItems: React.ReactNode[] = [];
    const splitIndex = props.renderAllItem ? 0 : props.splitIndex;

    // 如果用户定义了moreToolMenuItem，默认的menuItem样式不使用
    const moreToolMenuItemProvided = !!props.moreToolMenuItem;

    for (let i = splitIndex; i < props.total; i++) {
        if (!props.copyNodes && !props.moreToolMenuItem) {
            throw new Error('copyNodes或者moreToolMenuItem至少定义一个');
        }
        const itemNode = moreToolMenuItemProvided ? props.moreToolMenuItem!(i) :
            props.copyNodes![i];

        if (moreToolMenuItemProvided) {
            listItems.push(itemNode);
        } else {
            listItems.push(
                <MenuItem key={i}>
                    {itemNode}
                </MenuItem>,
            );
        }
    }

    // selectedKeys设置为空数组防止antd默认的选中效果
    // 如果用户定义了moreToolMenuItem，默认的menuItem样式不使用
    let popoverContent = null;
    if (!moreToolMenuItemProvided) {
        popoverContent = (
            <Menu selectedKeys={[]} className={classNames(`more-btn-menu ${props.moreBtnMenuClassName || ''}`)}>
                {listItems}
            </Menu>
        );
    } else {
        popoverContent = (
            <div>
                {listItems}
            </div>
        );
    }

    return (
        <Popover title={null} content={popoverContent} placement='bottomRight'
                 trigger={props.moreBtnTrigger || 'hover'}>
            <Tooltip title={props.moreBtnHint || getTranslation(getLocale(), 'More Operations')}>
                {props.btnText ||
                <span className='more-btn' style={props.moreBtnStyle || {}}>
                        <MoreIcon/>
                    </span>}
            </Tooltip>
        </Popover>
    );
}

function useSophonMoreToolsHook(props: SophonMoreToolsHookProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);

    // 组件被合并时会触发重绘，重绘又会导致组件的宽度再次被检测，为了避免死循环，这里放置一个表示当前已经"检查"过一次的flag
    const widthChecked = React.useRef<boolean>(false);

    // 当splitIndex为-1时，所有子控件正常显示
    // 否则，正常显示[0, splitIndex)，[splitIndex,]显示在moreBtn的菜单中
    const [splitIndex, setSplitIndex] = React.useState(-1);

    // 记录所有children的总宽度
    const [childrenTotalWidth, setChildrenTotalWidth] = React.useState();

    // 设置hideAll之后是否收起children以needHideAll来判断
    const [needHideAll, setNeedHideAll] = React.useState(false);

    React.useEffect(() => {
        layout(true);
    }, []);

    // 子元素变化了，宽度需要重新检验
    React.useEffect(() => {
        widthChecked.current = false;
        return () => {
        };
    }, [props.children]);

    // 当前的所有子节点，子节点可能包含了moreBtn，需要过滤掉
    function getChildrenDom() {
        if (!containerRef.current) {
            return [];
        }
        let childrenDom = Array.prototype.slice.apply(containerRef.current.children);
        const lastChild = childrenDom[childrenDom.length - 1];
        if (lastChild && lastChild.className.indexOf('more-btn') !== -1) {
            childrenDom = childrenDom.slice(0, childrenDom.length - 1);
        }
        return childrenDom;
    }

    // 检查当前容器是否能涵盖所有子节点，如果能，设置splitIndex为-1，如果不能，就设置splitIndex
    function layout(isDidMount?: boolean) {
        if (widthChecked.current) {
            return;
        }
        const container = containerRef.current!;
        if (!container) {
            console.warn('无法找到SophonMoreToolsHook的容器,debugId=' + props.debugId);
            return;
        }
        const containerWidth = container.offsetWidth;
        const containerPaddingLeft = extractNumeric(getComputedStyle(container).paddingLeft);

        let currentWidth = containerPaddingLeft + (props.moreBtnWidth || moreBtnWidth) + moreBtnMarginLeft;

        let splitIndexChanged = false;
        const containerDomChildren = getChildrenDom();
        const len = containerDomChildren.length;

        for (let i = 0; i < len; i++) {
            const child = containerDomChildren[i];

            const computedStyle = getComputedStyle(child);
            const marginLeft = extractNumeric(computedStyle.marginLeft);
            const marginRight = extractNumeric(computedStyle.marginRight);
            const totalWidth = child.offsetWidth + marginLeft + marginRight;
            currentWidth += totalWidth;

            if (!props.hideAll && currentWidth > containerWidth) {
                setSplitIndex(i);
                splitIndexChanged = true;
                break;
            }
        }
        // didMount的时候记录children的最大宽度，设置了hideAll之后是否收起children以 childrenMaxWidth > containerWidth 来判断
        if (isDidMount && props.hideAll) {
            setChildrenTotalWidth(currentWidth);
        }
        if (props.hideAll) {
            setNeedHideAll(childrenTotalWidth > containerWidth);
        }
        if (!splitIndexChanged) {
            setSplitIndex(-1);
        }
        // 避免死循环
        widthChecked.current = true;
    }

    function doResize() {
        widthChecked.current = false;
        layout();
    }

    const debouncedResize = _debounce(doResize, 50);

    React.useEffect(() => {
        // 不设置比特定时长更长的时间的情况下layout方法计算完宽度以后浏览器不会重绘dom
        setTimeout(() => {
            layout();
        }, 100);
        if (props.awareWindowResize) {
            window.addEventListener('resize', debouncedResize, true);
            return () => {
                window.removeEventListener('resize', debouncedResize, true);
            };
        }
        return () => {
        };
    });

    // 对于出现在splitIndex之后的元素，设置visibility为hidden，之所以不设置为display:none是因为，onResize的时候可能还需要当前元素的
    // 宽度，这时候只能读到0了
    React.useEffect(() => {
        const containerDomChildren = getChildrenDom();
        if (!props.hideAll) {
            for (let i = 0; i < containerDomChildren.length; i++) {
                containerDomChildren[i].style.visibility = i < splitIndex || splitIndex === -1 ? 'visible' : 'hidden';
            }
        } else if (props.hideAll && needHideAll) {
            for (let i = 0; i < containerDomChildren.length; i++) {
                if (i !== containerDomChildren.length - 1) {
                    containerDomChildren[i].style.display = 'none';
                }
            }
        }
    });

    function renderContent() {
        if (!needHideAll && splitIndex === -1) {
            return props.children;
        } else {
            const children = React.Children.toArray(props.children);

            const moreButton = <MoreToolButton
                key='more-btn'
                renderAllItem={props.hideAll && needHideAll}
                btnText={props.moreBtnText}
                moreBtnTrigger={props.moreBtntrigger}
                moreBtnHint={props.moreBtnHint}
                splitIndex={splitIndex} total={children.length}
                copyNodes={children}
                moreToolMenuItem={props.moreToolMenuItem}
                moreBtnStyle={props.moreBtnStyle}
                moreBtnWidth={props.moreBtnWidth}
                moreBtnMenuClassName={props.moreBtnMenuClassName}
            />;

            return [...children, moreButton];
        }
    }

    return {containerRef, renderContent};
}

const wrapperClassName = 'sophon-more-tools-hook-wrapper';

export const stopPop = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
};

export function SophonMoreToolsHookWrapper(props: SophonMoreToolsHookProps) {
    const {containerRef, renderContent} = useSophonMoreToolsHook(props);
    const className = props.className ? wrapperClassName + ' ' + props.className
        : wrapperClassName;

    const style = props.style || {};

    return (
        <div className={className} ref={containerRef} style={style} onClick={stopPop}>
            {renderContent()}
        </div>
    );
}
