import * as React from 'react';
import { Dispatch, AnyAction, compose } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { withRouter } from 'react-router';
import { History } from 'history';
import * as fb from 'firebase';
import Paper from '@material-ui/core/Paper';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { compact, find, noop } from 'lodash';

import * as w from '../../common/types';
import { id as generateId } from '../util/common';
import { getDisplayedCards } from '../util/cards';
import { DeckCreationProperties, FilterKey } from '../components/cards/types';
import { SortCriteria, SortOrder, Layout } from '../components/cards/types.enums';
import ActiveDeck from '../components/cards/ActiveDeck';
import CardCollection from '../components/cards/CardCollection';
import EnergyCurve from '../components/cards/EnergyCurve';
import * as collectionActions from '../actions/collection';
import DeckCreationSidebarControls from '../components/cards/DeckCreationSidebarControls';

import { Deck } from './Deck';

interface NewSetStateProps {
  setBeingEdited: w.Set | null
  allCards: w.CardInStore[]
  user: fb.User | null
}

interface NewSetDispatchProps {
  onSaveSet: (set: w.Set) => void
}

type NewSetProps = NewSetStateProps & NewSetDispatchProps & { history: History } & WithStyles;
type NewSetState = DeckCreationProperties;

function mapStateToProps(state: w.State): NewSetStateProps {
  return {
    setBeingEdited: state.collection.setBeingEdited,
    allCards: state.collection.cards,
    user: state.global.user
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): NewSetDispatchProps {
  return {
    onSaveSet: (set: w.Set) => {
      dispatch(collectionActions.saveSet(set));
    }
  };
}

/**
 * Container encapsulating display and logic for creating and editing Sets.
 * @TODO Reduce duplication between NewSet and Deck containers.
 */
class NewSet extends React.Component<NewSetProps, NewSetState> {
  public state: NewSetState = {
    filters: {
      robots: true,
      events: true,
      structures: true
    },
    costRange: [0, 20],
    sortCriteria: SortCriteria.Creator,
    sortOrder: SortOrder.Ascending,
    searchText: '',
    selectedCardIds: [],
    layout: Layout.Grid
  };

  constructor(props: NewSetProps) {
    super(props);

    if (props.setBeingEdited) {
      this.setState({ selectedCardIds: props.setBeingEdited.cards.map((c) => c.id) });
    }
  }

  get selectedCards(): w.CardInStore[] {
    return compact(this.state.selectedCardIds.map((id) => find(this.props.allCards, { id })));
  }

  get displayedCards(): w.CardInStore[] {
    const { searchText, filters, costRange, sortCriteria, sortOrder } = this.state;
    return getDisplayedCards(this.props.allCards, { searchText, filters, costRange, sortCriteria, sortOrder });
  }

  public render(): JSX.Element {
    const { setBeingEdited, user, classes } = this.props;
    const { layout, selectedCardIds, sortCriteria, sortOrder } = this.state;

    return (
      <div>
        <Helmet title={setBeingEdited ? "Editing Set" : "Creating Set"} />

        <div className={classes.container}>
          <div className={classes.leftSidebar}>
            <Paper className={classes.energyCurvePaper}>
              <div className={classes.energyCurveHeading}>Energy Curve</div>
              <EnergyCurve cards={this.selectedCards} />
            </Paper>

            <DeckCreationSidebarControls
              layout={layout}
              sortCriteria={sortCriteria}
              sortOrder={sortOrder}
              onSetField={this.setField}
              onToggleFilter={this.toggleFilter} />
          </div>

          <div className={classes.cards}>
            <CardCollection
              layout={layout}
              cards={this.displayedCards}
              selectedCardIds={selectedCardIds}
              onSelection={this.handleSelectCards} />
          </div>

          <div className={classes.rightSidebar}>
            <Paper className={classes.deckPropsPaper}>
              <ActiveDeck
                isASet
                id={setBeingEdited ? setBeingEdited.id : ''}
                name={setBeingEdited ? setBeingEdited.name : ''}
                cards={this.selectedCards}
                loggedIn={!!user}
                onRemoveCard={this.handleRemoveCard}
                onSave={this.handleClickSaveSet} />
            </Paper>
          </div>
        </div>
      </div>
    );
  }

  private setField = (key: keyof NewSetState, callback = noop) => (value: any) => {
    this.setState({[key]: value} as any, callback);
  }

  private toggleFilter = (filter: FilterKey) => (_e: React.SyntheticEvent<any>, toggled: boolean) => {
    this.setState((state) => ({
      filters: Object.assign({}, state.filters, {[filter]: toggled})
    }));
  }

  private handleSelectCards = (selectedCardIds: string[]) => {
    this.setState({ selectedCardIds });
  }

  private handleRemoveCard = (id: string) => {
    this.setState((state) => ({
      selectedCardIds: state.selectedCardIds.filter((cardId) => cardId !== id)
    }));
  }

  private handleClickSaveSet = (id: string | null, name: string, cardIds: string[]) => {
    const { allCards, user, onSaveSet, history } = this.props;

    if (!user) {
      return;
    }

    const set: w.Set = {
      id: id || generateId(),
      name,
      cards: allCards.filter((card) => cardIds.includes(card.id)),
      metadata: {
        authorId: user.uid,
        authorName: user.displayName || user.uid,
        isPublished: false,
        lastModified: Date.now()
      }
    };

    onSaveSet(set);
    history.push('/sets');
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(Deck.styles)
)(NewSet);