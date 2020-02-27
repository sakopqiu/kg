import * as React from 'react';
import {observer} from 'mobx-react';
import {LoadableStoreImpl, LoadingTargets} from '../stores/LoadableStoreImpl';
import Spin from 'antd/es/spin';
import 'antd/es/spin/style';
import {getLocale, getTranslation} from '../utils';

export interface TargetedLoadingProps {
    loadingTarget: LoadingTargets;
    store: LoadableStoreImpl;
    message?: string;
    backgroundColor?: string;
    noBackground?: boolean;
    backgroundPosition?: string;
}

export const spinnerStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate3D(-50%,-50%, 0)',
} as any;

@observer
export class TargetedLoading extends React.Component<TargetedLoadingProps> {

    get message() {
        const locale = getLocale();
        return (this.props.message || getTranslation(locale, 'Loading')) + '...';
    }

    body() {
        const body = <div
            className='targeted-loading'
            style={spinnerStyle}
        >
            <Spin tip={this.message} size='large'/>
        </div>;
        if (this.props.noBackground) {
            return body;
        } else {
            const backgroundStyle = {
                position: this.props.backgroundPosition || 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10000,
            } as any;

            if (this.props.backgroundColor) {
                backgroundStyle.backgroundColor = this.props.backgroundColor;
            }
            return (
                <div style={backgroundStyle}>
                    {body}
                </div>
            );
        }
    }

    render() {
        const store = this.props.store;
        return store.isLoading(this.props.loadingTarget) ? this.body() : null;
    }
}
