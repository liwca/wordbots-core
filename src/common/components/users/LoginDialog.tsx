import Snackbar from '@material-ui/core/Snackbar';
import { History } from 'history';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import * as React from 'react';

import { login, register, resetPassword } from '../../util/firebase';
import RouterDialog from '../RouterDialog';

interface LoginDialogProps {
  history: History
}

interface LoginDialogState {
  error: string | null
  register: boolean
  email: string
  username: string
  password: string
  confirmPassword: string
  snackbarText: string
  snackbarOpen: boolean
}

export default class LoginDialog extends React.Component<LoginDialogProps, LoginDialogState> {
  public state: LoginDialogState = {
    error: null,
    register: false,
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    snackbarText: '',
    snackbarOpen: false
  };

  get submitDisabled(): boolean {
    if (this.state.register) {
      return !this.notEmpty([this.state.email, this.state.username, this.state.password]);
    } else {
      return !this.notEmpty([this.state.email, this.state.password]);
    }
  }

  public render(): JSX.Element {
    const { history } = this.props;
    const actions = [
      (
        <FlatButton
          label="Cancel"
          key="Cancel"
          primary
          onClick={this.handleClose}
        />
      ),
      (
        <FlatButton
          label="Forgot Password?"
          key="Forgot Password?"
          primary
          disabled={!this.notEmpty([this.state.email])}
          onClick={this.handleClickForgotPassword}
        />
      ),
      (
        <FlatButton
          label={this.state.register ? 'Register' : 'Login'}
          key="Register/Login"
          primary
          disabled={this.submitDisabled}
          onClick={this.handleSubmit}
        />
      )
    ];

    if (this.state.register) {
      actions.splice(1, 1);
    }

    return (
      <React.Fragment>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          open={this.state.snackbarOpen}
          message={this.state.snackbarText}
          autoHideDuration={4000}
          onClose={this.handleSnackbarClose}
        />
        <RouterDialog
          modal
          path="login"
          title={this.state.register ? 'Register' : 'Login'}
          history={history}
          actions={actions}
          style={{width: 400, position: 'relative'}}
        >
          {this.renderLoginForm()}

          {this.renderFormSwitcher()}
        </RouterDialog>
      </React.Fragment>
    );
  }

  private handleClose = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  private handleSnackbarClose = () => {
    this.setState({ snackbarOpen: false });
  }

  private register = (email: string, username: string, password: string) => {
    register(email, username, password)
      .then(() => {
        this.setState({
          error: null,
          snackbarOpen: true,
          snackbarText: `You have successfully registered as ${email}`
        });
        this.handleClose();
      })
      .catch((error) => {
        this.setState({error: `Error: ${error.message}`});
      });
  }

  private login = (email: string, password: string) => {
    login(email, password)
      .then(() => {
        this.setState({
          error: null,
          snackbarOpen: true,
          snackbarText: `You have successfully logged in as ${email}`
        });
        this.handleClose();
      })
      .catch(() => {
        this.setState({error: 'Error: Invalid username/password.'});
      });
  }

  private resetPassword = (email: string) => {
    resetPassword(email)
      .then(() => { this.setState({error: `Password reset email sent to ${email}.`}); })
      .catch(() => { this.setState({error: 'Error: Email address not found.'}); });
  }

  private handleKeyPress = (e: React.KeyboardEvent<any>) => {
    if (e.charCode === 13 && !this.submitDisabled) {
      this.handleSubmit();
    }
  }

  private handleClickSwitchMode = () => {
    this.setState((state) => ({register: !state.register}));
  }

  private handleClickForgotPassword = () => {
    this.resetPassword(this.state.email);
  }

  private handleChangeEmail = (_e: React.FormEvent<any>, value: string) => {
    this.setState({email: value});
  }

  private handleChangeUsername = (_e: React.FormEvent<any>, value: string) => {
    this.setState({username: value});
  }

  private handleChangePassword = (_e: React.FormEvent<any>, value: string) => {
    this.setState({password: value});
  }

  private handleChangeConfirmPassword = (_e: React.FormEvent<any>, value: string) => {
    this.setState({confirmPassword: value});
  }

  private handleSubmit = () => {
    if (this.state.register) {
      if (this.state.password === this.state.confirmPassword) {
        this.register(this.state.email, this.state.username, this.state.password);
      } else {
        this.setState({error: 'Error: Your passwords must match.'});
      }
    } else {
      this.login(this.state.email, this.state.password);
    }
  }

  private notEmpty(fields: string[]): boolean {
    return fields.reduce((base, field) => base && (field !== ''), true);
  }

  private renderLoginForm(): JSX.Element {
    return (
      <div style={{position: 'relative'}}>
        <div>
          <TextField
            value={this.state.email}
            style={{width: '100%'}}
            floatingLabelText="Email address"
            onKeyPress={this.handleKeyPress}
            onChange={this.handleChangeEmail}
          />
        </div>

        {
          this.state.register &&
          <div>
            <TextField
              value={this.state.username}
              style={{width: '100%'}}
              floatingLabelText="Username"
              onKeyPress={this.handleKeyPress}
              onChange={this.handleChangeUsername}
            />
          </div>
        }

        <div>
          <TextField
            value={this.state.password}
            style={{width: '100%'}}
            floatingLabelText="Password"
            type="password"
            onKeyPress={this.handleKeyPress}
            onChange={this.handleChangePassword}
          />
          {
            this.state.register &&
            <TextField
              value={this.state.confirmPassword}
              style={{width: '100%'}}
              floatingLabelText="Confirm Password"
              type="password"
              onKeyPress={this.handleKeyPress}
              onChange={this.handleChangeConfirmPassword}
            />
          }
        </div>

        {
          this.state.error &&
          <div style={{color: 'red', marginTop: 10, fontSize: 12}}>
            {this.state.error}
          </div>
        }
      </div>
    );
  }

  private renderFormSwitcher(): JSX.Element {
    return (
      <div style={{position: 'absolute', top: 30, right: 24, fontSize: 12}}>
        <span>
          {this.state.register ? 'Have an account?' : 'Don\'t have an account?'} &nbsp;
          <span
            style={{fontWeight: 'bold', cursor: 'pointer'}}
            onClick={this.handleClickSwitchMode}
          >
            {this.state.register ? 'Login' : 'Register'}
          </span>
        </span>
      </div>
    );
  }
}
