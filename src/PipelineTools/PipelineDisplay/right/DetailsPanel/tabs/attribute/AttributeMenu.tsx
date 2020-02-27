import React from 'react';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';

import {ClickParam} from 'antd/es/menu';
import {observer} from 'mobx-react';
import './AttributeMenu.scss';
import {CyEdgeData} from '../../../../model/CyEdge';
import {FieldConfig} from '../../../../model/FieldConfig';
import {CyNodeData} from '../../../../model/CyNode';
import {getTranslation, Locales} from '../../../../../../utils';
import {ElementType} from '../../../../interfaces';

export enum AttributeOperations {
    EDIT = 'edit',
    DELETE = 'delete',
}

export interface IClickParam {
    element: CyEdgeData | CyNodeData;
    elementType: ElementType;
    field: FieldConfig;
    operation: AttributeOperations;
}

interface IAttributeMenuProps {
    element: CyNodeData | CyEdgeData;
    elementType: ElementType;
    field: FieldConfig;
    locale: Locales;
    onClick: (param: IClickParam) => void; // name must be onClick, otherwise it won't disappear after clicking
}

@observer
export class AttributeMenu extends React.Component<IAttributeMenuProps> {
    public render() {
        return (
            <Menu onClick={this.onClick} selectable={false} className='operation-menu'>
                <Menu.Item key={AttributeOperations.EDIT}>
                    {getTranslation(this.props.locale, 'Edit Attribute')}
                </Menu.Item>
                <Menu.Item key={AttributeOperations.DELETE} disabled>
                    {getTranslation(this.props.locale, 'Delete Attribute')}
                </Menu.Item>
            </Menu>
        );
    }

    private onClick = (param: ClickParam) => {
        this.props.onClick({
            element: this.props.element,
            operation: param.key as AttributeOperations,
            field: this.props.field,
            elementType: this.props.elementType,
        });
    }
}
