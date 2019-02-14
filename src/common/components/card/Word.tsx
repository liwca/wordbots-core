import * as React from 'react';

import * as w from '../../types';
import { id } from '../../util/common';
import { inBrowser } from '../../util/browser';
import Tooltip from '../Tooltip';

interface WordProps {
  word: string
  keywords: Record<string, string>
  result: w.ParseResult | null
}

export default class Word extends React.Component<WordProps> {
  public render(): JSX.Element {
    const { word, keywords, result } = this.props;

    if (((result && result.unrecognizedTokens) || []).includes(word.toLowerCase())) {
      return (
        <span key={id()}>
          {' '}<u>{word}</u>
        </span>
      );
    } else if (keywords[word]) {
      if (inBrowser()) {
        return (
          <span key={id()}>
            {' '}<Tooltip inline text={keywords[word]}><b>{word}</b></Tooltip>
          </span>
        );
      } else {
        return (
          <span key={id()}>
            {' '}<b>{word}</b>
          </span>
        );
      }
    } else {
      return (
        <span key={id()}>
          {' '}{word}
        </span>
      );
    }
  }
}
