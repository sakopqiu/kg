import React, {useCallback} from 'react';
import Radio, {RadioChangeEvent} from 'antd/es/radio';
import 'antd/es/radio/style';
import {getTranslation, Locales} from '../../../utils';
import {observer} from 'mobx-react-lite';
import {EdgeDirection} from '../interfaces';

const RadioGroup = Radio.Group;

interface IEdgeDirectionSelectProps {
    locale: Locales;
    value: EdgeDirection;
    onChange: (value: EdgeDirection) => void;
}

function EdgeDirectionSelect(props: IEdgeDirectionSelectProps) {
    const onChange = useCallback((e: RadioChangeEvent) => {
        props.onChange(e.target.value);
    }, []);

    return (
        <RadioGroup value={props.value} onChange={onChange}>
            <Radio value={'both'}>{getTranslation(props.locale, 'Bidirectional')}</Radio>
            <Radio value={'out'}>{getTranslation(props.locale, 'Outgoing')}</Radio>
            <Radio value={'in'}>{getTranslation(props.locale, 'Incoming')}</Radio>
        </RadioGroup>
    );
}

export default observer(EdgeDirectionSelect);
