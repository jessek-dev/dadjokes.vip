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

  // Category descriptions (matching app exactly)
  CATEGORY_DESCRIPTIONS: {
    '#DadLife': 'The ultimate collection of classic dad humor about parenting, family life, and all things dad. These jokes capture what it means to be a father.',
    'Wife': 'Lighthearted marriage humor and spouse jokes that celebrate the ups and downs of married life with good-natured fun.',
    'Family': 'Wholesome jokes about family relationships, kids, siblings, and relatives that everyone can relate to and enjoy together.',
    'Words & Puns': 'Clever wordplay, brilliant puns, and linguistic humor that will make you groan and laugh at the same time. Perfect for word nerds!',
    'Around the House': 'Hilarious jokes about home life, furniture, household chores, and all the funny situations that happen under your own roof.',
    'Food': 'Delicious jokes about cooking, eating, restaurants, and everything food-related. Perfect to share at the dinner table!',
    'Animals': 'Hilarious animal jokes featuring dogs, cats, wildlife, and creatures of all kinds. Perfect for animal lovers and pet owners!',
    'Work & Money': 'Office humor, business jokes, and funny takes on finances that anyone who\'s ever had a job can appreciate and relate to.',
    'Sports & Games': 'Athletic humor and competition jokes covering football, baseball, basketball, golf, and all your favorite sports and games.',
    'Transportation': 'Funny jokes about cars, planes, trains, bicycles, and all forms of travel. Great for road trips and family vacations!',
    'Movies': 'Hollywood humor and cinema jokes for film buffs. References to classics, blockbusters, and everything about the movies.',
    'Music & Arts': 'Musical jokes and artistic humor for creative minds. From instruments to paintings, these jokes celebrate the arts.',
    'Medical': 'Doctor jokes and medical humor that\'s healthy for your funny bone. Perfect for healthcare workers and patients alike!',
    'Global': 'International humor from around the world. Geography jokes, travel humor, and jokes about different countries and cultures.',
    'Clothing': 'Fashion fails, wardrobe wisdom, and jokes about clothes, shoes, and style. Perfect for anyone who\'s ever gotten dressed!',
    'People': 'Jokes about personalities, characters, professions, and all types of people. Humor that celebrates our differences and similarities.',
    'History': 'Jokes about the past, historical figures, and events that shaped our world. History class was never this funny!',
    'Religion': 'Lighthearted religious humor that\'s respectful and family-friendly. Jokes that celebrate faith with a smile.',
    'Mother Nature': 'Weather jokes, plant humor, and outdoor adventure jokes. Everything about nature, gardening, and the great outdoors!',
    'NSFW': 'Jokes for mature audiences only. Adult humor that\'s not suitable for work or kids. You\'ve been warned!',
    'Yo Mama': 'Classic yo mama jokes that are so funny, they\'ll make yo mama laugh! Traditional roasts delivered with comedic timing.'
  },

  // Category emojis (matching app exactly)
  CATEGORY_EMOJIS: {
    'Wife': '🐅',
    '#DadLife': '🦸‍♂️',
    'Words & Puns': '📝',
    'Seasonal': '🎃',
    'Food': '🍔',
    'Animals': '🐕',
    'Medical': '🩺',
    'Mother Nature': '🌪️',
    'History': '📜',
    'Religion': '⛪',
    'Around the House': '🏠',
    'Family': '⚔️',
    'Music & Arts': '🪗',
    'Transportation': '🚲',
    'Work & Money': '💼',
    'Science & Tech': '🔬',
    'Global': '🌍',
    'Clothing': '👞',
    'Movies': '🎬',
    'Sports & Games': '⚽',
    'People': '🧑‍🤝‍🧑',
    'NSFW': '🥷',
    'Yo Mama': '🧌',
    'General': '🥸'
  }
};
