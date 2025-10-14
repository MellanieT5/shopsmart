const GENERAL_CATEGORIES =[ //prva kategorija (bom še vidla, če jo bom dejansko uporablja, sam bi blo kul, če bi )
    'Home & Kitchen',
    'Beauty',
    'Books',
    'Clothing',
    'Sports',
    'Toys',
    'Decorations',
    'Pets',
    'Garden',
    'Office'
] as const;


const TECH_CATEGORIES = [ //druga kategorija
  'Phones',
  'Laptops',
  'PC Components',
  'Monitors',
  'Audio',
  'Peripherals',
  'Gaming',
  'Smart Home',
  'Networking',
  'Accessories'
] as const;

// Izberi nabor: tech ali general
const SELECTED: 'tech' | 'general' = 'tech';

export type Category =typeof GENERAL_CATEGORIES [number] | typeof TECH_CATEGORIES[number]; //unija dovoljenih nizov


export const CATEGORIES: readonly Category[] = (SELECTED === 'tech' ? TECH_CATEGORIES : GENERAL_CATEGORIES) as readonly Category[];