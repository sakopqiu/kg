import axios from 'axios';

export async function renderByServer(cyConfig: any) {
    if (cyConfig.elements.length === 0 || cyConfig.layout.name === 'preset') {
        return cyConfig;
    }

    const headlessConfig = Object.assign({}, cyConfig);
    delete headlessConfig.ready;
    delete headlessConfig.container;

    const localNodeMap: Map<string, any> = new Map<string, any>();

    const backgroundImageCache: Map<string, string> = new Map<string, string>();
    for (const n of headlessConfig.elements) {
        backgroundImageCache.set(n.data.id, n.data.backgroundImage);
        n.data.backgroundImage = ['none', 'none', 'none'];
        localNodeMap.set(n.data.id, n);
    }

    const apiResult = await axios.post<string>('/cyto-api/render', headlessConfig);
    const result = JSON.parse(apiResult.data);
    const nodesFromServer = result.elements.nodes;

    if (nodesFromServer) {
        for (const serverNode of nodesFromServer) {
            const localNode = localNodeMap.get(serverNode.data.id);
            localNode.position = serverNode.position;
            localNode.data.backgroundImage = backgroundImageCache.get(serverNode.data.id);
        }
    }
    cyConfig.pan = result.pan;
    cyConfig.zoom = result.zoom;
    cyConfig.layout = 'preset';
    return cyConfig;
}
