import * as React from 'react';
import {ScrollSync} from 'react-virtualized/dist/es/ScrollSync';
import {AutoSizer} from 'react-virtualized/dist/es/AutoSizer';
import {Grid, GridCellProps} from 'react-virtualized/dist/es/Grid';
import './index.scss';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import {getTranslation} from '../../utils';
import {cacheUtils} from '../../cacheUtils';
import { CellProps, SophonTableProps } from './interface';

function Cell(props: CellProps) {
    const headerTooltip = props.headerTooltip === undefined ? true : props.headerTooltip;
    const content = (
        <div
            className={`sophon-table-cell ${(props.rowIndex + 1) % 2 === 0 ? 'even' : 'odd'}`}
            key={props.key}
            style={{
                ...props.style,
                lineHeight: props.rowHeight + 'px',
            }}
        >{ props.value }</div>
    );
    return (
        headerTooltip ? (
            <Tooltip key={props.key} title={props.value}>
                {content}
            </Tooltip>
        ) : content
    );
}

function SophonTable(props: SophonTableProps) {
    const rowHeight = React.useMemo(() => {
        return props.rowHeight ? props.rowHeight : 45;
    }, [props.rowHeight]);

    const headerHeight = React.useMemo(() => {
        return props.headerHeight ? props.headerHeight : 45;
    }, [props.headerHeight]);

    const columns = React.useMemo(() => {
        const c = [...props.columns];
        if (props.showIndex) {
            c.unshift(getTranslation(cacheUtils.getLocale(), 'Index' ));
        }
        return c;
    }, [props.columns]);

    const rows = React.useMemo(() => {
        const r = [...props.rows];
        if (props.showIndex) {
            r.forEach((item: string[], index: number) => {
                item.unshift(index.toString());
            });
        }
        return r;
    }, [props.rows]);

    const columnsCount = React.useMemo(() => {
        return props.columns.length;
    }, [columns]);

    const minCellWidth = React.useMemo(() => {
        return props.minCellWidth ? props.minCellWidth : 100;
    }, [columns]);

    const minWidth = React.useMemo(() => {
        return columnsCount * minCellWidth;
    }, [columnsCount]);

    const rowsCount = React.useMemo(() => {
        return rows.length;
    }, [rows]);

    function headerRenderer({ columnIndex, key, rowIndex, style }: GridCellProps) {
        const v = columns[columnIndex];
        return props.renderHeader ? props.renderHeader(key, rowIndex, columnIndex, style, headerHeight, columns) : (
            <Cell rowHeight={rowHeight} columns={columns} rowIndex={rowIndex} columnIndex={columnIndex}
                  headerTooltip={props.headerTooltip}
                  value={ v } key={key} style={{...style}} />
        );
    }

    function bodyRenderer({ columnIndex, key, rowIndex, style }: GridCellProps) {
        const v = rows && rows[rowIndex] ? rows[rowIndex][columnIndex] : '';

        return props.renderCell ? props.renderCell(key, rowIndex, columnIndex, style, rowHeight, rows, columns) : (
            <Cell key={key} value={v} style={{...style}} columnIndex={columnIndex} rowHeight={rowHeight}
                  rowIndex={rowIndex} columns={columns} />
        );
    }

    function onResize() {}

    return (
        <div className='sophon-table'>
            <ScrollSync>
                {
                    ({ clientHeight, clientWidth, onScroll, scrollHeight, scrollLeft, scrollTop, scrollWidth}) => {
                        return (
                            <div style={{width: '100%', height: '100%'}}>
                                <AutoSizer onResize={onResize}>
                                    {({ width, height}) => {
                                        const maxWidth = Math.max(minWidth, width);
                                        const cw = maxWidth / columnsCount;
                                        return (
                                            <>
                                                <Grid
                                                    className={'sophon-table-header'}
                                                    cellRenderer={headerRenderer}
                                                    rowCount={1}
                                                    columnCount={columnsCount}
                                                    height={headerHeight}
                                                    rowHeight={headerHeight}
                                                    columnWidth={cw}
                                                    width={width}
                                                    scrollLeft={scrollLeft}
                                                    style={{ overflow: 'hidden' }}
                                                />
                                                <Grid
                                                    cellRenderer={bodyRenderer}
                                                    rowCount={rowsCount}
                                                    columnCount={columnsCount}
                                                    height={height - rowHeight}
                                                    rowHeight={rowHeight}
                                                    columnWidth={cw}
                                                    width={width}
                                                    onScroll={onScroll}
                                                    scrollLeft={scrollLeft}
                                                />
                                            </>
                                        );
                                    }}
                                </AutoSizer>
                            </div>
                        );
                    }
                }
            </ScrollSync>
        </div>

    );
}

export default SophonTable;
