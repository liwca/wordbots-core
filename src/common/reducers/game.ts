import { cloneDeep, isArray, reduce } from 'lodash';

import * as actions from '../actions/game';
import * as socketActions from '../actions/socket';
import { DEFAULT_GAME_FORMAT } from '../constants';
import defaultState from '../store/defaultGameState';
import * as w from '../types';
import { replaceCardsInPlayerState } from '../util/cards';
import { id } from '../util/common';
import { triggerSound } from '../util/game';

import g from './handlers/game';

type State = w.GameState;

const PURELY_VISUAL_ACTIONS: w.ActionType[] = [actions.ATTACK_RETRACT, actions.ATTACK_COMPLETE];

export default function game(
  state: State = cloneDeep(defaultState),
  action?: w.Action | w.Action[],
  allowed?: boolean
): State {
  if (isArray(action)) {
    // Allow multiple dispatch - this is primarily useful for simplifying testing.
    return reduce(action, (s: State, a: w.Action) => game(s, a), state);
  } else if (state.tutorial && action && !allowed) {
    // In tutorial mode, only one specific action is allowed at any given time.
    return g.handleTutorialAction(state, action);
  } else {
    return handleAction(state, action);
  }
}

export function handleAction(
  oldState: State,
  { type, payload }: w.Action = { type: '' }
): State {
  let state: State = {...oldState};

  if (!PURELY_VISUAL_ACTIONS.includes(type)) {
    state = {...state,
      actionId: id()};
  }

  switch (type) {
    case socketActions.GAME_START:
      return g.newGame(
        state,
        payload.player || 'orange',
        payload.usernames || {},
        payload.decks,
        payload.seed,
        payload.format || DEFAULT_GAME_FORMAT,
        payload.options || {}
      );

    case actions.START_TUTORIAL:
      return g.startTutorial(state);

    case actions.START_PRACTICE:
      return g.startPractice(state, payload.format, payload.deck);

    case actions.START_SANDBOX:
      return g.startSandbox(state, payload.card);

    case actions.AI_RESPONSE:
      return g.aiResponse(state);

    case actions.END_GAME:
      return {...state, started: false};

    case actions.MOVE_ROBOT:
      return g.moveRobot(state, payload.from, payload.to);

    case actions.ATTACK:
      return g.attack(state, payload.source, payload.target);

    case actions.ATTACK_RETRACT:
      return {...state, attack: state.attack ? {...state.attack, retract: true} : null };

    case actions.ATTACK_COMPLETE:
      return g.attackComplete(state);

    case actions.ACTIVATE_OBJECT:
      return g.activateObject(state, payload.abilityIdx);

    case actions.PLACE_CARD:
      return g.placeCard(state, payload.cardIdx, payload.tile);

    case actions.PASS_TURN:
      return g.passTurn(state, payload.player);

    case actions.SET_SELECTED_CARD:
      return g.setSelectedCard(state, payload.player, payload.selectedCard);

    case actions.SET_SELECTED_CARD_IN_DISCARD_PILE:
      return g.setSelectedCardInDiscardPile(state, payload.player, payload.selectedCardId);

    case actions.SET_SELECTED_TILE:
      return g.setSelectedTile(state, payload.player, payload.selectedTile);

    case actions.DESELECT:
      return g.deselect(state, payload.player);

    case actions.ADD_CARD_TO_HAND: {
      // Only to be used in sandbox mode.
      const { player } = payload;
      const card: w.CardInGame = { ...payload.card, id: id() };
      state.players[player as w.PlayerColor].hand.push(card);
      return state;
    }

    case actions.SET_VOLUME:
      return { ...state, volume: payload.volume };

    case socketActions.CONNECTING:
      return {...state, started: state.practice ? state.started : false};

    case socketActions.CURRENT_STATE:
      // This is used for spectating an in-progress game - the server sends back a log of all actions so far.
      return reduce(payload.actions, (s: State, a: w.Action) => game(s, a), state);

    case socketActions.REVEAL_CARDS: {
      const { blue, orange } = payload;
      state.players = {
        blue: replaceCardsInPlayerState(state.players.blue, blue),
        orange: replaceCardsInPlayerState(state.players.orange, orange)
      };
      return state;
    }

    case socketActions.FORFEIT: {
      state = {...state, winner: payload.winner};
      state = triggerSound(state, state.winner === state.player ? 'win.wav' : 'game-over.wav');
      return state;
    }

    default:
      return oldState;
  }
}
