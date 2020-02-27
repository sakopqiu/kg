import React, {CSSProperties} from 'react';
import './AttributePanel.scss';
import {observer} from 'mobx-react-lite';
import {DEFAULT_TIMESTAMP_FORMAT, isNumberType, isTimeRelatedType, parseMoment} from '../../../../../../utils';

interface IAttributePanelProps {
    name: string;
    value: string;
    type?: string;
    style?: CSSProperties;
    className?: string;
    topRightTool?: React.ReactNode; // top right tool button
}

function AttributePanel(props: IAttributePanelProps) {
    let finalValue = props.value;
    if (isTimeRelatedType(props.type)) {
        const momentValue = parseMoment(finalValue);
        finalValue = momentValue ? momentValue.format(DEFAULT_TIMESTAMP_FORMAT) : 'N/A';
    }
    return (
        <div className={`attribute-panel ${props.className}`} style={props.style}>
            <div className='attribute-panel-header'>
                <div className='name-bar'/>
                <div className='field-name'>{`${props.name}${props.type ? ` (${props.type})` : ''}`}</div>
                {props.topRightTool && <div className='setting'>
                    {props.topRightTool}
                </div>}
            </div>
            <div className='attribute-panel-content'>
                {isNumberType(props.type) ? parseFloat(finalValue).toLocaleString('us') : finalValue}
            </div>
        </div>
    );
}

export default observer(AttributePanel);
