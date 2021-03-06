import * as w from '../types';
import { id } from '../util/common';

const defaultCreatorState: w.CreatorState = {
  id: null,  // Only exists for existing cards that are being edited (not new cards).
  name: '',
  spriteID: id(),
  type: 0,
  text: '',
  sentences: [],
  attack: 1,
  speed: 1,
  health: 1,
  cost: 1,
  parserVersion: null,
  willCreateAnother: false,
  isPrivate: false
};

export default defaultCreatorState;
