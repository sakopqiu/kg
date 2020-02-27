import * as React from 'react';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import {SearchIcon} from '../../../../../icons/SearchIcon';
import {CloseIcon} from '../../../../../icons/CloseIcon';
import {ArrowDownIcon} from '../../../../../icons/ArrowDownIcon';
import './index.scss';
import {getTranslation} from '../../../../../utils';
import _debounce from 'lodash/debounce';
import classNames from 'classnames';
import {IReactionDisposer, reaction} from 'mobx';
import {observer} from 'mobx-react';
import {CommonPipelineDisplayComponent, CommonPipelineDisplayComponentProps} from '../CommonPipelineDisplayComponent';

interface SearchResult {
    searchString: string;
    eligibleIds: string[];
    currentIndex: number;
}

export interface SearchModalProps extends CommonPipelineDisplayComponentProps {
    style?: React.CSSProperties;
}

@observer
export class SearchModal extends CommonPipelineDisplayComponent<SearchModalProps, SearchResult> {
    private ref = React.createRef<any>();
    private reactionDisposer: IReactionDisposer;

    constructor(props: SearchModalProps) {
        super(props);
        this.state = {
            searchString: '',
            eligibleIds: [],
            currentIndex: 0,
        };
        this.reactionDisposer = reaction(() => {
            // 下面3元素只有有任意一个改变了，都要重新计算搜索结果
            return this.state.searchString.trim();
        }, (searchString: string) => {
            this.resetSearchResult(searchString);
        });
    }

    componentWillUnmount() {
        if (this.reactionDisposer) {
            this.reactionDisposer();
        }
    }

    get elementService() {
        return this.stateService.elementService;
    }

    private resetSearchResult = _debounce((str: string) => {
        if (str === '') {
            this.setState({
                eligibleIds: [],
                currentIndex: 0,
            });
            this.selectionService.unselectAll();
            return;
        }

        const eligibleIds = this.cyState.searchFor(str);
        this.setState({
            eligibleIds,
            currentIndex: 0,
        });
        if (eligibleIds.length > 0) {
            this.selectionService.selectElementsByIds([eligibleIds[0]]);
        }
    }, 500);

    private onChange = (e: any) => {
        this.setState({
            searchString: e.target.value,
        });
    }

    public componentDidMount() {
        if (this.ref && this.ref.current) {
            this.ref.current.focus();
        }
    }

    get currentIndex() {
        if (this.length === 0) {
            return 0;
        }
        return this.state.currentIndex + 1;
    }

    get length() {
        return this.state.eligibleIds.length;
    }

    private changeIndex(nextIndex: number) {
        this.setState({
            currentIndex: nextIndex,
        });
        this.selectionService.selectElementsByIds([this.state.eligibleIds[nextIndex]]);
    }

    private prev = () => {
        let nextIndex = this.state.currentIndex - 1;
        if (nextIndex < 0) {
            nextIndex = this.length - 1;
        }
        this.changeIndex(nextIndex);

    }

    private next = () => {
        const nextIndex = (this.state.currentIndex + 1) % this.length;
        this.changeIndex(nextIndex);
    }

    private selectAll = () => {
        this.selectionService.selectElementsByIds(this.state.eligibleIds);
        this.stateService.setShowSearchBox(false);
    }

    private invertSelection = () => {
        this.selectionService.invertSelectionBy(this.state.eligibleIds);
        this.stateService.setShowSearchBox(false);
    }

    private close = () => {
        this.stateService.setShowSearchBox(false);
    }

    public render() {
        const disableIconClass = classNames({disabled: this.length === 0});

        return (
            <div className='pipeline-search-modal'
                 style={this.props.style || {}}
            >
                <div className='search-area'>
                    <Input className='search-input'
                           ref={this.ref}
                           value={this.state.searchString}
                           onChange={this.onChange}
                           placeholder={getTranslation(this.locale, 'Input entity/relation name')}
                    />
                    <SearchIcon className='search-icon'/>
                    <div className='current-status'>
                        {this.currentIndex} / {this.length}
                    </div>
                    <div className='interaction-buttons'>
                        <div className='split-bar'/>
                        <ArrowDownIcon
                            style={{
                                transform: 'rotate(180deg)',
                                position: 'relative',
                                top: -2,
                            }}
                            className={disableIconClass} onClick={this.prev}/>
                        <ArrowDownIcon className={disableIconClass} onClick={this.next}/>
                        <CloseIcon onClick={this.close}/>
                    </div>
                </div>
                <div className='selection-area'>
                    <span
                        className={classNames({disabled: this.length === 0})}
                        onClick={this.selectAll}>{getTranslation(this.locale, 'SelectAll')}</span>
                    <span
                        className={classNames({disabled: this.length === 0})}
                        onClick={this.invertSelection}>{getTranslation(this.locale, 'Invert Selection')}</span>
                </div>
            </div>
        );
    }
}
