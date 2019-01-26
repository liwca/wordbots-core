import { SortCriteria, SortOrder, Layout } from './types.enums';

export type FilterKey = 'robots' | 'events' | 'structures';

export interface DeckCreationProperties {
  filters: {
    [F in FilterKey]: boolean
  }
  costRange: [number, number]
  sortCriteria: SortCriteria
  sortOrder: SortOrder
  searchText: string
  selectedCardIds: string[]
  layout: Layout
}
