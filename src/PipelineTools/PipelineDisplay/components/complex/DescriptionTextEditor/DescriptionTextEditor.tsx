import * as React from 'react';
import './index.scss';
import {ComplexModeCanvasComponent} from '../ComplexModeCanvasComponent';
import {complexInject} from '../../../DisplayCanvasUtils';

@complexInject
export class DescriptionTextEditor extends ComplexModeCanvasComponent {

    private ref = React.createRef<any>();
    private changeDescriptionTextValue = (e: any) => {
        this.stateService.setDescriptionTextValue(e.target.value);
        this.expand(this.ref.current);
    }

    private expand(textbox: any) {
        if (!textbox.startW) {
            textbox.startW = textbox.offsetWidth;
        }

        const style = textbox.style;

        // Force complete recalculation of width
        // in case characters are deleted and not added:
        style.width = 0;

        // http://stackoverflow.com/a/9312727/1869660
        let desiredW = textbox.scrollWidth;
        // Optional padding to reduce "jerkiness" when typing:
        desiredW += textbox.offsetHeight;

        style.width = Math.max(desiredW, textbox.startW) + 'px';
    }

    public componentDidMount() {
        if (this.ref && this.ref.current) {
            this.ref.current.focus();
            this.expand(this.ref.current);
        }
    }

    public render() {
        const dim = this.stateService.textEditorDimension!;
        return (
            <input className='description-text-editor'
                   ref={this.ref}
                   style={{
                       left: dim.x,
                       top: dim.y,
                   }}

                   value={this.stateService.descriptionTextValue}
                   onChange={this.changeDescriptionTextValue}
            />
        );
    }
}
