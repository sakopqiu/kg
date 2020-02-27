export interface ColorManager {
    // 为一个类型分配一个颜色
    getColorForType(type: string): string;
}

export const CommunityDefaultColors: string[] = [
    '#FEF8D3', '#FDE5DC', '#D3FEEC', '#D3EEFE', '#FDDBEC', '#D3FED4', '#EAECFC',
    '#F2FCEA', '#CAFFF7', '#FFD8CC',
];

export const SophonPipelineColors = ['#00c0fc', '#f74671', '#ffd171', '#00d6a2', '#008ebf', '#002d56',
    '#5f68cc', '#ff7f28', '#c70417', '#3f0053', '#bedfef', '#204553', '#91bdc5',
    '#004062', '#44e1df', '#7ecbee', '#40b591', '#ffaf36', '#0079f9', '#003048',
    '#002f47', '#91bdc5', '#db3e4c', '#ffbf34', '#007d7b', '#ed0f30', '#b3091c',
    '#ff863a', '#c7c5bf', '#2f373a', '#ffc867', '#ffaf36', '#0079f9', '#00c0fc',
    '#002d56', '#f74671', '#ffd171', '#00d6a2', '#008ebf', '#004062', '#f85c63',
    '#fdb26f', '#b48069', '#003569', '#1787a8', '#8cbbd0', '#00fdf5', '#f72e1f',
    '#ed8326', '#50993c', '#05240b', '#395443', '#b5b8b6', '#734f16', '#004921',
    '#db3e4c', '#8f1a7a', '#007c7b', '#370b0a', '#363537', '#fc5f61', '#f82b59',
    '#84d870', '#007b9d', '#50514f', '#fc5f61', '#6eefbf', '#ffe173', '#007b9d',
    '#003f5d', '#404b54', '#2c5c66', '#efd3b4', '#69818b', '#003852', '#007e88',
    '#10afb8', '#93ca50', '#214654', '#49535b', '#0f3752', '#63aed8', '#0092d3',
    '#00bcfb', '#008757', '#004f55', '#002540', '#001f10', '#8a0033', '#5f68cc',
    '#44e1df', '#7ecbee', '#bedfef', '#204553', '#003048', '#91bdc5', '#db3e4c',
    '#8f1a7a', '#007c7b', '#003a3d', '#10afb8', '#93ca50', '#214654', '#002f47',
    '#91bdc5', '#db3e4c', '#ffbf34', '#007d7b', '#ed0f30', '#b3091c', '#ff863a',
    '#c7c5bf', '#2f373a', '#ffc867', '#ddbf98', '#7e3c1b', '#003a3d', '#f85c63',
    '#fdb26f', '#b48069'];
