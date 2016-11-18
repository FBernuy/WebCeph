export interface StateProps {

}

export interface DispatchProps {

}

export interface OwnProps extends React.HTMLAttributes<HTMLDivElement> {
  margin: number;
}

export type ConnectableProps = StateProps & DispatchProps;

export type Props = StateProps & DispatchProps & OwnProps;

export default Props;