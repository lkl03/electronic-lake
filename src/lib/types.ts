export type PhoneSpecs = {
  display?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  camera?: string;
  battery?: string;
  os?: string;
  connectivity?: string;
  extras?: string;
};

export type Phone = {
  slug: string;
  brand: string;
  model: string;
  variant?: string;
  storage?: string;
  color?: string;
  condition?: "nuevo" | "usado" | "seminuevo";
  usd: number;
  marginUsd: number;
  priceArs: number;
  images: string[];
  specs: PhoneSpecs;
  highlights: string[];
};

export type Catalog = {
  updatedAt: string;
  dollarRate: number;
  sourceMessage?: string;
  phones: Phone[];
};

export type CartItem = {
  slug: string;
  brand: string;
  model: string;
  variant?: string;
  priceArs: number;
  qty: number;
};
