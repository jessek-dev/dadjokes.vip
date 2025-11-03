export const CONFIG = {
  // Firebase paths
  JOKES_COLLECTION: 'jokes/all/jokes',
  NAME_JOKES_COLLECTION: 'name_jokes',

  // Template paths (relative to project root)
  JOKE_TEMPLATE: '../joke/template.html',
  CATEGORY_TEMPLATE: '../category/template.html',

  // Output paths (relative to project root)
  OUTPUT_DIR: '..',
  JOKE_OUTPUT_DIR: '../joke',
  CATEGORY_OUTPUT_DIR: '../category',
  SITEMAP_OUTPUT_DIR: '../generated_sitemaps',

  // Sitemap configuration
  BASE_URL: 'https://dadjokes.vip',
  MAX_URLS_PER_SITEMAP: 50000, // Google's limit

  // Batch configuration - All sitemaps have 1,000+ jokes
  WEEKS: [
    { name: 'regular_jokes', minRating: 0, maxPages: 10000, priority: 0.8, changefreq: 'weekly' }
  ],

  // Name jokes configuration - Split into 2 batches of ~4,000 each
  NAME_JOKES_BATCHES: [
    { name: 'name_jokes_1', maxPages: 4000, priority: 0.7, changefreq: 'monthly' },
    { name: 'name_jokes_2', maxPages: 10000, priority: 0.6, changefreq: 'monthly' }
  ],

  // Category descriptions
  CATEGORY_DESCRIPTIONS: {
    'Farm': 'Perfect jokes about farming, animals, and country life. Whether you\'re a farmer or just appreciate good wholesome humor, these jokes will have you harvesting laughs!',
    'Animal': 'Hilarious animal jokes and wildlife humor. From pets to wild creatures, these jokes are paws-itively entertaining!',
    'Food': 'Delicious jokes about cooking, eating, and everything food-related. These jokes are in good taste!',
    'Sports': 'Funny jokes about sports, athletes, and competition. Score big laughs with these athletic puns!',
    'School': 'Educational humor about teachers, students, and classroom antics. An A+ collection of school jokes!',
    'Dad Life': 'Classic dad humor about parenting, family life, and dad activities. The essence of dad jokes!',
    'Technology': 'Modern jokes about computers, phones, and digital life. These jokes compute!',
    'Music': 'Musical jokes and puns for music lovers. These jokes really strike a chord!',
    'Work': 'Office humor and workplace jokes. Make your colleagues laugh at the water cooler!',
    'Science': 'Nerdy jokes about physics, chemistry, biology, and science. Scientifically proven to be funny!',
    'History': 'Jokes about the past and historical figures. These jokes never get old!',
    'Travel': 'Jokes about vacations, airports, and adventures. Pack your sense of humor!',
    'Money': 'Financial jokes and money humor. These jokes make cents!',
    'Weather': 'Jokes about rain, snow, sun, and forecasts. Whether you like them or not!',
    'Medical': 'Doctor jokes and medical humor. Laughter is the best medicine!',
    'Seasonal': 'Holiday and seasonal jokes for every time of year. Celebrate with humor!',
    'Words & Puns': 'Clever wordplay and pun-tastic jokes. For those who appreciate linguistic humor!',
    'Knock Knock': 'Classic knock knock jokes that never get old. Who\'s there? More dad jokes!',
    'Global': 'International humor and jokes from around the world. Universal laughter!',
    'Pirate': 'Arrr you ready for pirate jokes? Yo ho ho and a bottle of puns!'
  },

  // Category emojis
  CATEGORY_EMOJIS: {
    'Farm': '🚜',
    'Animal': '🦁',
    'Food': '🍕',
    'Sports': '⚽',
    'School': '📚',
    'Dad Life': '👨',
    'Technology': '💻',
    'Music': '🎵',
    'Work': '💼',
    'Science': '🔬',
    'History': '📜',
    'Travel': '✈️',
    'Money': '💰',
    'Weather': '🌤️',
    'Medical': '⚕️',
    'Seasonal': '🎄',
    'Words & Puns': '📝',
    'Knock Knock': '🚪',
    'Global': '🌍',
    'Pirate': '🏴‍☠️'
  }
};
