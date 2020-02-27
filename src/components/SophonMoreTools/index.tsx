import {getLocale, getTranslation} from '../../utils';
import React from 'react';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import Popover from 'antd/es/popover';
import 'antd/es/popover/style';

import {MoreIcon} from '../../icons/MoreIcon';
import {observable, action} from 'mobx';
import {observer} from 'mobx-react';
import './index.scss';

@observer
export default class SophonMoreTools extends React.Component {
    wrapperRef: HTMLDivElement;
    innerRef: HTMLDivElement;
    @observable splitIndex: number = 0;

    @action
    setSplitIndex(index: number) {
        this.splitIndex = index;
    }

    stopPop = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    }

    moreBtn = (more: React.ReactNode[]) => {
        const content =
            <Menu className='more-btn-menu'>
                {
                    more.map((item: React.ReactNode, index: number) => {
                        return (
                            <Menu.Item key={`${index}-${new Date().getTime()}`}>{item}</Menu.Item>
                        );
                    })
                }
            </Menu>;

        return (
            <Popover title={null} content={content} placement='bottomRight' trigger='click' key={new Date().getTime()}>
                <Tooltip title={getTranslation(getLocale(), 'More Operations')}>
                    <span className='more-btn'>
                        <MoreIcon />
                    </span>
                </Tooltip>
            </Popover>

        );
    }

    componentDidMount() {
        const wrapperWidth = this.wrapperRef.clientWidth;
        const innerWidth = this.innerRef.clientWidth;
        let curWidth = 0;
        let index = 0;                                                          // 超过cell的children索引
        if (innerWidth > wrapperWidth) {
            const timer = setTimeout(() => {
                const aEles = this.innerRef.querySelectorAll('a')!;
                aEles.forEach((child, i) => {
                    curWidth += (child.clientWidth + 20);                       // 20 为margin的距离
                    if (curWidth >= wrapperWidth && index === 0) {
                        index = i;
                    }
                });
                if (index) {
                    this.setSplitIndex(index);
                }
                clearTimeout(timer);
            }, 0);
        }
    }

    render() {
        let children: React.ReactNode[] = React.Children.toArray(this.props.children);

        if (this.splitIndex) {
            const allChildren = React.Children.toArray(this.props.children);
            children = allChildren.slice(0, this.splitIndex);
            children.push(this.moreBtn(allChildren.slice(this.splitIndex)));
        }

        return (
            <div className='actions-wrapper' ref={ref => this.wrapperRef = ref!}>
                <div className='actions' onClick={this.stopPop} ref={ref => this.innerRef = ref!}>
                    { children }
                </div>
            </div>
        );
    }
}
