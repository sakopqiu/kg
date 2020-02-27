import * as React from 'react';

export interface IZoomInProps {
    onClick: () => any;
    title: string;
    style?: React.CSSProperties;
    className?: string;
}

export default class ZoomIn extends React.Component<IZoomInProps> {
    public render() {
        return (
            <svg style={this.props.style}
                 xlinkTitle={this.props.title}
                 onClick={this.props.onClick}
                 width='1em' height='1em' viewBox='0 0 1024 1024'
                 className={`interaction ${this.props.className || ''}`}>
                >
                <path
                    d='M438.857 438.857H219.43v146.286h219.428V804.57h146.286V585.143H804.57V438.857H585.143V219.43H438.857v219.428zM146.286 0h731.428C958.506 0 1024 65.494 1024 146.286v731.428C1024 958.506 958.506 1024 877.714 1024H146.286C65.494 1024 0 958.506 0 877.714V146.286C0 65.494 65.494 0 146.286 0z'
                    fill='#B9C1D3' fillRule='evenodd'/>
            </svg>
        );
    }
}
