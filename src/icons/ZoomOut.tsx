import * as React from 'react';

export interface IZoomOutProps {
    onClick: () => any;
    title: string;
    style?: React.CSSProperties;
    className?: string;
}

export default class ZoomOut extends React.Component<IZoomOutProps> {
    public render() {
        return (
            <svg xlinkTitle={this.props.title}
                 onClick={this.props.onClick}
                 style={this.props.style}
                 width='1em' height='1em' viewBox='0 0 1024 1024'
                 className={`interaction ${this.props.className || ''}`}>
                <path
                    d='M146.286 0h731.428C958.506 0 1024 65.494 1024 146.286v731.428C1024 958.506 958.506 1024 877.714 1024H146.286C65.494 1024 0 958.506 0 877.714V146.286C0 65.494 65.494 0 146.286 0zm73.143 438.857v146.286H804.57V438.857H219.43z'
                    fill='#B9C1D3' fillRule='evenodd'>
                </path>
            </svg>
        );
    }
}
