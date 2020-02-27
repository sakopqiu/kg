import * as React from 'react';
import {CircleIcon} from '../../../../../icons/CircleIcon';
import {SquareIcon} from '../../../../../icons/SquareIcon';
import {DiamondIcon} from '../../../../../icons/DiamondIcon';
import {TextIcon} from '../../../../../icons/TextIcon';
import './index.scss';
import {complexInject} from '../../../DisplayCanvasUtils';
import {ComplexModeCanvasComponent} from '../../../components/complex/ComplexModeCanvasComponent';

@complexInject
export class AnnotationToolBar extends ComplexModeCanvasComponent {

    public render() {
        return (
            <div className='annotation-tool-bar'>
                <CircleIcon onClick={() => {
                    this.cyState.addDescriptionContainer('ellipse');
                }}/>
                <SquareIcon
                    onClick={() => {
                        this.cyState.addDescriptionContainer('rectangle');
                    }}
                />
                <DiamondIcon onClick={() => {
                    this.cyState.addDescriptionContainer('diamond');
                }}/>
                <TextIcon onClick={() => {
                    this.cyState.addText();
                }}/>
            </div>
        );
    }
}
