import * as React from 'react';

interface IHeaderTooltip {
    headerTooltip?: boolean; // 是否显示表头的Tooltip提示, true: 显示， false: 不显示。不传，默认显示
}

export interface SophonTableProps extends IHeaderTooltip {
    columns: any[];     // table的列数据
    rows: any[][];           // table的行数据
    width?: number;        // table的整体宽度
    minCellWidth?: number; // 每一个cell的最小宽度
    height?: number;       // table的整体高度
    rowHeight?: number;    // 每一行的高度
    headerHeight?: number; // 表头的高度
    showIndex?: boolean;   // 是否显示行序号
    renderHeader?: (key: string, rowIndex: number, columnIndex: number, style: React.CSSProperties, rowHeight: number,
                    columns: any[]) => React.ReactNode; // 自定义header
    renderCell?: (key: string, rowIndex: number, columnIndex: number, style: React.CSSProperties, rowHeight: number,
                  rows: any[][], columns: any[]) => React.ReactNode; // 自定义body cell
}

export interface CellProps extends IHeaderTooltip {
    key: string;
    value: string;
    style: React.CSSProperties;
    columnIndex: number;
    rowIndex: number;
    rowHeight: number;
    columns: any[];
}
