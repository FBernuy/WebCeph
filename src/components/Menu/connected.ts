import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';
import MainMenu from './index';
import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (enhancedState: EnhancedState<StoreState>) => {
  const { present: state } = enhancedState;
  return {
    
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    
  }
);

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(MainMenu);


export default connected;