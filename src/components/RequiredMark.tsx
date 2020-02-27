import * as React from 'react';

export class RequiredMark extends React.Component {
    public render() {
        return (
            <span style={{
                marginRight: 5,
                color: 'red',
                position: 'relative',
                top: 2,
            }}>*</span>
        );
    }
}
