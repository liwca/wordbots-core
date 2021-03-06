import * as React from 'react';

import { TYPE_CORE, TYPE_EVENT, TYPE_ROBOT } from '../../constants';
import * as w from '../../types';
import loadImages from '../hexgrid/HexGridImages';
import Sprite from '../Sprite';

import Identicon from './Identicon';
import TriangleArt from './TriangleArt';

interface CardImageProps {
  type: w.CardType
  spriteID: string
  spriteV?: number
  img?: string
  source: w.CardSource
  scale: number
  onSpriteClick: () => void
}

interface CardImageState {
  loadImage: boolean
}

export default class CardImage extends React.Component<CardImageProps, CardImageState> {
  public state = {
    loadImage: false
  };

  public componentWillMount(): void {
    setTimeout(() => {
      this.setState({ loadImage: true });
    }, 50);
  }

  public render(): JSX.Element | null {
    const { type, spriteID, spriteV, img, source, scale, onSpriteClick } = this.props;

    if (!this.state.loadImage) {
      return (
        <div
          style={{
            width: 1,
            height: 52 * scale
          }}
        >
          &nbsp;
        </div>
      );
    } else if (type === TYPE_CORE) {
      const [width, height] = [50 * scale, 52 * scale];
      return (
        <div
          style={{
            width,
            height,
            margin: '3px auto 0'
          }}
        >
          <img src={(loadImages() as Record<string, string>)[img!]} width={width} height={height} alt={img!} />
        </div>
      );
    } else if (type === TYPE_EVENT) {
      if ((!spriteV || spriteV < 2) && source.type === 'user') {
        // Legacy event images.
        const [width, height] = [25 * scale, 42 * scale];
        return (
          <div
            onClick={onSpriteClick}
            style={{
              width,
              height,
              margin: `${10 * scale}px auto 0`
            }}
          >
            <Identicon id={spriteID} width={width} size={4} />
          </div>
        );
      } else {
        const [width, height] = [140 * scale, 52 * scale];
        return (
          <div
            onClick={onSpriteClick}
            style={{
              width,
              height
            }}
          >
            <TriangleArt
              id={spriteID}
              width={width}
              height={height}
              cellSize={25 * scale}
            />
          </div>
        );
      }
    } else {
      return (
        <div
          onClick={onSpriteClick}
          style={{
            width: 48 * scale,
            height: 48 * scale,
            margin: `${1.0 * scale}px auto ${3.0 * scale}px`
          }}
        >
          <Sprite
            id={spriteID}
            palette={type === TYPE_ROBOT ? 'nes' : 'greys'}
            size={24}
            scale={scale}
            output="html"
          />
        </div>
      );
    }
  }
}
