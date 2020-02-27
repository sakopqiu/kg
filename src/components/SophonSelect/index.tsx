import React from 'react';
import Dropdown from 'antd/es/dropdown';
import 'antd/es/dropdown/style';
import Menu, {ClickParam} from 'antd/es/menu';
import 'antd/es/menu/style';

import './index.scss';
import {observer} from 'mobx-react';
import {getTranslation, Locales} from '../../utils';

export interface ISophonOption {
    value: string;
    // title和render快乐2选1
    title?: string;
    // render函数应该使用MenuItem或者SubMenu包裹
    render?: () => {};
    disabled?: boolean;
}

interface ISophonSelectProps {
    value: string;
    forceValue?: string; // 元素被选中后强制出现在select框里的值
    options: ISophonOption[];
    onChange?: (value: string, rawData: any, keyPath: string[]) => void;
    locale?: Locales;
    // 当前没有任何选中的时候的提示信息
    noMatchMsg?: string;
    // 当options为空时的提示信息
    noDataMsg?: string;
    className?: string;
}

// TODO!!! @Nate,请补充一下这个控件的文档，他与Antd的select有什么区别
@observer
export class SophonSelect extends React.Component<ISophonSelectProps> {

    get activeTitle() {
        if (this.props.forceValue) {
            return this.props.forceValue;
        }
        const target = this.props.options.find((option) => option.value === this.props.value);
        return target ? target.title : (this.props.noMatchMsg || '');
    }

    public render() {
        const menu = (
            <Menu className='sophon-select-menu' onClick={this.onClick}>
                {!!this.props.options.length ? this.props.options.map((option) => {
                        if (option.render) {
                            const rendered = option.render();
                            return rendered;
                        } else {
                            return (
                                <Menu.Item key={option.value} title={option.title!} disabled={option.disabled}>
                                    {option.title!}
                                </Menu.Item>
                            );
                        }
                    }) :
                    <Menu.Item key={'no-data'} disabled={true}>
                        {this.props.noDataMsg || getTranslation(this.props.locale || Locales.zh, 'No Data')}
                    </Menu.Item>
                }
            </Menu>
        );
        return (
            <div className={`sophon-select-wrapper ${this.props.className || ''}`}>
                <Dropdown
                    overlay={menu}
                    trigger={['click']}
                >
                    <div className='sophon-selector'>
                        <span className='sophon-selected' title={this.activeTitle}>{this.activeTitle}</span>
                        <span className='handler'>
                            <span className='triangle'/>
                        </span>
                    </div>
                </Dropdown>
            </div>
        );
    }

    private onClick = (params: ClickParam) => {
        this.props.onChange && this.props.onChange(params.key, params.item.props.data, params.keyPath);
    }
}
