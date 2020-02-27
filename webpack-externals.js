module.exports = [
    'react',
    'react-dom',
    'antd',
    'mobx',
    'mobx-react',
    'react-router-dom',
    'lodash',
    'cytoscape',
    'cytoscape-dagre',
    'cytoscape-klay',
    'cytoscape-cola',
    'cytoscape-spread',
    'konva',
    'react-dnd',
    'react-dnd-html5-backend',
    'socket.io-client'
];// 不需要打包进的依赖，由调用的项目自行安装，这些依赖需要声明在peerDependency中