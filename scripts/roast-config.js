export const ROAST_CONFIG = {
  // Minimum number of roasts required to generate a page for a name
  MIN_ROASTS_PER_NAME: 3,

  // Firebase collections
  NAME_JOKES_COLLECTION: 'name_jokes',
  NAMES_COLLECTION: 'names',

  // Template path (relative to scripts directory)
  TEMPLATE_PATH: '../roast/template.html',

  // Output paths (relative to scripts directory)
  OUTPUT_DIR: '../roast',
  SITEMAP_OUTPUT_DIR: '../generated_sitemaps',

  // Sitemap
  BASE_URL: 'https://dadjokes.vip',
  SITEMAP_PRIORITY: 0.7,
  SITEMAP_CHANGEFREQ: 'monthly',

  // Badge labels for roast types
  ROAST_TYPE_LABELS: {
    'cultural_origin': 'Cultural Origin',
    'famous_namesakes': 'Famous Namesakes',
    'personality_trait': 'Personality Roast',
    'name_meaning': 'Name Meaning',
    'name_sound': 'Name Sound',
    'stereotypes': 'Classic Roast',
    'pop_culture': 'Pop Culture',
    'wordplay': 'Wordplay',
    'general': 'General Burn',
    'rhyme': 'Rhyme Time',
    'acronym': 'Acronym Burn',
    'occupation': 'Career Roast',
    'relationship': 'Relationship Roast',
    'appearance': 'Appearance',
    'behavior': 'Behavioral Roast'
  },

  // Fallback badge if roast type is unknown
  DEFAULT_ROAST_BADGE: 'Roast',

  // Number of related names to show on each page
  RELATED_NAMES_COUNT: 6,

  // Emoji for related name links (rotating)
  NAME_LINK_EMOJIS: ['🔥', '💀', '😈', '🎯', '💣', '⚡']
};
