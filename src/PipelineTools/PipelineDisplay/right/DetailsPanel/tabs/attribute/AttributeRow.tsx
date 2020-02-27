import React from 'react';
import Row from 'antd/es/row';
import 'antd/es/row/style';
import Col from 'antd/es/col';
import 'antd/es/col/style';
import './AttributeRow.scss';
import {observer} from 'mobx-react-lite';

interface IAttributeRowProps {
    attrName: React.ReactNode;
    attrValue: React.ReactNode;
    type?: 1 | 2; // 2种风格，一种是属性名和值在一行，一种是跨两行
    spanCols?: number[];
}

function AttributeRow(props: IAttributeRowProps) {
    const type = props.type || 1;
    const spanCols = props.spanCols || (type === 1 ? [4, 20] : [24, 24]);
    return (
        <Row className='field-description-row'>
            <Col className='field-name' span={spanCols[0]}>
                {props.attrName}:
            </Col>
            <Col className={`field-value ${type === 1 ? 'field-value-inline' : ''}`} span={spanCols[1]}
                 style={{marginTop: type === 1 ? 0 : 5, whiteSpace: 'pre-wrap'}}>
                {props.attrValue}
            </Col>
        </Row>
    );
}

export default observer(AttributeRow);
