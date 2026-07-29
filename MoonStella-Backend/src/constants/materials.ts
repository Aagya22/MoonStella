export const METALS = [
  '18k Yellow Gold',
  '18k White Gold',
  '18k Rose Gold',
  '22k Yellow Gold',
  '24k Pure Gold',
  '14k Yellow Gold',
  '14k White Gold',
  'Platinum 950',
  'Sterling Silver 925',
  'Vermeil Gold',
  'Brass',
  'Bronze'
]

export const GEMSTONES = [
  'Natural Diamond',
  'Lab-grown Diamond',
  'Colombian Emerald',
  'Royal Blue Sapphire',
  'Pigeon Blood Ruby',
  'Natural Amethyst',
  'Aquamarine',
  'Ethiopian Opal',
  'South Sea Pearl',
  'Akoya Pearl',
  'Turquoise',
  'Nephrite Jade',
  'London Blue Topaz',
  'Garnet',
  'Pink Tourmaline',
  'Morganite',
  'Tanzanite',
  'Peridot',
  'Citrine',
  'Rainbow Moonstone',
  'Black Onyx',
  'Blue Zircon',
  'Spinel'
]

// 'Other' covers anything off the list
export const ALL_MATERIALS = [...METALS, ...GEMSTONES, 'Other']

const canonical = new Map(ALL_MATERIALS.map((m) => [m.toLowerCase(), m]))

// Case-insensitive, so casing variants collapse into one tag
export const normalizeMaterial = (value: string): string | null =>
  canonical.get(String(value).trim().toLowerCase()) || null
