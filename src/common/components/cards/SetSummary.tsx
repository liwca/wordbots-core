import { Button, Dialog, DialogActions, DialogContent, Paper, withStyles, WithStyles } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import * as fb from 'firebase';
import { isUndefined } from 'lodash';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import * as w from '../../types';
import { sortCards } from '../../util/cards';
import Card from '../card/Card';
import MustBeLoggedIn from '../users/MustBeLoggedIn';
import ProfileLink from '../users/ProfileLink';

interface SetSummaryBaseProps {
  set: w.Set
  user: fb.User | null
  inPublishedSetsList?: boolean
  isSingleSet?: boolean
  numDecksCreated?: number
  onCreateDeckFromSet: () => void
  onDeleteSet: () => void
  onDuplicateSet: () => void
  onEditSet: () => void
  onPublishSet: () => void
}

interface SetSummaryState {
  isCardListExpanded: boolean,
  isDeleteConfirmationOpen: boolean,
  isPermalinkCopied: boolean,
  isPublishConfirmDialogOpen: boolean
}

type SetSummaryProps = SetSummaryBaseProps & WithStyles;

class SetSummary extends React.Component<SetSummaryProps, SetSummaryState> {
  public static styles: Record<string, CSSProperties> = {
    paper: {
      position: 'relative',
      padding: 10,
      marginBottom: 5
    },
    confirmDeleteControl: {
      fontSize: '13px',
      paddingLeft: 5,
      paddingRight: 2
    },
    confirmDeleteLabel: {
      color: 'red',
      marginRight: 3
    },
    controls: {
      position: 'absolute',
      top: 5,
      right: 8
    },
    controlsButton: {
      minHeight: 0,
      minWidth: 60,
      marginLeft: 5,
      padding: '4px 8px'
    },
    dialogButton: {
      marginLeft: 10
    },
    link: {
      cursor: 'pointer',
      textDecoration: 'underline',
      '&:hover': {
        textDecoration: 'none'
      }
    },
    numDecksCreated: {
      position: 'absolute',
      right: 8,
      bottom: 5,
      fontStyle: 'italic',
      color: '#666',
      fontSize: '0.75em'
    }
  };

  public state = {
    isCardListExpanded: !!this.props.isSingleSet,
    isDeleteConfirmationOpen: false,
    isPermalinkCopied: false,
    isPublishConfirmDialogOpen: false
  };

  get doesSetBelongToUser(): boolean {
    const { set, user } = this.props;
    return user ? set.metadata.authorId === user.uid : false;
  }

  get permalinkUrl(): string {
    const { set } = this.props;
    return `${window.location.href.split('?')[0]}?set=${set.id}`;
  }

  public render(): JSX.Element {
    const {
      classes,
      set: { cards, description, metadata, name },
      numDecksCreated,
      inPublishedSetsList,
      onCreateDeckFromSet,
      onDuplicateSet,
      onEditSet,
      user
    } = this.props;
    const { isCardListExpanded, isPermalinkCopied } = this.state;
    const canEditSet = this.doesSetBelongToUser && !metadata.isPublished;

    return (
      <Paper className={classes.paper}>
        <div>
          <strong>{name}</strong> by <ProfileLink uid={metadata.authorId} username={metadata.authorName} />
          {!inPublishedSetsList && metadata.isPublished && <i> (published)</i>}
        </div>
        <div className={classes.controls}>
          <MustBeLoggedIn loggedIn={!!user}>
            {this.renderButton('Create Deck', onCreateDeckFromSet, { disabled: cards.length < 15 })}
            {canEditSet ? this.renderButton('Publish', this.handleOpenPublishConfirmation, { disabled: cards.length < 15 }) : null}
            {canEditSet ? this.renderButton('Edit', onEditSet) : null}
            {this.doesSetBelongToUser ? this.renderButton('Duplicate', onDuplicateSet) : null}
            {this.renderDeleteControl()}
          </MustBeLoggedIn>
        </div>
        <div>
        {description}
        </div>
        <div>
          <a className={classes.link} onClick={this.toggleCardList}>
            [{isCardListExpanded ? 'hide' : 'show'} {cards.length} cards]
          </a>
          {' '}
          <CopyToClipboard text={this.permalinkUrl} onCopy={this.afterCopyPermalink}>
            <a className={classes.link}>[{isPermalinkCopied ? 'copied' : 'copy permalink'}]</a>
          </CopyToClipboard>
        </div>
        {isCardListExpanded && <div>
          {
            cards
              .sort((c1, c2) => sortCards(c1, c2, 0))
              .map((card, idx) => (
                <div key={idx} style={{float: 'left'}}>
                  {Card.fromObj(card, { scale: 0.7 })}
                </div>
              ))
          }
          <div style={{clear: 'both'}}/>
        </div>}
        <div className={classes.numDecksCreated}>
          {!isUndefined(numDecksCreated) ? numDecksCreated : '?'} decks created
        </div>
        {this.renderConfirmPublishDialog()}
      </Paper>
    );
  }

  private renderConfirmPublishDialog = () => {
    const { set, classes } = this.props;
    const { isPublishConfirmDialogOpen } = this.state;

    return (
      <Dialog
        open={isPublishConfirmDialogOpen}
        onClose={this.handleClosePublishConfirmation}
      >
        <DialogContent>
          <p>Are you sure that you want to publish the <b>{set.name}</b> set?</p>
          <p>Once a set is published, it can no longer be edited (only deleted), and it will be visible by all players.</p>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="outlined"
            className={classes.dialogButton}
            onClick={this.handlePublishSet}
          >
            Publish
          </Button>
          <Button
            color="primary"
            variant="outlined"
            className={classes.dialogButton}
            onClick={this.handleClosePublishConfirmation}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  private renderDeleteControl = (): JSX.Element | null => {
    const { classes } = this.props;
    const { isDeleteConfirmationOpen } = this.state;

    if (this.doesSetBelongToUser) {
      if (isDeleteConfirmationOpen) {
        return (
          <span className={classes.confirmDeleteControl}>
            <span className={classes.confirmDeleteLabel}>delete?</span>
            <a className={classes.link} onClick={this.handleDeleteSet}>yes</a>/<a className={classes.link} onClick={this.handleCloseDeleteConfirmation}>no</a>
          </span>
        );
      } else {
        return this.renderButton('Delete', this.handleOpenDeleteConfirmation, { color: 'secondary' });
      }
    } else {
      return null;
    }
  }

  private renderButton = (text: string, action: () => void, additionalProps?: ButtonProps): JSX.Element => (
    <Button
      variant="outlined"
      size="small"
      color="primary"
      classes={{ outlined: this.props.classes.controlsButton }}
      onClick={action}
      {...additionalProps}
    >
      {text}
    </Button>
  )

  private afterCopyPermalink = () => {
    this.setState({ isPermalinkCopied: true });
  }

  private toggleCardList = () => {
    this.setState((state) => ({
      isCardListExpanded: !state.isCardListExpanded
    }));
  }

  private handleDeleteSet = () => {
    this.handleCloseDeleteConfirmation();
    this.props.onDeleteSet();
  }

  private handlePublishSet = () => {
    this.handleClosePublishConfirmation();
    this.props.onPublishSet();
  }

  private handleOpenDeleteConfirmation = () => { this.setState({ isDeleteConfirmationOpen: true }); };
  private handleCloseDeleteConfirmation = () => { this.setState({ isDeleteConfirmationOpen: false }); };

  private handleOpenPublishConfirmation = () => { this.setState({ isPublishConfirmDialogOpen: true }); };
  private handleClosePublishConfirmation = () => { this.setState({ isPublishConfirmDialogOpen: false }); };
}

export default withStyles(SetSummary.styles)(SetSummary);
