import * as React from 'react';
import './index.scss';
import Radio from 'antd/es/radio';
import 'antd/es/radio/style';
import {RadioChangeEvent} from 'antd/es/radio';
import {complexInject} from '../../../../DisplayCanvasUtils';
import {ComplexModeCanvasComponent} from '../../ComplexModeCanvasComponent';
import {getTranslation} from '../../../../../../utils';

const RadioGroup = Radio.Group;

@complexInject
export class DiffFilterRadioGroup extends ComplexModeCanvasComponent {

    private changeShowAll = (e: RadioChangeEvent) => {
        this.diffService.setShowAll(e.target.value);
    }

    public render() {
        const s = this.diffService;
        return (
            <RadioGroup className='diff-helper-radiogroup' value={s.showAll} onChange={this.changeShowAll}>
                <Radio value={true}>{getTranslation(this.locale, 'All')}</Radio>
                <Radio value={false}>{getTranslation(this.locale, 'Changed Elements')}</Radio>
            </RadioGroup>
        );
    }
}
