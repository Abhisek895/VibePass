import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/common/utils/crypto.util';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'Aiden', 'Sophia', 'Liam', 'Olivia', 'Noah', 'Emma', 'Jackson', 'Ava', 'Lucas', 'Mia',
  'Ethan', 'Isabella', 'Mason', 'Riley', 'Caden', 'Aria', 'Oliver', 'Zoe', 'Elijah', 'Lily',
  'Grayson', 'Layla', 'Jacob', 'Charlotte', 'Michael', 'Harper', 'Benjamin', 'Amelia', 'Carter', 'Evelyn',
  'James', 'Abigail', 'Jayden', 'Emily', 'Logan', 'Elizabeth', 'Alexander', 'Mila', 'Caleb', 'Ella',
  'Ryan', 'Avery', 'Nathan', 'Sofia', 'Isaac', 'Camila', 'Andrew', 'Aria', 'Joshua', 'Scarlett'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const CITIES = ['New York', 'Los Angeles', 'London', 'Berlin', 'Tokyo', 'Mumbai', 'Paris', 'Austin', 'Singapore', 'Melbourne'];

const INTERESTS_POOL = [
  'Music', 'Photography', 'Travel', 'Fitness', 'Art', 'Nightlife', 'Gaming', 'Coffee', 'Hiking', 'Cooking',
  'Crypto', 'Design', 'Technology', 'Reading', 'Movies', 'Fashion', 'Yoga', 'Wine', 'Dancing', 'Nature'
];

const PROMPTS = [
  "Probably at a concert or searching for the best espresso in town. Let's swap playlists.",
  "Architect by day, amateur DJ by night. I value authenticity over everything.",
  "I'm the person who takes high-quality photos of the food but forgets to eat it. Let's explore.",
  "Searching for someone who can keep up with my travel itinerary and my love for deep house.",
  "Minimalist aesthetic with a maximalist record collection. Talk to me in vinyl.",
  "On a mission to find the perfect rooftop view. Tell me your favorite hidden gem.",
  "Fitness junkie with a soft spot for late-night street food. Balance is key.",
  "Product designer obsessed with lighting and soundscapes. What are you listening to?",
  "Always planning the next weekend escape. Bonus points if you have a great book recommendation.",
  "Lover of neon lights, dark chocolate, and spontaneous road trips."
];

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6", // Man
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1", // Woman
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330", // Woman
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", // Man
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb", // Woman
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d", // Man
  "https://images.unsplash.com/photo-1517841905240-472988babdf9", // Woman
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", // Man
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df", // Woman
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce", // Man
];

async function main() {
  const password = 'Abhisek@2002';
  const hashed = hashPassword(password);
  
  console.log(`--- Seeding 50 diverse users with password: ${password} ---`);

  for (let i = 0; i < 50; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const displayName = `${firstName} ${lastName}`;
    const username = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${randomUUID().slice(0, 4)}`;
    const email = `${username}@vibepass.test`;
    
    // Random interests including Music
    const interests = ['Music'];
    while (interests.length < 4) {
      const randomInterest = INTERESTS_POOL[Math.floor(Math.random() * INTERESTS_POOL.length)];
      if (!interests.includes(randomInterest)) interests.push(randomInterest);
    }

    const age = Math.floor(Math.random() * 15) + 20; // 20-35
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const bio = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    const avatar = `${AVATAR_URLS[i % AVATAR_URLS.length]}?auto=format&fit=crop&w=800&q=80`;

    const userId = randomUUID();

    await prisma.user.create({
      data: {
        id: userId,
        email,
        username: displayName, // Using display name as username per common pattern in this DB
        passwordHash: hashed,
        age,
        bio,
        genderPreference: 'Everyone',
        interests: JSON.stringify(interests),
        profile: {
          create: {
            currentCity: city,
            intro: bio,
            profilePhotoUrl: avatar,
            coverPhotoUrl: `https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80`,
            interests: JSON.stringify(interests),
          }
        }
      }
    });

    if ((i + 1) % 10 === 0) {
      console.log(`--- Created ${i + 1} users ---`);
    }
  }

  console.log('--- Finished seeding 50 users! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
