export type ApiCardSet = {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_rarity_code: string;
  set_price: string;
};

export type ApiCardPrice = {
  cardmarket_price: string;
  tcgplayer_price: string;
  ebay_price: string;
  amazon_price: string;
  coolstuffinc_price: string;
};

export type ApiCardImage = {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
};

export type ApiCard = {
  id: number;
  name: string;
  type: string;
  race: string;
  archetype?: string;
  card_images: ApiCardImage[];
  card_sets?: ApiCardSet[];
  card_prices?: ApiCardPrice[];
};

export type Category = 'Mostri' | 'Fusione' | 'Synchro' | 'XYZ' | 'Link' | 'Magie' | 'Trappole' | 'Altro';

export type OwnedCard = {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
  rarities: Record<string, number>;
};

export type Collection = Record<string, OwnedCard>;

export type PriceSnapshot = {
  date: string;
  price: number;
};

export type DeckSection = 'main' | 'extra' | 'side';

export type DeckCardEntry = {
  cardId: string;
  name: string;
  imageUrl: string;
  quantity: number;
};

export type Deck = {
  id: string;
  title: string;
  imageUrl: string;
  main: DeckCardEntry[];
  extra: DeckCardEntry[];
  side: DeckCardEntry[];
  /** Keyed by `${section}:${cardId}` — true once the user has acquired that card. */
  ownedFlags: Record<string, boolean>;
};

export type UnresolvedLine = {
  section: DeckSection;
  raw: string;
};
