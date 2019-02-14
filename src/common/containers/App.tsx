import * as React from 'react';
import { object } from 'prop-types';
import { hot } from 'react-hot-loader';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect, Switch, withRouter } from 'react-router';
import { History, Location } from 'history';
import * as fb from 'firebase';
import Helmet from 'react-helmet';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
/* eslint-disable import/no-unassigned-import */
import 'whatwg-fetch';
/* eslint-enable import/no-unassigned-import */

import * as w from '../types';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../constants';
import { isFlagSet, logAnalytics } from '../util/browser';
import { listenToUserData, listenToSets, onLogin, onLogout } from '../util/firebase';
import * as actions from '../actions/global';
import ErrorBoundary from '../components/ErrorBoundary';
import NavMenu from '../components/NavMenu';
import DictionaryDialog from '../components/cards/DictionaryDialog';
import HelpDialog from '../components/cards/HelpDialog';
import LoginDialog from '../components/users/LoginDialog';
import PersonalTheme from '../themes/personal';

import TitleBar from './TitleBar';
import Collection from './Collection';
import Creator from './Creator';
import Deck from './Deck';
import Decks from './Decks';
import Sets from './Sets';
import Set from './Set';
import Home from './Home';
import { Singleplayer } from './Singleplayer';
import Multiplayer from './Multiplayer';
import About from './About';
import Profile from './Profile';

interface AppStateProps {
  inGame: boolean
  inSandbox: boolean
  renderId: number
}

interface AppDispatchProps {
  onLoggedIn: (user: fb.User) => void
  onLoggedOut: () => void
  onReceiveFirebaseData: (data: any) => void
  onRerender: () => void
}

type AppProps = AppStateProps & AppDispatchProps & {
  history: History
  location: Location
};

interface AppState {
  loading: boolean
}

function mapStateToProps(state: w.State): AppStateProps {
  return {
    inGame: state.game.started,
    inSandbox: state.game.sandbox,
    renderId: state.global.renderId
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): AppDispatchProps {
  return {
    onLoggedIn: (user: fb.User) => {
      dispatch(actions.loggedIn(user));
    },
    onLoggedOut: () => {
      dispatch(actions.loggedOut());
    },
    onReceiveFirebaseData: (data: any) => {
      dispatch(actions.firebaseData(data));
    },
    onRerender: () => {
      dispatch(actions.rerender());
    }
  };
}

class App extends React.Component<AppProps, AppState> {
  public static childContextTypes = {
    muiTheme: object
  };

  public state = {
    loading: true
  };

  constructor(props: AppProps) {
    super(props);
    logAnalytics();
  }

  public componentDidMount(): void {
    onLogin((user) => {
      this.setState({loading: false});
      this.props.onLoggedIn(user);
      listenToUserData(this.props.onReceiveFirebaseData);
      listenToSets(this.props.onReceiveFirebaseData);
    });

    onLogout(() => {
      this.setState({loading: false});
      this.props.onLoggedOut();
      this.props.onReceiveFirebaseData(null);
    });
  }

  public componentDidUpdate(): void {
    logAnalytics();
  }

  public getChildContext(): any {
    return {
      muiTheme: getMuiTheme(PersonalTheme)
    };
  }

  get inGame(): boolean {
    const { location, inGame, inSandbox } = this.props;
    return (inGame || Singleplayer.isInGameUrl(location.pathname)) && !inSandbox;
  }

  get sidebar(): JSX.Element | null {
    if (this.state.loading || this.inGame) {
      return null;
    } else {
      return <NavMenu onRerender={this.props.onRerender} />;
    }
  }

  get content(): JSX.Element {
    const sidebarWidth = isFlagSet('sidebarCollapsed') ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    // TODO Figure out how to avoid having to type the Route components as `any`
    // (see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/13689)
    return (
      <div style={{
        paddingLeft: this.inGame ? 0 : sidebarWidth,
        transition: 'padding-left 200ms ease-in-out'
      }}>
        <ErrorBoundary>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/home" component={Home} />
            <Route path="/collection" component={Collection} />
            <Route path="/creator" component={Creator} />
            <Route path="/decks" component={Decks} />
            <Route path="/deck" component={Deck as any} />
            <Route path="/sets/:setId" component={Set as any} />
            <Route path="/sets" component={Sets as any} />
            <Route path="/singleplayer" component={Singleplayer} />
            <Route path="/multiplayer" component={Multiplayer} />
            <Route path="/about" component={About} />
            <Route path="/profile/:userId" component={Profile} />
            <Route render={this.redirectToRoot} />
          </Switch>
        </ErrorBoundary>
      </div>
    );
  }

  get dialogs(): JSX.Element | null {
    if (this.state.loading) {
      return null;
    } else {
      const { history } = this.props;
      return (
        <div>
          <LoginDialog history={history} />
          <DictionaryDialog history={history} />
          <HelpDialog history={history} />
        </div>
      );
    }
  }

  public render(): JSX.Element {
    return (
      <div>
        <Helmet defaultTitle="Wordbots" titleTemplate="%s - Wordbots"/>
        <TitleBar />
        <div>
          {this.sidebar}
          {this.state.loading ? null : this.content}
        </div>
        {this.dialogs}
      </div>
    );
  }

  private redirectToRoot = (): JSX.Element => (
    <Redirect to="/"/>
  )
}

export default hot(module)(withRouter(connect(mapStateToProps, mapDispatchToProps)(App)));