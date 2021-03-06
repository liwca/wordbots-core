import Paper from '@material-ui/core/Paper';
import * as React from 'react';

interface TitleProps {
  text: string
  small?: boolean
}

export default class Title extends React.Component<TitleProps> {
  public render(): JSX.Element {
    const { text, small } = this.props;
    return (
      <Paper
        style={{
          display: 'inline-block',
          padding: '5px 15px',
          fontSize: small ? 16 : 24,
          fontFamily: 'Carter One',
          color: 'white',
          backgroundColor: '#f44336',
          opacity: 0.8,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 0
        }}
      >
        {text}
      </Paper>
    );
  }
}
