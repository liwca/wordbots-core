import Paper from '@material-ui/core/Paper';
import { List } from 'material-ui/List';
import * as React from 'react';

import DictionaryTerm from './DictionaryTerm';

interface DictionarySidebarProps {
  terms: string[]
  selectedTerm: string
  onClick: (term: string) => void
}

export default class DictionarySidebar extends React.Component<DictionarySidebarProps> {
  public shouldComponentUpdate(nextProps: DictionarySidebarProps): boolean {
    return nextProps.terms !== this.props.terms;
  }

  public render(): JSX.Element {
    return (
      <div>
        <Paper
          style={{
            overflowY: 'scroll',
            height: '65vh'
          }}
        >
          <List style={{padding: 0}}>
            {this.props.terms.map(this.renderTerm)}
          </List>
        </Paper>
      </div>
    );
  }

  private renderTerm = (term: string) => (
    <DictionaryTerm
      key={term}
      token={term}
      selected={term === this.props.selectedTerm}
      onClick={this.props.onClick}
    />
  )
}
