import React from 'react';
import './index.scss';

interface ITagLabelsProps {
    labels: string[];
}

export class TagLabels extends React.Component<ITagLabelsProps> {
    public render() {
        return (
          <div className='tags-list'>
              {this.props.labels.map((label) => (
                  <div className='tag-label' key={label}>
                      {label}
                  </div>
              ))}
          </div>
        );
    }
}
