import * as React from 'react';
import './index.scss';

export interface ExtraHoverButtonConfig {
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
}

interface IHoverButtonsProps {
    upperHoverButtons?: ExtraHoverButtonConfig[];
    lowerHoverButtons?: ExtraHoverButtonConfig[];
    preprocessOnClick?: () => void;
}

export function HoverButtons(props: IHoverButtonsProps) {

    function renderExtraHoverButtons(extraHoverConfigs: ExtraHoverButtonConfig[]) {
        return extraHoverConfigs.map((config: ExtraHoverButtonConfig) => {
            return (
                <span className={`kg-hover-button`} onClick={() => {
                    if (props.preprocessOnClick) {
                        props.preprocessOnClick();
                    }
                    config.onClick();
                }} key={config.title}>
                            {config.icon}
                    <span>{config.title}</span>
                       </span>
            );
        });
    }

    function renderExtraLowerHoverButtons(extraHoverConfigs: ExtraHoverButtonConfig[]) {
        return extraHoverConfigs.map((config: ExtraHoverButtonConfig) => {
            return (
                <span className={`kg-hover-button-lower`} onClick={() => {
                    if (props.preprocessOnClick) {
                        props.preprocessOnClick();
                    }
                    config.onClick();
                }} key={config.title} title={config.title}>
                            {config.icon}
                       </span>
            );
        });
    }

    return (
        <React.Fragment>
            <div className={`kg-hover-buttons`}>
                {props.upperHoverButtons && renderExtraHoverButtons(props.upperHoverButtons)}
            </div>
            <div className='kg-hover-buttons-lower'>
                {props.lowerHoverButtons && renderExtraLowerHoverButtons(props.lowerHoverButtons)}
            </div>
        </React.Fragment>
    );
}
