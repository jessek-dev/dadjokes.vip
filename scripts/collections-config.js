export const COLLECTIONS_CONFIG = {
  // Template path (relative to scripts directory)
  COLLECTION_TEMPLATE: '../collection/template.html',

  // Output path (relative to scripts directory)
  COLLECTION_OUTPUT_DIR: '../collection',

  // Base URL
  BASE_URL: 'https://dadjokes.vip',

  // Collection definitions
  collections: [
    {
      slug: "dad-jokes-for-weddings",
      title: "Dad Jokes for Weddings",
      description: "The best dad jokes for wedding toasts, speeches, and reception laughs.",
      context: "wedding speeches, toasts, and celebrations",
      keywords: ["wedding dad jokes", "father of bride jokes", "wedding toast jokes", "wedding speech humor"],
      jokeFilter: {
        categories: ["Family", "#DadLife", "Words & Puns"],
        keywords: ["wedding", "marry", "wife", "husband", "ring", "love", "bride", "groom", "toast", "dance", "cake"]
      },
      faqs: [
        {
          question: "What makes a good dad joke for a wedding toast?",
          answer: "The best wedding dad jokes are clean, short, and relatable. They should get a groan or a laugh without making anyone uncomfortable. Stick to universal themes like marriage, love, and family."
        },
        {
          question: "When should I use dad jokes during a wedding?",
          answer: "Dad jokes work great in toasts, speeches, and casual conversation during the reception. They're perfect ice-breakers and can help lighten the mood during emotional moments."
        },
        {
          question: "Are dad jokes appropriate for a wedding speech?",
          answer: "Absolutely! Dad jokes are clean and family-friendly by nature, making them perfect for wedding speeches. Just keep them brief and sprinkle a few in rather than making the whole speech a comedy routine."
        },
        {
          question: "How many jokes should I include in a wedding toast?",
          answer: "Two to three well-placed dad jokes are ideal for a wedding toast. This keeps the humor balanced with heartfelt moments and ensures you don't overstay your welcome at the microphone."
        }
      ]
    },
    {
      slug: "dad-jokes-for-work",
      title: "Dad Jokes for Work",
      description: "Clean, office-appropriate dad jokes perfect for Slack, meetings, and water cooler chat.",
      context: "the office, Slack channels, and team meetings",
      keywords: ["office jokes", "work dad jokes", "jokes for slack", "workplace humor"],
      jokeFilter: {
        categories: ["Work & Money", "Words & Puns"],
        keywords: ["work", "office", "boss", "job", "meeting", "email", "computer", "desk", "money", "business"]
      },
      faqs: [
        {
          question: "Are dad jokes appropriate for the workplace?",
          answer: "Yes! Dad jokes are inherently clean and family-friendly, making them one of the safest forms of humor for the office. They're perfect for Slack channels, team meetings, and water cooler conversations."
        },
        {
          question: "How can I use dad jokes to break the ice in meetings?",
          answer: "Start a meeting with a quick dad joke to loosen everyone up. Keep it short and work-related if possible. A well-timed groan is a great way to build team camaraderie."
        },
        {
          question: "What's the best way to share dad jokes on Slack?",
          answer: "Create a dedicated #dad-jokes channel, or drop one into your team channel to start the day. Many teams have a 'joke of the day' tradition that boosts morale and engagement."
        },
        {
          question: "Can humor at work improve productivity?",
          answer: "Research shows that workplace humor can reduce stress, improve team bonding, and boost creativity. Dad jokes are especially effective because they're universally inoffensive and create shared moments of levity."
        }
      ]
    },
    {
      slug: "dad-jokes-for-kids",
      title: "Dad Jokes for Kids",
      description: "Kid-friendly dad jokes that are clean, silly, and guaranteed to make children groan.",
      context: "kids, family game night, and school",
      keywords: ["kid friendly jokes", "jokes for kids", "clean jokes for children", "family jokes"],
      jokeFilter: {
        categories: ["Animals", "Food", "Science & Tech"],
        keywords: ["school", "teacher", "animal", "dog", "cat", "fish", "chicken", "book", "math"]
      },
      faqs: [
        {
          question: "At what age do kids start enjoying dad jokes?",
          answer: "Most kids start appreciating wordplay and puns around age 6-7, which is when dad jokes really land. Younger kids enjoy the silliness even if they don't fully get the pun."
        },
        {
          question: "Why are dad jokes good for kids?",
          answer: "Dad jokes help kids develop language skills, understand wordplay, and build a sense of humor. They're always clean and safe, and the call-and-response format encourages social interaction."
        },
        {
          question: "How can I use these jokes with my kids?",
          answer: "Try telling one at dinner, in the car, or at bedtime. Kids love the ritual of joke-telling, and many will start memorizing and retelling their favorites to friends and family."
        },
        {
          question: "Can dad jokes help with learning?",
          answer: "Yes! Many dad jokes use puns and wordplay that help kids expand their vocabulary and understand multiple meanings of words. Science and math-themed dad jokes can even make learning more fun."
        }
      ]
    },
    {
      slug: "christmas-dad-jokes",
      title: "Christmas Dad Jokes",
      description: "Festive dad jokes for the holidays — perfect for Christmas dinner, cards, and family gatherings.",
      context: "Christmas dinner, holiday cards, and family gatherings",
      keywords: ["christmas jokes", "holiday dad jokes", "xmas puns", "santa jokes"],
      jokeFilter: {
        categories: ["#DadLife", "Words & Puns"],
        keywords: ["christmas", "santa", "snow", "elf", "reindeer", "present", "holiday", "winter", "cold", "tree", "stocking"]
      },
      faqs: [
        {
          question: "What are good dad jokes for Christmas crackers?",
          answer: "Short one-liner dad jokes work best for Christmas crackers. Look for jokes about Santa, elves, reindeer, and snow that can fit on a small slip of paper and get an instant groan."
        },
        {
          question: "Can I use these jokes in Christmas cards?",
          answer: "Absolutely! A dad joke in a Christmas card adds a personal touch that recipients love. Pick one that matches the recipient's sense of humor for maximum impact."
        },
        {
          question: "How do I keep Christmas dinner entertaining with dad jokes?",
          answer: "Have each family member read a dad joke before dessert, or hide jokes under plates for a surprise. It's a fun tradition that gets everyone laughing and engaged."
        },
        {
          question: "Are Christmas dad jokes appropriate for all ages?",
          answer: "Yes! Christmas dad jokes are family-friendly by nature. They're perfect for mixed-age gatherings where grandparents, parents, and kids are all celebrating together."
        }
      ]
    },
    {
      slug: "fathers-day-dad-jokes",
      title: "Father's Day Dad Jokes",
      description: "The ultimate collection of dad jokes for Father's Day cards, texts, and celebrations.",
      context: "Father's Day cards, texts, and family celebrations",
      keywords: ["fathers day jokes", "dad humor", "father jokes", "dad day jokes"],
      jokeFilter: {
        categories: ["#DadLife", "Family"],
        keywords: ["dad", "father", "son", "daughter", "family", "grill", "lawn", "thermostat", "garage"]
      },
      faqs: [
        {
          question: "What's the best dad joke for a Father's Day card?",
          answer: "The best Father's Day dad jokes reference classic dad stereotypes — thermostats, grilling, lawn care, and bad puns. Pick one that matches your dad's personality for a guaranteed eye-roll."
        },
        {
          question: "How can I make Father's Day special with humor?",
          answer: "Send a dad joke countdown leading up to Father's Day, include one in his card, or create a 'Dad Joke Championship' at the family gathering where everyone competes to tell the best (worst) joke."
        },
        {
          question: "Why are dad jokes the perfect Father's Day gift?",
          answer: "Dad jokes celebrate the very essence of dad humor. Giving a dad his own material back is the most meta Father's Day gift possible — and most dads secretly love being recognized for their comedic 'talent.'"
        },
        {
          question: "Can I text dad jokes to my dad on Father's Day?",
          answer: "Definitely! Send one joke each hour throughout the day, or start a family group chat joke-off. It's a fun, low-effort way to show you're thinking about him even if you can't be there in person."
        }
      ]
    },
    {
      slug: "one-liner-dad-jokes",
      title: "Best One-Liner Dad Jokes",
      description: "Short, punchy dad jokes you can deliver in a single line — perfect for texting and social media.",
      context: "texting, social media captions, and quick laughs",
      keywords: ["one liner jokes", "short dad jokes", "quick jokes", "jokes to text"],
      jokeFilter: {
        maxLength: 100
      },
      faqs: [
        {
          question: "What makes a great one-liner dad joke?",
          answer: "The best one-liner dad jokes are short (under 100 characters), self-contained, and deliver the pun or punchline in a single breath. They should be easy to memorize and quick to deliver."
        },
        {
          question: "Why are short dad jokes better for texting?",
          answer: "Short jokes fit in a single message bubble, don't require scrolling, and land immediately. They're perfect for a quick laugh without disrupting the conversation flow."
        },
        {
          question: "Can I use these as social media captions?",
          answer: "Absolutely! One-liner dad jokes make excellent Instagram captions, Twitter posts, and TikTok comments. They're shareable, quotable, and consistently get engagement."
        },
        {
          question: "How do I deliver a one-liner dad joke effectively?",
          answer: "Timing is everything. Drop it casually into conversation with a straight face, then wait for the groan. The best delivery is when people don't see it coming."
        }
      ]
    },
    {
      slug: "science-dad-jokes",
      title: "Science Dad Jokes",
      description: "Nerdy dad jokes about chemistry, physics, biology, and more — for the scientifically inclined.",
      context: "science class, lab partners, and nerdy friends",
      keywords: ["science jokes", "chemistry jokes", "physics puns", "nerd dad jokes"],
      jokeFilter: {
        categories: ["Science & Tech"],
        keywords: ["atom", "chemistry", "physics", "scientist", "lab", "element", "electron", "proton", "biology", "math", "equation"]
      },
      faqs: [
        {
          question: "Are science dad jokes educational?",
          answer: "Many science dad jokes incorporate real scientific concepts in their punchlines. They can actually help students remember chemistry elements, physics principles, and biology terms through humor."
        },
        {
          question: "Can I use these jokes in a science classroom?",
          answer: "Yes! Teachers frequently use science dad jokes to engage students and make lessons more memorable. A well-placed chemistry pun can make the periodic table a lot more fun."
        },
        {
          question: "What's the most popular type of science dad joke?",
          answer: "Chemistry jokes tend to be the most popular because element names and chemical reactions lend themselves naturally to wordplay. Physics jokes about force, energy, and relativity are a close second."
        },
        {
          question: "Why do scientists love dad jokes?",
          answer: "Scientists appreciate the logical structure of dad jokes — the setup creates an expectation, and the punchline subverts it with wordplay. It's basically the scientific method applied to humor."
        }
      ]
    },
    {
      slug: "dad-jokes-for-texting",
      title: "Dad Jokes Perfect for Texting",
      description: "Short, shareable dad jokes that are perfect to drop in a text message or group chat.",
      context: "text messages, group chats, and DMs",
      keywords: ["jokes to text", "funny texts", "text message jokes", "short jokes for texting"],
      jokeFilter: {
        maxLength: 120
      },
      faqs: [
        {
          question: "What's the ideal length for a text message joke?",
          answer: "The best text jokes are under 120 characters — short enough to read at a glance and land instantly. They should fit in a single message bubble without requiring the recipient to scroll."
        },
        {
          question: "How often should I send dad jokes via text?",
          answer: "Once a day is the sweet spot for most people. Too many can feel spammy, but a well-timed daily dad joke becomes something people look forward to. Many friend groups have a daily joke tradition."
        },
        {
          question: "Are dad jokes good for group chats?",
          answer: "Dad jokes are perfect for group chats! They're universally inoffensive, spark reactions from everyone, and often start joke chains where everyone tries to one-up each other."
        },
        {
          question: "Can I schedule dad joke texts?",
          answer: "Yes! Use a scheduled messaging feature on your phone to send a dad joke at the same time each day. Or download the Dad Jokes app to get daily joke notifications you can share instantly."
        }
      ]
    }
  ]
};
