import * as React from 'react';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export interface ShowStateProps {
  showState: boolean;
}

const animationMount = (transitionType: string, renderKey: string, appear: number = 300, enter: number = 300, leave: number = 300) => {
  return <P extends ShowStateProps, T extends React.ComponentClass<P>>(ContentComponent: T): T => {
    class AnimationedComponent extends React.Component<P> {
      render() {
        const {showState} = this.props;
        return (
          <ReactCSSTransitionGroup
            transitionName={transitionType}
            transitionAppear={true}
            transitionAppearTimeout={appear}
            transitionEnter={true}
            transitionEnterTimeout={enter}
            transitionLeave={true}
            transitionLeaveTimeout={leave}>
            {showState ?
                <ContentComponent key={renderKey} {...this.props as any} /> :  null}
          </ReactCSSTransitionGroup>);
      }
    }
    return AnimationedComponent as T;
  };
};

export default animationMount;
