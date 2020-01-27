import React from 'react';
import { IAnnotation, IAnnotationAndIdeas } from './annotations-reducer';
import { getAnnotatedIdeas, removeAnnotation } from './annotation-utils';

interface IAnnotationDetailProps {
  annotation: IAnnotation;
  destroyAnnotation(data: IAnnotationAndIdeas): void;
}

export default class AnnotationDetail extends React.Component<IAnnotationDetailProps> {
  constructor(props: IAnnotationDetailProps) {
    super(props);
  }

  private destroyAnnotation = () => {
    removeAnnotation(this.props.annotation.id);
    this.props.destroyAnnotation({
      annotation: this.props.annotation,
      ideas: getAnnotatedIdeas(),
    });
  };

  render() {
    return this.props.annotation === undefined ? null : (
      <div className="annotation-detail">
        <a onClick={this.destroyAnnotation}>delete</a>
        <p>{JSON.stringify(this.props, null, ' ')}</p>
      </div>
    );
  }
}
