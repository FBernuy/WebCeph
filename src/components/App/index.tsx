import * as React from 'react';

import VerticalTabBar from 'components/VerticalTabBar/connected';
import WorkspaceImagePicker from 'components/WorkspaceImagePicker/connected';

import Progress from './Progress';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import injectTapEventPlugin from 'react-tap-event-plugin';

import attempt from 'lodash/attempt';

import { compose, lifecycle, pure } from 'recompose';

import Props from './props';

attempt(injectTapEventPlugin);

type State = { };

const classes = require('./style.scss');

const addLifeCycleHooks = lifecycle({
  componentDidMount(this: React.Component<Props, { }>) {
    this.props.onComponentMount();
  },
});

const enhance = compose<Props, State>(pure, addLifeCycleHooks);

import { HotKeys } from 'react-hotkeys';

const App = enhance(({ userAgent, isReady, keyMap, handlers }: Props) => (
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    { isReady ? (
        <HotKeys keyMap={keyMap} handlers={handlers}>
          <div className={classes.root}>
            <div className={classes.container}>
              <div className={classes.row}>
                <VerticalTabBar
                  className={classes.tab_bar}
                />
                <div className={classes.workspace}>
                  <WorkspaceImagePicker />
                </div>
              </div>
            </div>
          </div>
        </HotKeys>
      ) : (
        <div className={classes.root_loading}>
          <Progress />
        </div>
      )
    }
  </MuiThemeProvider>
));

export default App as React.ComponentClass<Props>;
