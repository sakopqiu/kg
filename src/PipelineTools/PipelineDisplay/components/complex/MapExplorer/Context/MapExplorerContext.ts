import React from 'react';
import {Locales} from '../../../../../../utils';
import {MapStore} from '../../../../stores/MapStore';

export interface IMapExplorerContext {
    locale: Locales;
    mapStore: MapStore;
}

// @ts-ignore
export const MapExplorerContext = React.createContext<IMapExplorerContext>();
