import { allObjectsOnBoard, matchesType } from '../util';
import GridGenerator from '../components/react-hexgrid/GridGenerator';
import HexUtils from '../components/react-hexgrid/HexUtils';

// A collection is a function that returns either an array of cards in a players' hand
// or an array of [hex, object] pairs representing objects on the board.

export function allTiles(state) {
  return function () {
    const tiles = {};
    GridGenerator.hexagon(4).forEach((hex) => {
      tiles[HexUtils.getID(hex)] = allObjectsOnBoard(state)[HexUtils.getID(hex)];
    });
    return tiles;
  };
}

export function cardsInHand(state) {
  return function (players, cardType) {
    const player = players[0]; // Player target is always in the form of list, so just unpack it.
    return player.hand.filter(c => matchesType(c, cardType));
  };
}

export function objectsInPlay(state) {
  return function (objType) {
    return objectsMatchingConditions(state)(objType, []);
  };
}

export function objectsMatchingConditions(state) {
  return function (objType, conditions) {
    return _.pickBy(allObjectsOnBoard(state), (obj, hex) =>
      matchesType(obj, objType) && _.every(conditions.map(cond => cond(hex, obj)))
    );
  };
}