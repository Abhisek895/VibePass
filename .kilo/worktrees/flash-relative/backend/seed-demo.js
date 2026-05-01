const { PrismaClient } = require('@prisma/client');
const { randomUUID, scryptSync } = require('crypto');

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'password123';

function hashPassword(password, seed) {
  const salt = `${seed.replace(/[^a-z0-9]/gi, '').toLowerCase()}demoseed`
    .slice(0, 16)
    .padEnd(16, '0');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function jsonList(values) {
  return JSON.stringify(values);
}

function defineUser(config) {
  return {
    ...config,
    interests: jsonList(config.interests),
    promptAnswers: config.promptAnswers || [],
    seedPosts: config.seedPosts || [],
    profile: {
      ...config.profile,
      interests: jsonList(config.profile?.interests || config.interests),
    },
  };
}

const SEED_USERS = [
  defineUser({
    id: 'user-demo-host',
    email: 'demo@vibepass.app',
    username: 'vibehost',
    age: 24,
    pronouns: 'he/him',
    interests: ['Music', 'Travel', 'Tech', 'Food'],
    conversationIntent: 'fun-chat',
    voiceComfort: 'comfortable',
    bio: 'Builder by day, playlist curator by night.',
    profile: {
      id: 'profile-demo-host',
      intro: 'Looking for easy chemistry, good conversation, and fun plans.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Bengaluru',
      hometown: 'Kolkata',
      workTitle: 'Product Designer',
      workPlace: 'VibePass',
      education: 'IIT Kharagpur',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-demo-host-1',
        promptId: 'prompt-perfect-night',
        answer: 'Street food, good music, and seeing where the night goes.',
      },
      {
        id: 'prompt-answer-demo-host-2',
        promptId: 'prompt-voice-call',
        answer: 'A quick hello, a little teasing, and zero pressure.',
      },
    ],
    seedPosts: [
      {
        id: 'post-demo-host-1',
        content:
          'Built a cleaner live feed today. Rewarding myself with coffee and a very loud playlist.',
        imageUrl:
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'post-demo-host-2',
        content:
          'If someone sends you a playlist instead of a dry hello, that already feels like effort.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-maya',
    email: 'maya@vibepass.app',
    username: 'maya-rays',
    age: 23,
    pronouns: 'she/her',
    interests: ['Art', 'Travel', 'Music', 'Books'],
    conversationIntent: 'deep-talk',
    voiceComfort: 'open',
    bio: 'Museum dates, long walks, and tiny cafes.',
    profile: {
      id: 'profile-maya',
      intro: 'I love soft-spoken people with good stories and great playlists.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Mumbai',
      hometown: 'Pune',
      workTitle: 'Illustrator',
      workPlace: 'Freelance',
      education: 'JJ School of Art',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-maya-1',
        promptId: 'prompt-green-flag',
        answer: 'Someone who listens first and asks thoughtful follow-ups.',
      },
      {
        id: 'prompt-answer-maya-2',
        promptId: 'prompt-perfect-night',
        answer: 'A gallery date, ramen after, and walking home with one earbud each.',
      },
    ],
    seedPosts: [
      {
        id: 'post-maya-1',
        content:
          'Tell me your most chaotic travel story and I will rate it out of 10.',
        imageUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'post-maya-2',
        content:
          'Green flag energy is when someone remembers the small detail from your first conversation.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-noah',
    email: 'noah@vibepass.app',
    username: 'noah.codes',
    age: 26,
    pronouns: 'he/him',
    interests: ['Gaming', 'Tech', 'Music', 'Coffee'],
    conversationIntent: 'friendship',
    voiceComfort: 'comfortable',
    bio: 'Always down for late-night ideas and co-op games.',
    profile: {
      id: 'profile-noah',
      intro: 'I like clever banter, clean UIs, and a really good espresso.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Hyderabad',
      hometown: 'Chennai',
      workTitle: 'Frontend Engineer',
      workPlace: 'Remote',
      education: 'Anna University',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-noah-1',
        promptId: 'prompt-voice-call',
        answer: 'Ten minutes, playful energy, and one terrible joke minimum.',
      },
    ],
    seedPosts: [
      {
        id: 'post-noah-1',
        content:
          'Need new co-op game recommendations that do not destroy friendships.',
        imageUrl: null,
      },
      {
        id: 'post-noah-2',
        content:
          'A good interface is just flirting with your future self.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-lina',
    email: 'lina@vibepass.app',
    username: 'lina.afterglow',
    age: 22,
    pronouns: 'she/her',
    interests: ['Food', 'Travel', 'Photography', 'Music'],
    conversationIntent: 'flirting',
    voiceComfort: 'open',
    bio: 'Sunset walks, ramen runs, and camera roll chaos.',
    profile: {
      id: 'profile-lina',
      intro: 'I enjoy people who can flirt and laugh without trying too hard.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Delhi',
      hometown: 'Jaipur',
      workTitle: 'Content Creator',
      workPlace: 'Studio Nine',
      education: 'Delhi University',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-lina-1',
        promptId: 'prompt-perfect-night',
        answer: 'Late dinner, rooftop air, and pretending we are not people-watching.',
      },
      {
        id: 'prompt-answer-lina-2',
        promptId: 'prompt-voice-call',
        answer: 'Playful teasing first, serious stuff later if the vibe earns it.',
      },
    ],
    seedPosts: [
      {
        id: 'post-lina-1',
        content:
          'Best first date food: ramen, tacos, or coffee and dessert?',
        imageUrl:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      },
    ],
  }),
  defineUser({
    id: 'user-ryan',
    email: 'ryan@vibepass.app',
    username: 'ryan.midnight',
    age: 25,
    pronouns: 'he/him',
    interests: ['Books', 'Fitness', 'Podcasts', 'Travel'],
    conversationIntent: 'friendship',
    voiceComfort: 'prefer-text',
    bio: 'Gym first, bookstores second, playlists always.',
    profile: {
      id: 'profile-ryan',
      intro: 'Good communication and consistency are top-tier.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: false,
      currentCity: 'Bengaluru',
      hometown: 'Lucknow',
      workTitle: 'Growth Analyst',
      workPlace: 'Northstar',
      education: 'Christ University',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-ryan-1',
        promptId: 'prompt-green-flag',
        answer: 'Consistency. If your energy is stable, I notice quickly.',
      },
    ],
    seedPosts: [
      {
        id: 'post-ryan-1',
        content:
          'Bookstore dates should count as cardio if we wander for two hours.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-ava',
    email: 'ava@vibepass.app',
    username: 'ava.neon',
    age: 24,
    pronouns: 'she/her',
    interests: ['Design', 'Music', 'Nightlife', 'Travel'],
    conversationIntent: 'fun-chat',
    voiceComfort: 'open',
    bio: 'Neon signs, late dinners, and direct energy.',
    profile: {
      id: 'profile-ava',
      intro: 'I like people who flirt with confidence and text with clarity.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Goa',
      hometown: 'Panaji',
      workTitle: 'Brand Strategist',
      workPlace: 'Signal House',
      education: 'NIFT',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-ava-1',
        promptId: 'prompt-perfect-night',
        answer: 'Cocktails, city lights, and no rigid plan after midnight.',
      },
    ],
    seedPosts: [
      {
        id: 'post-ava-1',
        content:
          'If the playlist is bad, the vibe is already under review.',
        imageUrl: null,
      },
      {
        id: 'post-ava-2',
        content:
          'A little confidence goes a long way, but arrogance kills the room.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-ethan',
    email: 'ethan@vibepass.app',
    username: 'ethan.loops',
    age: 27,
    pronouns: 'he/him',
    interests: ['Music', 'Startups', 'Running', 'Coffee'],
    conversationIntent: 'deep-talk',
    voiceComfort: 'comfortable',
    bio: 'Runs on black coffee and unfinished voice notes.',
    profile: {
      id: 'profile-ethan',
      intro: 'Tell me what you are building or what is healing you lately.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Pune',
      hometown: 'Nagpur',
      workTitle: 'Founder',
      workPlace: 'Loop Labs',
      education: 'BITS Pilani',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-ethan-1',
        promptId: 'prompt-green-flag',
        answer: 'Self-awareness without self-importance.',
      },
    ],
    seedPosts: [
      {
        id: 'post-ethan-1',
        content:
          'Normalize asking better questions instead of performing coolness.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-kiara',
    email: 'kiara@vibepass.app',
    username: 'kiara.canvas',
    age: 23,
    pronouns: 'she/her',
    interests: ['Art', 'Film', 'Poetry', 'Travel'],
    conversationIntent: 'deep-talk',
    voiceComfort: 'prefer-text',
    bio: 'Collects film stills and unfinished poems.',
    profile: {
      id: 'profile-kiara',
      intro: 'Quiet chemistry still counts as chemistry.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: false,
      currentCity: 'Kolkata',
      hometown: 'Shillong',
      workTitle: 'Visual Storyteller',
      workPlace: 'Frame Journal',
      education: 'St. Xavier\'s',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-kiara-1',
        promptId: 'prompt-perfect-night',
        answer: 'Old cinema, tea after, and one honest conversation.',
      },
    ],
    seedPosts: [
      {
        id: 'post-kiara-1',
        content:
          'A beautiful sentence can pull me in faster than a polished selfie.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-arjun',
    email: 'arjun@vibepass.app',
    username: 'arjun.afterhours',
    age: 26,
    pronouns: 'he/him',
    interests: ['Travel', 'Food', 'Fitness', 'Music'],
    conversationIntent: 'casual-dating',
    voiceComfort: 'open',
    bio: 'Weekend flights, weekday discipline.',
    profile: {
      id: 'profile-arjun',
      intro: 'Good banter and good food usually solve the first-date nerves.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Bengaluru',
      hometown: 'Ahmedabad',
      workTitle: 'Consultant',
      workPlace: 'Stride',
      education: 'IIM Indore',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-arjun-1',
        promptId: 'prompt-voice-call',
        answer: 'Light, quick, and enough to know if the vibe is real.',
      },
    ],
    seedPosts: [
      {
        id: 'post-arjun-1',
        content:
          'People who can choose the restaurant quickly are underrated.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-sana',
    email: 'sana@vibepass.app',
    username: 'sana.sunrise',
    age: 22,
    pronouns: 'she/her',
    interests: ['Wellness', 'Books', 'Travel', 'Tea'],
    conversationIntent: 'friendship',
    voiceComfort: 'comfortable',
    bio: 'Morning person with a soft spot for bookstores.',
    profile: {
      id: 'profile-sana',
      intro: 'Kindness reads louder than charisma to me.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Jaipur',
      hometown: 'Bhopal',
      workTitle: 'Psychology Student',
      workPlace: 'University',
      education: 'University of Rajasthan',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-sana-1',
        promptId: 'prompt-green-flag',
        answer: 'Gentle honesty. I trust people who are warm and direct.',
      },
    ],
    seedPosts: [
      {
        id: 'post-sana-1',
        content:
          'Tea, a corner table, and someone who asks follow-up questions is enough.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-leo',
    email: 'leo@vibepass.app',
    username: 'leo.latte',
    age: 25,
    pronouns: 'he/him',
    interests: ['Coffee', 'Design', 'Cycling', 'Food'],
    conversationIntent: 'fun-chat',
    voiceComfort: 'comfortable',
    bio: 'Can absolutely judge a cafe by the playlist.',
    profile: {
      id: 'profile-leo',
      intro: 'I get along with people who enjoy teasing and trying new spots.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Chandigarh',
      hometown: 'Amritsar',
      workTitle: 'Cafe Owner',
      workPlace: 'Drip Theory',
      education: 'Punjab University',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-leo-1',
        promptId: 'prompt-perfect-night',
        answer: 'Scooter ride, dessert stop, and no one checking the time.',
      },
    ],
    seedPosts: [
      {
        id: 'post-leo-1',
        content:
          'Croissant rankings are relationship-defining information, honestly.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-nina',
    email: 'nina@vibepass.app',
    username: 'nina.skylines',
    age: 24,
    pronouns: 'she/her',
    interests: ['Architecture', 'Photography', 'Travel', 'Music'],
    conversationIntent: 'deep-talk',
    voiceComfort: 'open',
    bio: 'Chases skylines and meaningful eye contact.',
    profile: {
      id: 'profile-nina',
      intro: 'If you can notice beauty without making a performance out of it, I notice.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Mumbai',
      hometown: 'Surat',
      workTitle: 'Architect',
      workPlace: 'Lineform',
      education: 'CEPT',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-nina-1',
        promptId: 'prompt-green-flag',
        answer: 'Curiosity without interrogation. Just easy attention.',
      },
    ],
    seedPosts: [
      {
        id: 'post-nina-1',
        content:
          'Some cities flirt with you better than some people do.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-omar',
    email: 'omar@vibepass.app',
    username: 'omar.echoes',
    age: 27,
    pronouns: 'he/him',
    interests: ['Podcasts', 'Books', 'Tech', 'Film'],
    conversationIntent: 'friendship',
    voiceComfort: 'prefer-text',
    bio: 'Sends thoughtful replies and long podcast recs.',
    profile: {
      id: 'profile-omar',
      intro: 'I like people who make room for nuance.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: false,
      currentCity: 'Hyderabad',
      hometown: 'Kochi',
      workTitle: 'Researcher',
      workPlace: 'Signal Lab',
      education: 'University of Hyderabad',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-omar-1',
        promptId: 'prompt-green-flag',
        answer: 'Patience. Fast reactions impress me less than thoughtful ones.',
      },
    ],
    seedPosts: [
      {
        id: 'post-omar-1',
        content:
          'Thoughtful texts beat chaotic chemistry every single time for me.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-tara',
    email: 'tara@vibepass.app',
    username: 'tara.weekend',
    age: 23,
    pronouns: 'she/her',
    interests: ['Travel', 'Brunch', 'Fitness', 'Music'],
    conversationIntent: 'casual-dating',
    voiceComfort: 'open',
    bio: 'Weekend plans are my love language.',
    profile: {
      id: 'profile-tara',
      intro: 'I am easygoing, but I still love intentional effort.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Pune',
      hometown: 'Indore',
      workTitle: 'Fitness Coach',
      workPlace: 'Studio Form',
      education: 'Symbiosis',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-tara-1',
        promptId: 'prompt-voice-call',
        answer: 'If we can laugh in the first five minutes, we are good.',
      },
    ],
    seedPosts: [
      {
        id: 'post-tara-1',
        content:
          'Brunch opinions are a compatibility filter and I stand by that.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-kabir',
    email: 'kabir@vibepass.app',
    username: 'kabir.northstar',
    age: 26,
    pronouns: 'he/him',
    interests: ['Travel', 'Photography', 'Startups', 'Food'],
    conversationIntent: 'fun-chat',
    voiceComfort: 'comfortable',
    bio: 'Half road-trip planner, half over-thinker.',
    profile: {
      id: 'profile-kabir',
      intro: 'A sense of humor plus emotional fluency is unfairly attractive.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Delhi',
      hometown: 'Udaipur',
      workTitle: 'Photographer',
      workPlace: 'Northstar Stories',
      education: 'MICA',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-kabir-1',
        promptId: 'prompt-perfect-night',
        answer: 'Long drive, roadside chai, and a camera in the passenger seat.',
      },
    ],
    seedPosts: [
      {
        id: 'post-kabir-1',
        content:
          'Road trips reveal everything: patience, music taste, and snack priorities.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-zoya',
    email: 'zoya@vibepass.app',
    username: 'zoya.frames',
    age: 24,
    pronouns: 'she/her',
    interests: ['Photography', 'Film', 'Coffee', 'Books'],
    conversationIntent: 'deep-talk',
    voiceComfort: 'comfortable',
    bio: 'Will absolutely notice the light hitting your face.',
    profile: {
      id: 'profile-zoya',
      intro: 'Soft attention is still attention. I like people who get that.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Kolkata',
      hometown: 'Srinagar',
      workTitle: 'Photographer',
      workPlace: 'Freelance',
      education: 'Jadavpur University',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-zoya-1',
        promptId: 'prompt-green-flag',
        answer: 'Gentle confidence. I trust people who do not force a persona.',
      },
    ],
    seedPosts: [
      {
        id: 'post-zoya-1',
        content:
          'The best portraits happen right after someone stops trying too hard.',
        imageUrl: null,
      },
    ],
  }),
  defineUser({
    id: 'user-mia',
    email: 'mia@vibepass.app',
    username: 'mia.monsoon',
    age: 22,
    pronouns: 'she/her',
    interests: ['Music', 'Food', 'Travel', 'Poetry'],
    conversationIntent: 'flirting',
    voiceComfort: 'open',
    bio: 'Rain playlists and dangerous dessert recommendations.',
    profile: {
      id: 'profile-mia',
      intro: 'If you can flirt and still be kind, that gets my attention.',
      profilePhotoUrl:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
      voiceOpen: true,
      currentCity: 'Chennai',
      hometown: 'Kochi',
      workTitle: 'Copywriter',
      workPlace: 'Monsoon Studio',
      education: 'Loyola College',
    },
    promptAnswers: [
      {
        id: 'prompt-answer-mia-1',
        promptId: 'prompt-voice-call',
        answer: 'If the energy is fun, I can talk for way longer than planned.',
      },
    ],
    seedPosts: [
      {
        id: 'post-mia-1',
        content:
          'Dessert after dinner should never be treated like an optional add-on.',
        imageUrl: null,
      },
    ],
  }),
];

const POSTS = SEED_USERS.flatMap(user =>
  user.seedPosts.map(post => ({
    ...post,
    userId: user.id,
  })),
);

const POST_LIKES = [
  ['post-demo-host-1', 'user-maya'],
  ['post-demo-host-1', 'user-noah'],
  ['post-demo-host-2', 'user-lina'],
  ['post-maya-1', 'user-demo-host'],
  ['post-maya-1', 'user-kiara'],
  ['post-maya-2', 'user-zoya'],
  ['post-noah-1', 'user-ryan'],
  ['post-noah-2', 'user-ethan'],
  ['post-lina-1', 'user-ava'],
  ['post-ryan-1', 'user-sana'],
  ['post-ava-1', 'user-demo-host'],
  ['post-ethan-1', 'user-ava'],
  ['post-kiara-1', 'user-zoya'],
  ['post-arjun-1', 'user-tara'],
  ['post-sana-1', 'user-mia'],
  ['post-leo-1', 'user-lina'],
  ['post-nina-1', 'user-kabir'],
  ['post-omar-1', 'user-sana'],
  ['post-tara-1', 'user-arjun'],
  ['post-kabir-1', 'user-demo-host'],
  ['post-zoya-1', 'user-kiara'],
  ['post-mia-1', 'user-lina'],
];

const POST_COMMENTS = [
  {
    id: 'comment-demo-host-1',
    postId: 'post-demo-host-1',
    userId: 'user-maya',
    content: 'Street food plus playlists is a top-tier combo.',
  },
  {
    id: 'comment-demo-host-2',
    postId: 'post-demo-host-2',
    userId: 'user-lina',
    content: 'A playlist hello is immediately better than “hey”.',
  },
  {
    id: 'comment-maya-1',
    postId: 'post-maya-1',
    userId: 'user-demo-host',
    content: 'Missed a flight in Lisbon because I chased a bakery recommendation.',
  },
  {
    id: 'comment-noah-1',
    postId: 'post-noah-1',
    userId: 'user-ethan',
    content: 'Helldivers will test the bond and the patience.',
  },
  {
    id: 'comment-lina-1',
    postId: 'post-lina-1',
    userId: 'user-mia',
    content: 'Ramen if the flirting is good, dessert if the banter is better.',
  },
  {
    id: 'comment-ava-1',
    postId: 'post-ava-1',
    userId: 'user-demo-host',
    content: 'Strongly agree. The aux cord says a lot about someone.',
  },
  {
    id: 'comment-sana-1',
    postId: 'post-sana-1',
    userId: 'user-kiara',
    content: 'This sounds like emotional luxury, honestly.',
  },
  {
    id: 'comment-kabir-1',
    postId: 'post-kabir-1',
    userId: 'user-noah',
    content: 'Snack priorities are non-negotiable data.',
  },
];

const POST_SHARES = [
  {
    id: 'share-demo-host-1',
    originalPostId: 'post-demo-host-1',
    sharedByUserId: 'user-lina',
  },
  {
    id: 'share-maya-1',
    originalPostId: 'post-maya-2',
    sharedByUserId: 'user-zoya',
  },
  {
    id: 'share-noah-1',
    originalPostId: 'post-noah-2',
    sharedByUserId: 'user-demo-host',
  },
  {
    id: 'share-ava-1',
    originalPostId: 'post-ava-2',
    sharedByUserId: 'user-mia',
  },
];

const CHATS = [
  {
    id: 'chat-demo-maya',
    user1Id: 'user-demo-host',
    user2Id: 'user-maya',
    status: 'active',
    messages: [
      {
        id: 'message-demo-maya-1',
        senderId: 'user-maya',
        content: 'Your playlist line made me curious. What is currently on repeat?',
      },
      {
        id: 'message-demo-maya-2',
        senderId: 'user-demo-host',
        content: 'A lot of indie pop and one deeply embarrassing throwback anthem.',
      },
      {
        id: 'message-demo-maya-3',
        senderId: 'user-maya',
        content: 'Embarrassing throwbacks are honestly a green flag.',
      },
    ],
    connectionLabel: 'Great vibe',
  },
  {
    id: 'chat-demo-noah',
    user1Id: 'user-demo-host',
    user2Id: 'user-noah',
    status: 'active',
    messages: [
      {
        id: 'message-demo-noah-1',
        senderId: 'user-noah',
        content: 'If you want co-op chaos later, I have three excellent bad ideas.',
      },
      {
        id: 'message-demo-noah-2',
        senderId: 'user-demo-host',
        content: 'As long as the ideas come with snacks and zero ranked mode.',
      },
    ],
    connectionLabel: 'Late night ideas',
  },
  {
    id: 'chat-demo-lina',
    user1Id: 'user-demo-host',
    user2Id: 'user-lina',
    status: 'active',
    messages: [
      {
        id: 'message-demo-lina-1',
        senderId: 'user-lina',
        content: 'Serious question: ramen or tacos if the flirting is working?',
      },
      {
        id: 'message-demo-lina-2',
        senderId: 'user-demo-host',
        content: 'Ramen first, tacos on the second date if we survive the first one.',
      },
    ],
    connectionLabel: 'Playful energy',
  },
  {
    id: 'chat-demo-arjun',
    user1Id: 'user-demo-host',
    user2Id: 'user-arjun',
    status: 'active',
    messages: [
      {
        id: 'message-demo-arjun-1',
        senderId: 'user-arjun',
        content: 'Be honest: are you a spontaneous plan person or a calendar flirt?',
      },
      {
        id: 'message-demo-arjun-2',
        senderId: 'user-demo-host',
        content: 'Somewhere in the middle. Planned enough to be smooth, open enough to be fun.',
      },
    ],
    connectionLabel: 'Fast banter',
  },
  {
    id: 'chat-zoe-leo',
    user1Id: 'user-zoya',
    user2Id: 'user-leo',
    status: 'active',
    messages: [
      {
        id: 'message-zoe-leo-1',
        senderId: 'user-zoya',
        content: 'Best cafe lighting in the city, go.',
      },
      {
        id: 'message-zoe-leo-2',
        senderId: 'user-leo',
        content: 'I have three answers and one of them has terrible pastries.',
      },
    ],
    connectionLabel: 'Cafe scouting',
  },
];

const VOICE_SESSIONS = [
  {
    id: 'voice-demo-lina-request',
    user1Id: 'user-lina',
    user2Id: 'user-demo-host',
    chatId: 'chat-demo-lina',
    status: 'requested',
  },
];

const NOTIFICATIONS = [
  {
    id: 'notification-match-demo',
    userId: 'user-demo-host',
    actorId: 'user-maya',
    type: 'NEW_MATCH',
    targetId: 'chat-demo-maya',
    targetType: 'chat',
    read: false,
    data: JSON.stringify({
      actionUrl: '/chat/chat-demo-maya',
      chatId: 'chat-demo-maya',
    }),
  },
  {
    id: 'notification-message-demo',
    userId: 'user-demo-host',
    actorId: 'user-noah',
    type: 'NEW_MESSAGE',
    targetId: 'chat-demo-noah',
    targetType: 'chat',
    read: false,
    data: JSON.stringify({
      actionUrl: '/chat/chat-demo-noah',
      preview: 'If you want co-op chaos later, I have three excellent bad ideas.',
    }),
  },
  {
    id: 'notification-like-demo',
    userId: 'user-demo-host',
    actorId: 'user-maya',
    type: 'LIKE_POST',
    targetId: 'post-demo-host-1',
    targetType: 'post',
    read: true,
    data: JSON.stringify({
      actionUrl: '/feed?post=post-demo-host-1',
    }),
  },
  {
    id: 'notification-comment-demo',
    userId: 'user-demo-host',
    actorId: 'user-lina',
    type: 'COMMENT_POST',
    targetId: 'post-demo-host-2',
    targetType: 'post',
    read: false,
    data: JSON.stringify({
      actionUrl: '/feed?post=post-demo-host-2',
    }),
  },
  {
    id: 'notification-share-demo',
    userId: 'user-demo-host',
    actorId: 'user-lina',
    type: 'SHARE_POST',
    targetId: 'post-demo-host-1',
    targetType: 'post',
    read: true,
    data: JSON.stringify({
      actionUrl: '/feed?post=post-demo-host-1',
    }),
  },
  {
    id: 'notification-voice-demo',
    userId: 'user-demo-host',
    actorId: 'user-lina',
    type: 'VOICE_REQUEST',
    targetId: 'chat-demo-lina',
    targetType: 'chat',
    read: false,
    data: JSON.stringify({
      actionUrl: '/chat/chat-demo-lina',
      chatId: 'chat-demo-lina',
    }),
  },
  {
    id: 'notification-profile-demo',
    userId: 'user-demo-host',
    actorId: 'user-zoya',
    type: 'PROFILE_VIEW',
    targetId: 'vibehost',
    targetType: 'profile',
    read: true,
    data: JSON.stringify({
      actionUrl: '/profile/vibehost',
    }),
  },
];

const ROOM_USERS = [
  ['room-night-owls', 'user-demo-host'],
  ['room-night-owls', 'user-maya'],
  ['room-night-owls', 'user-ava'],
  ['room-night-owls', 'user-mia'],
  ['room-deep-talk', 'user-noah'],
  ['room-deep-talk', 'user-kiara'],
  ['room-deep-talk', 'user-omar'],
  ['room-deep-talk', 'user-zoya'],
  ['room-voice-cafe', 'user-lina'],
  ['room-voice-cafe', 'user-arjun'],
  ['room-voice-cafe', 'user-sana'],
  ['room-voice-cafe', 'user-leo'],
];

async function seedLookups() {
  const moods = [
    {
      id: 'mood-bored',
      name: 'bored',
      emoji: '??',
      description: 'Feeling bored',
      color: 'from-gray-500 to-slate-600',
      category: 'social',
    },
    {
      id: 'mood-lonely',
      name: 'lonely',
      emoji: '??',
      description: 'Feeling lonely',
      color: 'from-blue-400 to-indigo-600',
      category: 'social',
    },
    {
      id: 'mood-curious',
      name: 'curious',
      emoji: '??',
      description: 'Curious about people',
      color: 'from-purple-400 to-pink-600',
      category: 'social',
    },
    {
      id: 'mood-want-friends',
      name: 'want-friends',
      emoji: '??',
      description: 'Want to make friends',
      color: 'from-green-400 to-emerald-600',
      category: 'social',
    },
    {
      id: 'mood-deep-talk',
      name: 'deep-talk',
      emoji: '??',
      description: 'Deep conversations',
      color: 'from-indigo-400 to-purple-600',
      category: 'social',
    },
    {
      id: 'mood-soft-energy',
      name: 'soft-energy',
      emoji: '??',
      description: 'Soft, calm energy',
      color: 'from-teal-400 to-cyan-600',
      category: 'social',
    },
    {
      id: 'mood-fun-chat',
      name: 'fun-chat',
      emoji: '??',
      description: 'Fun and light chat',
      color: 'from-yellow-400 to-orange-500',
      category: 'social',
    },
    {
      id: 'mood-flirting',
      name: 'flirting',
      emoji: '??',
      description: 'Flirty vibes',
      color: 'from-pink-400 to-rose-600',
      category: 'social',
    },
    {
      id: 'mood-music-talk',
      name: 'music-talk',
      emoji: '??',
      description: 'Talk about music',
      color: 'from-violet-400 to-fuchsia-600',
      category: 'social',
    },
    {
      id: 'mood-need-advice',
      name: 'need-advice',
      emoji: '??',
      description: 'Need advice',
      color: 'from-amber-400 to-yellow-600',
      category: 'support',
    },
    {
      id: 'mood-overthinking',
      name: 'overthinking',
      emoji: '??',
      description: 'Overthinking things',
      color: 'from-red-400 to-pink-600',
      category: 'support',
    },
    {
      id: 'mood-study-buddy',
      name: 'study-buddy',
      emoji: '??',
      description: 'Study buddy',
      color: 'from-sky-400 to-blue-600',
      category: 'support',
    },
    {
      id: 'mood-casual-vibes',
      name: 'casual-vibes',
      emoji: '??',
      description: 'Casual vibes',
      color: 'from-orange-400 to-red-500',
      category: 'dating',
    },
    {
      id: 'mood-adventurous-night',
      name: 'adventurous-night',
      emoji: '??',
      description: 'Adventurous night',
      color: 'from-purple-500 to-indigo-600',
      category: 'dating',
    },
    {
      id: 'mood-flirty-energy',
      name: 'flirty-energy',
      emoji: '??',
      description: 'Flirty energy',
      color: 'from-rose-400 to-pink-600',
      category: 'dating',
    },
    {
      id: 'mood-short-term-fun',
      name: 'short-term-fun',
      emoji: '?',
      description: 'Short-term fun',
      color: 'from-lime-400 to-green-600',
      category: 'dating',
    },
  ];

  const intents = [
    ['intent-deep-talk', 'deep-talk', 'Deep conversations', '??', false],
    ['intent-fun-chat', 'fun-chat', 'Fun and light chat', '??', false],
    ['intent-friendship', 'friendship', 'Make friends', '??', false],
    ['intent-flirting', 'flirting', 'Flirty vibes', '??', false],
    ['intent-casual-dating', 'casual-dating', 'Casual dating', '??', true],
    ['intent-hookups', 'hookups', 'Hookups', '??', true],
    ['intent-fwb', 'fwb', 'Friends with benefits', '??', true],
    ['intent-short-term', 'short-term', 'Short-term relationships', '?', true],
  ];

  const prompts = [
    {
      id: 'prompt-perfect-night',
      text: 'Describe your perfect spontaneous night out.',
      type: 'icebreaker',
      category: 'social',
      difficulty: 'easy',
      isActive: true,
      isDaily: false,
    },
    {
      id: 'prompt-green-flag',
      text: 'What is a green flag that instantly makes you trust someone more?',
      type: 'values',
      category: 'connection',
      difficulty: 'medium',
      isActive: true,
      isDaily: false,
    },
    {
      id: 'prompt-voice-call',
      text: 'What kind of first voice call feels natural to you?',
      type: 'voice',
      category: 'voice',
      difficulty: 'easy',
      isActive: true,
      isDaily: false,
    },
  ];

  const rooms = [
    {
      id: 'room-night-owls',
      name: 'Night Owls',
      description: 'Late-night chats for people who come alive after dark.',
      promptId: 'prompt-perfect-night',
      theme: 'late-night',
      isVoice: false,
    },
    {
      id: 'room-deep-talk',
      name: 'Deep Talk Lounge',
      description: 'Thoughtful prompts and meaningful one-on-one energy.',
      promptId: 'prompt-green-flag',
      theme: 'deep-talk',
      isVoice: false,
    },
    {
      id: 'room-voice-cafe',
      name: 'Voice Cafe',
      description: 'Warm intros for people open to short voice chats.',
      promptId: 'prompt-voice-call',
      theme: 'voice',
      isVoice: true,
    },
  ];

  for (const mood of moods) {
    await prisma.mood.upsert({
      where: { id: mood.id },
      update: mood,
      create: mood,
    });
  }

  for (const [id, name, description, icon, isCasual] of intents) {
    await prisma.conversationIntent.upsert({
      where: { id },
      update: { name, description, icon, isCasual },
      create: { id, name, description, icon, isCasual },
    });
  }

  for (const prompt of prompts) {
    await prisma.prompt.upsert({
      where: { id: prompt.id },
      update: prompt,
      create: prompt,
    });
  }

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: room,
      create: room,
    });
  }
}

async function seedUsers() {
  for (const user of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        age: user.age,
        pronouns: user.pronouns,
        interests: user.interests,
        conversationIntent: user.conversationIntent,
        voiceComfort: user.voiceComfort,
        bio: user.bio,
        passwordHash: hashPassword(DEMO_PASSWORD, user.username),
        language: 'en',
        timezone: 'Asia/Kolkata',
        trustScore: 100,
        isSuspended: false,
        isBanned: false,
      },
      create: {
        id: user.id,
        email: user.email,
        username: user.username,
        age: user.age,
        pronouns: user.pronouns,
        interests: user.interests,
        conversationIntent: user.conversationIntent,
        voiceComfort: user.voiceComfort,
        bio: user.bio,
        passwordHash: hashPassword(DEMO_PASSWORD, user.username),
        language: 'en',
        timezone: 'Asia/Kolkata',
        trustScore: 100,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        intro: user.profile.intro,
        profilePhotoUrl: user.profile.profilePhotoUrl,
        coverPhotoUrl: user.profile.coverPhotoUrl,
        pronouns: user.pronouns,
        interests: user.profile.interests,
        voiceOpen: user.profile.voiceOpen,
        currentCity: user.profile.currentCity,
        hometown: user.profile.hometown,
        workTitle: user.profile.workTitle,
        workPlace: user.profile.workPlace,
        education: user.profile.education,
      },
      create: {
        ...user.profile,
        userId: user.id,
        pronouns: user.pronouns,
      },
    });

    await prisma.badge.upsert({
      where: { id: `badge-${user.id}-early` },
      update: {
        badgeType: 'early-adopter',
        count: 1,
      },
      create: {
        id: `badge-${user.id}-early`,
        userId: user.id,
        badgeType: 'early-adopter',
        count: 1,
      },
    });

    if (user.profile.voiceOpen) {
      await prisma.badge.upsert({
        where: { id: `badge-${user.id}-voice` },
        update: {
          badgeType: 'voice-open',
          count: 1,
        },
        create: {
          id: `badge-${user.id}-voice`,
          userId: user.id,
          badgeType: 'voice-open',
          count: 1,
        },
      });
    }

    for (const answer of user.promptAnswers) {
      await prisma.promptAnswer.upsert({
        where: {
          userId_promptId: {
            userId: user.id,
            promptId: answer.promptId,
          },
        },
        update: { answer: answer.answer },
        create: {
          id: answer.id,
          userId: user.id,
          promptId: answer.promptId,
          answer: answer.answer,
        },
      });
    }
  }
}

async function seedSocialData() {
  for (const post of POSTS) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {
        userId: post.userId,
        content: post.content,
        imageUrl: post.imageUrl,
      },
      create: {
        id: post.id,
        userId: post.userId,
        content: post.content,
        imageUrl: post.imageUrl,
      },
    });
  }

  for (const [postId, userId] of POST_LIKES) {
    await prisma.postLike.upsert({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
      update: {},
      create: {
        id: `like-${postId}-${userId}`,
        postId,
        userId,
      },
    });
  }

  for (const comment of POST_COMMENTS) {
    await prisma.postComment.upsert({
      where: { id: comment.id },
      update: {
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
      },
      create: comment,
    });
  }

  for (const share of POST_SHARES) {
    await prisma.postShare.upsert({
      where: { id: share.id },
      update: {
        originalPostId: share.originalPostId,
        sharedByUserId: share.sharedByUserId,
      },
      create: share,
    });
  }

  for (const post of POSTS) {
    const [likesCount, commentsCount, sharesCount] = await prisma.$transaction([
      prisma.postLike.count({ where: { postId: post.id } }),
      prisma.postComment.count({ where: { postId: post.id } }),
      prisma.postShare.count({ where: { originalPostId: post.id } }),
    ]);

    await prisma.post.update({
      where: { id: post.id },
      data: {
        likesCount,
        commentsCount,
        sharesCount,
      },
    });
  }
}

async function seedChats() {
  for (const chat of CHATS) {
    await prisma.chat.upsert({
      where: { id: chat.id },
      update: {
        user1Id: chat.user1Id,
        user2Id: chat.user2Id,
        status: chat.status,
        roomId: null,
        archivedAt: null,
        endedAt: null,
      },
      create: {
        id: chat.id,
        user1Id: chat.user1Id,
        user2Id: chat.user2Id,
        status: chat.status,
      },
    });

    for (const message of chat.messages) {
      await prisma.message.upsert({
        where: { id: message.id },
        update: {
          chatId: chat.id,
          senderId: message.senderId,
          content: message.content,
        },
        create: {
          id: message.id,
          chatId: chat.id,
          senderId: message.senderId,
          content: message.content,
        },
      });
    }

    await prisma.savedConnection.upsert({
      where: {
        user1Id_user2Id: {
          user1Id: chat.user1Id,
          user2Id: chat.user2Id,
        },
      },
      update: {
        chatId: chat.id,
        label: chat.connectionLabel,
      },
      create: {
        id: `connection-${chat.id}`,
        user1Id: chat.user1Id,
        user2Id: chat.user2Id,
        chatId: chat.id,
        label: chat.connectionLabel,
      },
    });
  }
}

async function seedVoiceData() {
  for (const session of VOICE_SESSIONS) {
    await prisma.voiceSession.upsert({
      where: { id: session.id },
      update: {
        user1Id: session.user1Id,
        user2Id: session.user2Id,
        chatId: session.chatId,
        status: session.status,
      },
      create: session,
    });
  }
}

async function seedNotifications() {
  for (const notification of NOTIFICATIONS) {
    await prisma.notification.upsert({
      where: { id: notification.id },
      update: {
        userId: notification.userId,
        actorId: notification.actorId,
        type: notification.type,
        targetId: notification.targetId,
        targetType: notification.targetType,
        read: notification.read,
        data: notification.data,
      },
      create: notification,
    });
  }
}

async function seedRooms() {
  for (const [roomId, userId] of ROOM_USERS) {
    await prisma.roomUser.upsert({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      update: {
        leftAt: null,
      },
      create: {
        id: randomUUID(),
        roomId,
        userId,
      },
    });
  }
}

async function main() {
  console.log('Seeding VibePass demo data...');
  await seedLookups();
  await seedUsers();
  await seedSocialData();
  await seedChats();
  await seedVoiceData();
  await seedNotifications();
  await seedRooms();

  const summary = {
    users: await prisma.user.count(),
    profiles: await prisma.profile.count(),
    posts: await prisma.post.count(),
    chats: await prisma.chat.count(),
    messages: await prisma.message.count(),
    notifications: await prisma.notification.count(),
    promptAnswers: await prisma.promptAnswer.count(),
    savedConnections: await prisma.savedConnection.count(),
    roomUsers: await prisma.roomUser.count(),
    voiceSessions: await prisma.voiceSession.count(),
  };

  console.log('Demo seed complete.');
  console.log('Demo login: demo@vibepass.app / password123');
  console.log('Seed summary:', summary);
}

main()
  .catch(async error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
