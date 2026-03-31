export const CONFIG = {
  // Firebase paths
  JOKES_COLLECTION: 'jokes/all/jokes',
  NAME_JOKES_COLLECTION: 'name_jokes',

  // Template paths (relative to project root)
  JOKE_TEMPLATE: '../joke/template.html',
  CATEGORY_TEMPLATE: '../category/template.html',

  // Output paths (relative to project root)
  OUTPUT_DIR: '..',
  JOKE_OUTPUT_DIR: '../jokes',
  CATEGORY_OUTPUT_DIR: '../jokes',
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
    'Yo Mama': 'Classic yo mama jokes that are so funny, they\'ll make yo mama laugh! Traditional roasts delivered with comedic timing.',
    'Failed AI Jokes': 'Pretty terrible attempts by AI to be funny. These jokes are so bad, they\'re almost good... almost. Pure comedy gold (or fool\'s gold).'
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
    'General': '🥸',
    'Failed AI Jokes': '🤖'
  },

  // Category intros - 2-3 sentences of unique intro text per category
  CATEGORY_INTROS: {
    '#DadLife': 'Nothing says "dad" like a perfectly timed groan-worthy joke. These #DadLife jokes celebrate everything from lawn mowing to thermostat wars. Scroll down, tap to reveal each punchline, and prepare to feel personally attacked.',
    'Wife': 'Marriage is a beautiful thing - especially when it comes to joke material. These spouse and marriage jokes are all in good fun and perfect for sharing with your better half. Just make sure they have a sense of humor first!',
    'Family': 'From sibling rivalries to grandparent wisdom, family life is an endless source of comedy. These family jokes are wholesome enough to share at the dinner table and funny enough to actually get a laugh.',
    'Words & Puns': 'If you love clever wordplay and groan-inducing puns, this is your happy place. These jokes twist the English language in ways your English teacher never intended. Warning: excessive eye-rolling may occur.',
    'Around the House': 'From leaky faucets to lost TV remotes, home life is full of comedy gold. These household jokes prove that the funniest things happen right under your own roof. Tap each one to reveal the punchline!',
    'Food': 'These food jokes are best served with a side of laughter. From kitchen disasters to restaurant humor, we have got a full menu of dad jokes that will leave you hungry for more. Bon appetit!',
    'Animals': 'From dogs and cats to the wildest creatures on Earth, animal jokes never get old. These are perfect for pet lovers, zoo visitors, or anyone who has ever talked to their dog like a person.',
    'Work & Money': 'We spend most of our lives at work, so we might as well laugh about it. These office and money jokes are perfect for lightening up a Monday morning or a boring meeting.',
    'Sports & Games': 'Whether you are a die-hard sports fan or just enjoy a good game, these jokes cover every sport from football to golf. Perfect for tailgates, watch parties, or trash-talking your friends.',
    'Transportation': 'Cars, planes, trains, and bicycles - if it moves, we have a joke about it. These transportation jokes are perfect for road trips, airport layovers, or your daily commute.',
    'Movies': 'Lights, camera, laughter! These movie-themed dad jokes reference everything from blockbusters to indie films. Perfect for movie night or impressing your friends at trivia.',
    'Music & Arts': 'From off-key singing to modern art confusion, these jokes celebrate the creative world. Musicians, artists, and art lovers will all find something to laugh about here.',
    'Medical': 'Laughter really is the best medicine, and these doctor and medical jokes prove it. Healthy humor for healthcare workers, patients, and anyone who has ever Googled their symptoms.',
    'Global': 'Pack your bags for a world tour of humor! These geography and travel jokes span the globe, covering countries, cultures, and the universal experience of getting lost.',
    'Clothing': 'Fashion may come and go, but clothing jokes are always in style. From wardrobe malfunctions to shoe puns, these jokes are a perfect fit for anyone who has ever gotten dressed.',
    'People': 'People-watching is fun, but people-joking is even better. These jokes about personalities, professions, and human nature remind us that we are all a little bit ridiculous.',
    'History': 'Those who do not learn from history are doomed to miss these jokes. Time-travel through centuries of humor with these historical dad jokes that make the past a lot more fun.',
    'Religion': 'Lighthearted and respectful, these faith-inspired jokes prove that a good sense of humor is a blessing. Perfect for sharing at church socials or family gatherings.',
    'Mother Nature': 'Weather, plants, mountains, and the great outdoors - nature gives us so much to joke about. These jokes are perfect for camping trips, hikes, or watching the weather forecast.',
    'NSFW': 'Fair warning: these jokes push the boundaries of dad humor into adult territory. Not for the faint of heart or the under-18 crowd. You have been warned!',
    'Yo Mama': 'The timeless tradition of yo mama jokes, served up dad-joke style. These classic roasts are so funny, even yo mama would laugh. Probably.',
    'Failed AI Jokes': 'We asked AI to write dad jokes and... well, the results speak for themselves. These hilariously bad attempts at humor prove that robots still have a lot to learn about comedy.'
  },

  // Map categories to their corresponding collection page slugs (if any)
  CATEGORY_COLLECTION_MAP: {
    'Food': 'best-food-dad-jokes',
    'Animals': 'best-animal-dad-jokes'
  },

  // Related categories for cross-linking (SEO internal linking)
  RELATED_CATEGORIES: {
    '#DadLife': ['Family', 'Wife', 'Work & Money'],
    'Wife': ['#DadLife', 'Family', 'People'],
    'Family': ['#DadLife', 'Wife', 'Animals'],
    'Words & Puns': ['General', 'People', 'Work & Money'],
    'Around the House': ['Food', 'Clothing', 'Family'],
    'Food': ['Around the House', 'Work & Money', 'Animals'],
    'Animals': ['Mother Nature', 'Family', 'Food'],
    'Work & Money': ['#DadLife', 'People', 'Transportation'],
    'Sports & Games': ['Movies', 'Music & Arts', 'Transportation'],
    'Transportation': ['Work & Money', 'Sports & Games', 'Around the House'],
    'Movies': ['Music & Arts', 'Sports & Games', 'People'],
    'Music & Arts': ['Movies', 'People', 'Words & Puns'],
    'Medical': ['Work & Money', 'People', 'Animals'],
    'Global': ['History', 'People', 'Transportation'],
    'Clothing': ['Around the House', 'People', 'Work & Money'],
    'People': ['Work & Money', 'Family', 'Global'],
    'History': ['Global', 'Religion', 'People'],
    'Religion': ['History', 'People', 'Family'],
    'Mother Nature': ['Animals', 'Global', 'Transportation'],
    'NSFW': ['Yo Mama', 'General', 'People'],
    'Yo Mama': ['NSFW', 'People', 'General'],
    'Failed AI Jokes': ['General', 'Words & Puns', 'Animals'],
    'General': ['Words & Puns', 'People', 'Work & Money']
  }
};
