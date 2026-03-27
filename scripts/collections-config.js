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
        seasonTag: "christmas",
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
    },

    // --- Holidays ---
    {
      slug: "halloween-dad-jokes",
      title: "Halloween Dad Jokes",
      description: "Spooky-funny dad jokes about ghosts, pumpkins, skeletons, and witches — perfect for trick-or-treating, Halloween parties, and costume contests.",
      context: "Halloween parties, trick-or-treating, and spooky season",
      keywords: ["halloween jokes", "spooky dad jokes", "pumpkin jokes", "ghost puns"],
      jokeFilter: {
        seasonTag: "halloween",
        categories: ["Words & Puns", "#DadLife"],
        keywords: ["halloween", "spooky", "pumpkin", "ghost", "candy", "witch", "skeleton", "costume"]
      },
      faqs: [
        {
          question: "What are the best dad jokes for Halloween?",
          answer: "The best Halloween dad jokes play on spooky themes with classic puns — think skeleton, ghost, and pumpkin wordplay. They're silly enough to make kids laugh and groan-worthy enough for adults."
        },
        {
          question: "Are Halloween dad jokes appropriate for trick-or-treaters?",
          answer: "Absolutely! Halloween dad jokes are clean and family-friendly. Many families tape a joke to their candy bowl or have kids tell a joke before getting a treat — it's a fun twist on the tradition."
        },
        {
          question: "How can I use dad jokes at a Halloween party?",
          answer: "Print jokes on cards and scatter them around the party, include them in a costume contest as bonus rounds, or use them as ice-breakers. A spooky dad joke contest is always a hit."
        },
        {
          question: "Why do skeleton and ghost jokes work so well as dad jokes?",
          answer: "Skeleton and ghost jokes are natural fits for dad humor because they lend themselves to endless puns — 'no body' jokes, 'boo' jokes, and bone-related wordplay practically write themselves."
        }
      ]
    },
    {
      slug: "thanksgiving-dad-jokes",
      title: "Thanksgiving Dad Jokes",
      description: "Hilarious turkey-themed dad jokes for the Thanksgiving table — guaranteed to get groans between helpings of stuffing and pie.",
      context: "Thanksgiving dinner, family gatherings, and holiday meals",
      keywords: ["thanksgiving jokes", "turkey dad jokes", "holiday dinner jokes", "family gathering humor"],
      jokeFilter: {
        seasonTag: "thanksgiving",
        categories: ["Food", "#DadLife", "Family"],
        keywords: ["thanksgiving", "turkey", "pilgrim", "grateful", "feast", "family dinner"]
      },
      faqs: [
        {
          question: "What are the best dad jokes for the Thanksgiving table?",
          answer: "Turkey puns and food wordplay dominate Thanksgiving dad jokes. Jokes about stuffing, gravy, and pie are crowd favorites because everyone at the table can relate to the subject matter."
        },
        {
          question: "How many jokes should I tell at Thanksgiving dinner?",
          answer: "Space them out — one before the meal, one during, and one at dessert. Rapid-fire jokes can overwhelm, but a well-timed dad joke between courses keeps the mood light and festive."
        },
        {
          question: "Are Thanksgiving dad jokes good for all ages?",
          answer: "Yes! Thanksgiving dad jokes are inherently wholesome. They revolve around food, family, and gratitude — topics that everyone from grandkids to grandparents can enjoy and laugh about together."
        },
        {
          question: "Can I use Thanksgiving dad jokes in a toast or grace?",
          answer: "A single well-placed dad joke can make a Thanksgiving toast memorable. Start with something heartfelt, drop the joke in the middle, and close with gratitude — it's the perfect formula."
        }
      ]
    },
    {
      slug: "new-years-dad-jokes",
      title: "New Year's Dad Jokes",
      description: "Ring in the new year with groan-worthy dad jokes about resolutions, countdowns, champagne, and fresh starts.",
      context: "New Year's Eve parties, midnight celebrations, and resolution talk",
      keywords: ["new years jokes", "new year dad jokes", "resolution jokes", "midnight humor"],
      jokeFilter: {
        categories: ["Words & Puns", "#DadLife"],
        keywords: ["new year", "resolution", "midnight", "champagne", "countdown", "party"]
      },
      faqs: [
        {
          question: "What are the best dad jokes for New Year's Eve?",
          answer: "The best New Year's dad jokes play on resolutions, countdowns, and the passage of time. Jokes about broken resolutions and staying up past bedtime are especially relatable for the dad crowd."
        },
        {
          question: "When should I tell a New Year's dad joke at a party?",
          answer: "Right before or after midnight is prime dad joke time. The champagne has been flowing, everyone's in a good mood, and a well-timed groan is the perfect way to kick off the new year."
        },
        {
          question: "Are resolution jokes good for social media?",
          answer: "Resolution dad jokes are perfect for January social media posts. They're timely, universally relatable, and get great engagement because everyone has a resolution story to share."
        },
        {
          question: "Can I use these jokes in a New Year's card or message?",
          answer: "Definitely! A dad joke in a New Year's text or card is a fun way to wish someone well. It's more memorable than a generic 'Happy New Year' and shows you put thought into it."
        }
      ]
    },
    {
      slug: "valentines-day-dad-jokes",
      title: "Valentine's Day Dad Jokes",
      description: "Cheesy, heartfelt dad jokes about love, romance, and chocolate — perfect for Valentine's cards, date nights, and making your partner groan.",
      context: "Valentine's Day cards, date nights, and romantic moments",
      keywords: ["valentine jokes", "love dad jokes", "romantic puns", "valentine card jokes"],
      jokeFilter: {
        categories: ["Words & Puns", "Family"],
        keywords: ["valentine", "love", "heart", "romantic", "date", "chocolate", "cupid"]
      },
      faqs: [
        {
          question: "Are dad jokes appropriate for Valentine's Day?",
          answer: "Dad jokes and Valentine's Day are a match made in heaven. Cheesy puns about love and hearts are peak dad humor, and they're a sweet, lighthearted way to show affection."
        },
        {
          question: "Can I put a dad joke in a Valentine's Day card?",
          answer: "Absolutely! A dad joke in a Valentine's card is endearing and memorable. It shows personality and humor, which many partners appreciate more than generic romantic sentiments."
        },
        {
          question: "What makes a good Valentine's Day dad joke?",
          answer: "The best Valentine's dad jokes use love-related wordplay — heart puns, candy references, and cupid jokes. They should be sweet enough to charm and corny enough to earn a proper groan."
        },
        {
          question: "How can I use dad jokes on a Valentine's date?",
          answer: "Drop one over dinner, hide a joke in a gift box, or text a series of love puns throughout the day. It turns Valentine's Day into a fun, playful experience rather than just another holiday."
        }
      ]
    },
    {
      slug: "easter-dad-jokes",
      title: "Easter Dad Jokes",
      description: "Egg-cellent dad jokes for Easter Sunday — perfect for egg hunts, Easter baskets, and family brunch.",
      context: "Easter Sunday, egg hunts, and spring celebrations",
      keywords: ["easter jokes", "easter puns", "egg jokes", "bunny dad jokes"],
      jokeFilter: {
        seasonTag: "easter",
        categories: ["Words & Puns", "Family"],
        keywords: ["easter", "egg", "bunny", "rabbit", "basket", "spring", "chick", "peep"]
      },
      faqs: [
        {
          question: "What are the best dad jokes for Easter?",
          answer: "The best Easter dad jokes play on eggs, bunnies, and spring themes. Egg puns are especially popular because they lend themselves to endless wordplay — egg-cellent, egg-cited, and so on."
        },
        {
          question: "Can I use Easter dad jokes during an egg hunt?",
          answer: "Absolutely! Hide jokes inside plastic eggs along with candy for a fun twist. Kids love finding surprise jokes, and it adds an extra layer of entertainment to the traditional egg hunt."
        },
        {
          question: "Are Easter dad jokes appropriate for all ages?",
          answer: "Yes! Easter dad jokes are clean, family-friendly, and perfect for mixed-age gatherings. They work equally well for kids at an egg hunt and adults at Easter brunch."
        },
        {
          question: "How can I share Easter dad jokes with family?",
          answer: "Write them on Easter cards, read them at brunch, or text one to family members each day during Holy Week. They add a lighthearted touch to the holiday celebrations."
        }
      ]
    },
    {
      slug: "4th-of-july-dad-jokes",
      title: "4th of July Dad Jokes",
      description: "Patriotic dad jokes for Independence Day — perfect for barbecues, fireworks, and Fourth of July celebrations.",
      context: "4th of July barbecues, fireworks shows, and patriotic celebrations",
      keywords: ["4th of july jokes", "independence day jokes", "patriotic dad jokes", "fireworks humor"],
      jokeFilter: {
        seasonTag: "fourthofjuly",
        categories: ["Words & Puns", "#DadLife"],
        keywords: ["america", "freedom", "firework", "fourth", "july", "patriot", "flag", "independence", "liberty", "grill", "barbecue"]
      },
      faqs: [
        {
          question: "What are the best dad jokes for the 4th of July?",
          answer: "The best Fourth of July dad jokes play on patriotic themes — freedom, fireworks, and American traditions. Barbecue and grilling jokes also fit perfectly since cookouts are a holiday staple."
        },
        {
          question: "Can I use these jokes at a 4th of July barbecue?",
          answer: "A 4th of July barbecue is prime dad joke territory! Tell one while flipping burgers, waiting for fireworks, or gathered around the picnic table. The relaxed atmosphere makes everyone more receptive to puns."
        },
        {
          question: "Are patriotic dad jokes appropriate for all audiences?",
          answer: "Yes! These jokes are lighthearted and celebratory, perfect for family-friendly gatherings. They focus on fun American traditions rather than politics, making them universally enjoyable."
        },
        {
          question: "How can I use dad jokes during a fireworks show?",
          answer: "Drop a joke during the quiet moments between firework launches, or text them to friends while watching. A well-timed pun about fireworks or sparklers always gets a good groan."
        }
      ]
    },
    {
      slug: "back-to-school-dad-jokes",
      title: "Back-to-School Dad Jokes",
      description: "Funny dad jokes about school, teachers, homework, and the school bus — perfect for lunchbox notes and first-day laughs.",
      context: "back-to-school season, lunchbox notes, and school drop-offs",
      keywords: ["back to school jokes", "school dad jokes", "teacher jokes", "homework humor"],
      jokeFilter: {
        categories: ["Words & Puns", "Science & Tech"],
        keywords: ["school", "teacher", "homework", "class", "student", "pencil", "math", "bus"]
      },
      faqs: [
        {
          question: "How can I use dad jokes for back-to-school season?",
          answer: "Write a dad joke on a sticky note and slip it into your kid's lunchbox. It's a small gesture that makes their day, and kids love sharing the jokes with friends at the lunch table."
        },
        {
          question: "Are school-themed dad jokes good for kids of all ages?",
          answer: "Yes! School dad jokes work for elementary through high school. Younger kids love simple puns about pencils and math, while older kids appreciate more clever wordplay about homework and tests."
        },
        {
          question: "Can teachers use these jokes in the classroom?",
          answer: "Teachers love using dad jokes to start class or transition between lessons. A quick joke lightens the mood, grabs attention, and makes the classroom feel more welcoming and fun."
        },
        {
          question: "What subjects make the best school dad jokes?",
          answer: "Math and science jokes are the most popular because numbers, equations, and scientific terms are natural fodder for puns. But history, English, and even gym class all have great dad joke potential."
        }
      ]
    },

    // --- Audiences ---
    {
      slug: "dad-jokes-for-teachers",
      title: "Dad Jokes for Teachers",
      description: "Classroom-ready dad jokes that teachers can use to engage students, lighten the mood, and make learning fun.",
      context: "classrooms, teacher lounges, and school events",
      keywords: ["teacher jokes", "classroom humor", "school jokes for teachers", "educational dad jokes"],
      jokeFilter: {
        categories: ["Science & Tech", "Words & Puns"],
        keywords: ["school", "teacher", "class", "student", "homework", "grade", "lesson", "principal"]
      },
      faqs: [
        {
          question: "Why should teachers use dad jokes in the classroom?",
          answer: "Dad jokes are a low-risk way to build rapport with students. They're always clean, they break tension before tests, and research shows that humor in education improves retention and engagement."
        },
        {
          question: "When is the best time to tell a dad joke in class?",
          answer: "The start of class, during transitions between activities, or right before a tough lesson are ideal moments. A well-timed joke resets attention spans and signals that learning can be fun."
        },
        {
          question: "Can dad jokes actually help students learn?",
          answer: "Yes! Jokes that incorporate subject matter help students remember key concepts. A chemistry pun about elements or a math joke about pi creates a memorable hook that sticks with students."
        },
        {
          question: "What if students groan at my dad jokes?",
          answer: "That's the whole point! The groan is a sign of success in dad joke territory. Students secretly love the predictability, and it becomes a bonding ritual between teacher and class."
        }
      ]
    },
    {
      slug: "dad-jokes-for-nurses",
      title: "Dad Jokes for Nurses",
      description: "Clean, funny dad jokes for nurses, healthcare workers, and anyone who needs a laugh between shifts at the hospital.",
      context: "hospitals, nursing stations, and healthcare break rooms",
      keywords: ["nurse jokes", "hospital humor", "healthcare dad jokes", "medical puns"],
      jokeFilter: {
        categories: ["Science & Tech", "Work & Money"],
        keywords: ["hospital", "nurse", "doctor", "patient", "medicine", "health", "sick"]
      },
      faqs: [
        {
          question: "Why are dad jokes popular with nurses?",
          answer: "Nurses deal with high-stress situations daily, and dad jokes provide quick, clean comic relief. They're easy to share between patients, require zero setup, and lighten the mood on tough shifts."
        },
        {
          question: "Can I share medical dad jokes with patients?",
          answer: "Absolutely! A lighthearted dad joke can put nervous patients at ease. Stick to gentle, non-clinical humor — patients appreciate the human connection and the distraction from medical anxiety."
        },
        {
          question: "Are hospital-themed dad jokes appropriate for the workplace?",
          answer: "Yes, as long as they stay clean and general. Jokes about band-aids, waiting rooms, and general health are perfect. Avoid anything that could be insensitive about specific conditions."
        },
        {
          question: "How can healthcare teams use dad jokes for morale?",
          answer: "Post a joke of the day at the nursing station, start shift handoffs with a quick pun, or create a joke board in the break room. Small moments of humor go a long way in healthcare settings."
        }
      ]
    },
    {
      slug: "dad-jokes-for-gamers",
      title: "Dad Jokes for Gamers",
      description: "Level up your humor with gaming dad jokes about video games, controllers, high scores, and respawning — perfect for streamers and game night.",
      context: "gaming sessions, Twitch streams, and game night with friends",
      keywords: ["gamer jokes", "video game dad jokes", "gaming puns", "streamer humor"],
      jokeFilter: {
        categories: ["Science & Tech", "Words & Puns"],
        keywords: ["game", "video", "controller", "level", "player", "score", "console", "computer"]
      },
      faqs: [
        {
          question: "What makes gaming dad jokes funny?",
          answer: "Gaming dad jokes work because they combine universally known gaming concepts — extra lives, respawning, lag, and boss fights — with classic dad joke wordplay. Gamers and non-gamers alike can appreciate the puns."
        },
        {
          question: "Can I use gaming dad jokes on my stream?",
          answer: "Gaming dad jokes are perfect for streams! They're clean enough for any audience, fill downtime naturally, and chat loves reacting to a well-timed groan. Many streamers use them as subscriber alerts too."
        },
        {
          question: "Are these jokes good for game night?",
          answer: "Absolutely! Drop a dad joke between rounds or when someone loses. It keeps the mood light, prevents salt, and adds an extra layer of entertainment to board games and video game sessions alike."
        },
        {
          question: "Do gaming dad jokes appeal to non-gamers?",
          answer: "Many gaming dad jokes use concepts that have entered mainstream culture — like 'leveling up' or 'game over.' The best ones work on multiple levels so both gamers and casual listeners get the joke."
        }
      ]
    },
    {
      slug: "dad-jokes-for-road-trips",
      title: "Dad Jokes for Road Trips",
      description: "Keep the whole car laughing with road trip dad jokes about driving, getting lost, gas stations, and backseat adventures.",
      context: "long drives, family road trips, and car rides",
      keywords: ["road trip jokes", "car ride jokes", "driving dad jokes", "travel humor"],
      jokeFilter: {
        categories: ["Words & Puns", "#DadLife"],
        keywords: ["car", "drive", "road", "trip", "travel", "highway", "gas", "map", "lost"]
      },
      faqs: [
        {
          question: "Why are dad jokes perfect for road trips?",
          answer: "Road trips and dad jokes are a classic combo. You have a captive audience, plenty of downtime, and the car setting naturally inspires jokes about driving, navigation, and 'are we there yet?' moments."
        },
        {
          question: "How many dad jokes should I bring on a road trip?",
          answer: "Load up at least 20-30 jokes for a long drive. Space them out every 15-20 minutes for maximum impact. Pro tip: let the kids take turns reading jokes aloud to keep everyone involved."
        },
        {
          question: "Can road trip dad jokes keep kids entertained?",
          answer: "Definitely! Dad jokes are a screen-free way to keep kids engaged in the car. They spark conversation, inspire kids to make up their own jokes, and create memories that outlast any tablet game."
        },
        {
          question: "What's the best way to deliver dad jokes while driving?",
          answer: "Deadpan delivery with eyes on the road is peak dad comedy. Set up the joke casually, pause for effect, then deliver the punchline. The collective groan from the whole car is the ultimate reward."
        }
      ]
    },
    {
      slug: "dad-jokes-for-instagram",
      title: "Dad Jokes for Instagram",
      description: "Ultra-short, caption-ready dad jokes designed for Instagram posts, Stories, and Reels — puns that fit perfectly in a social media caption.",
      context: "Instagram captions, Stories, Reels, and social media posts",
      keywords: ["instagram jokes", "caption jokes", "short jokes for social media", "instagram puns"],
      jokeFilter: {
        maxLength: 80
      },
      faqs: [
        {
          question: "What makes a dad joke good for Instagram?",
          answer: "The best Instagram dad jokes are ultra-short (under 80 characters), visually punchy, and immediately funny without any context. They need to work as standalone captions that stop the scroll."
        },
        {
          question: "How do I use dad jokes as Instagram captions?",
          answer: "Pair a short dad joke with a relevant photo or selfie. The contrast between a serious photo and a corny caption is what makes it shareable. Add relevant hashtags like #dadjokes for discoverability."
        },
        {
          question: "Do dad jokes perform well on social media?",
          answer: "Dad jokes consistently get high engagement on Instagram because they're shareable, tag-worthy, and save-worthy. People love sending them to friends, which naturally boosts your reach and interactions."
        },
        {
          question: "Can I use these jokes for Instagram Reels or Stories?",
          answer: "Absolutely! Put the setup as text on screen, then reveal the punchline with a swipe or cut. The short format of these jokes is tailor-made for Stories and Reels where attention spans are short."
        }
      ]
    },

    // --- Food & Animals ---
    {
      slug: "best-food-dad-jokes",
      title: "Best Food Dad Jokes",
      description: "Deliciously funny dad jokes about pizza, tacos, burgers, cooking, and everything in the kitchen — guaranteed to leave you hungry for more puns.",
      context: "dinner time, cooking, restaurants, and food lovers",
      keywords: ["food jokes", "cooking dad jokes", "pizza puns", "kitchen humor"],
      jokeFilter: {
        categories: ["Food", "Words & Puns"],
        keywords: ["food", "eat", "cook", "kitchen", "restaurant", "chef", "pizza", "burger", "taco"]
      },
      faqs: [
        {
          question: "Why are food dad jokes so popular?",
          answer: "Everyone eats, so food jokes are universally relatable. Food words lend themselves naturally to puns — 'lettuce' sounds like 'let us,' 'thyme' sounds like 'time' — making them easy to create and enjoy."
        },
        {
          question: "When is the best time to tell a food dad joke?",
          answer: "Dinner time is the classic moment, but food dad jokes also work great at restaurants, barbecues, potlucks, and while cooking. Basically any time food is involved, there's an opening for a pun."
        },
        {
          question: "Can I use food dad jokes at a restaurant?",
          answer: "Absolutely! Drop one when the menu arrives, while waiting for food, or when the check comes. Servers often appreciate the humor too — many have heard them all and will play along."
        },
        {
          question: "What foods make the best dad jokes?",
          answer: "Pizza, tacos, and breakfast foods tend to produce the most jokes because their ingredient names double as great pun material. Cheese jokes are also a staple — they're always extra 'gouda.'"
        }
      ]
    },
    {
      slug: "best-animal-dad-jokes",
      title: "Best Animal Dad Jokes",
      description: "Wildly funny dad jokes about dogs, cats, chickens, bears, and every creature in between — perfect for animal lovers and zoo trips.",
      context: "zoo visits, pet owners, animal lovers, and nature outings",
      keywords: ["animal jokes", "dog dad jokes", "cat puns", "zoo jokes", "animal humor"],
      jokeFilter: {
        categories: ["Animals", "Words & Puns"],
        keywords: ["animal", "dog", "cat", "fish", "chicken", "bear", "horse", "cow", "bird", "zoo"]
      },
      faqs: [
        {
          question: "Why are animal dad jokes so popular with kids?",
          answer: "Kids love animals, and animal dad jokes combine two things children enjoy — silly humor and creatures they can picture. The visual nature of animal jokes makes them especially memorable and retellable."
        },
        {
          question: "What animals make the best dad jokes?",
          answer: "Chickens, fish, and dogs are the holy trinity of animal dad jokes. 'Why did the chicken cross the road?' is the original dad joke, and fish and dog puns are endlessly versatile."
        },
        {
          question: "Can I use animal dad jokes at the zoo?",
          answer: "The zoo is prime dad joke territory! Tell a relevant joke at each animal exhibit. It turns a regular zoo trip into an interactive comedy tour that kids (and reluctant teenagers) will actually remember."
        },
        {
          question: "Are animal dad jokes good for pet owners?",
          answer: "Pet owners especially love animal dad jokes because they can relate to the humor on a personal level. Dog and cat jokes hit different when you have one curled up on the couch next to you."
        }
      ]
    }
  ]
};
