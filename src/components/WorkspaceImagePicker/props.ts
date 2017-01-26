export interface StateProps {
  images: string[];
  showDropzone?: boolean;
};

export interface DispatchProps {
  
};

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  className?: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
