import { PrismaClient } from '@prisma/client';
import { randomUUID, randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const USERS_DATA = [
  { name: 'Elena', username: 'elena.vibes', bio: 'Classical pianist with a secret love for heavy metal. 🎹🤘 Always down for a late-night concert.', photo: 'https://images.unsplash.com/photo-1494433588-445bbd0ad33e?q=80&w=800' },
  { name: 'Marcus', username: 'marcus_dev', bio: 'Software architect by day, urban explorer by night. Exploring the hidden corners of Tokyo.', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800' },
  { name: 'Sophia', username: 'sophia.bloom', bio: 'Flower child. 🌸 I spend most of my time in the garden or with a book in my hand.', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800' },
  { name: 'Julian', username: 'julian_chef', bio: 'Culinary artist. Cooking is my love language. Tell me your favorite spice.', photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800' },
  { name: 'Nora', username: 'nora.night', bio: 'Documentary filmmaker. Capturing stories of the streets. 🎥 Let\'s make a movie.', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800' },
  { name: 'David', username: 'david_fit', bio: 'Fitness coach and wellness advocate. Health is wealth. 🥑🏃‍♂️ Join me for a morning run?', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800' },
  { name: 'Isabella', username: 'bella.art', bio: 'Abstract painter. I see colors in everything. My studio is my happy place.', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800' },
  { name: 'Xavier', username: 'xavier.travels', bio: 'Backpacker. 60 countries and counting. 🌏 Life happens outside your comfort zone.', photo: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=800' },
  { name: 'Chloe', username: 'chloe_sun', bio: 'Yoga instructor and sunshine lover. ☀️ Spread love and light wherever you go.', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800' },
  { name: 'Liam', username: 'liam_music', bio: 'Indie musician. 🎸 My guitar is my best friend. Writing songs about life and love.', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800' },
  { name: 'Amelia', username: 'amelia.design', bio: 'Graphic designer. Minimalist at heart. 🎨 Designing the world one pixel at a time.', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800' },
  { name: 'Nathan', username: 'nathan_trek', bio: 'Mountain climber. 🏔️ If there\'s a peak, I\'m on it. Always seeking the best view.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800' },
  { name: 'Olivia', username: 'olivia.write', bio: 'Aspiring novelist. Lost in high fantasy worlds. 📖 Looking for a co-author.', photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=800' },
  { name: 'Ethan', username: 'ethan_cam', bio: 'Film photographer. ✨ Keeping film alive in a digital world. I\'ll take your portrait.', photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=800' },
  { name: 'Ava', username: 'ava.dance', bio: 'Contemporary dancer. Expressing emotions through movement. 💃 Let\'s dance.', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800' },
  { name: 'Noah', username: 'noah_surf', bio: 'Surfer and ocean lover. 🌊 Waves are my therapy. Catch you at sunrise.', photo: 'https://images.unsplash.com/photo-1492288991661-058aa541ff43?q=80&w=800' },
  { name: 'Mia', username: 'mia.yoga', bio: 'Wellness enthusiast. Mindful living. ✨ Breathing through the chaos.', photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800' },
  { name: 'Lucas', username: 'lucas.arch', bio: 'Architect. I appreciate good structure. Building the future.', photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800' },
  { name: 'Lily', username: 'lily.nature', bio: 'Nature photographer. 🌿 Finding beauty in the smallest details.', photo: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?q=80&w=800' },
  { name: 'Leo', username: 'leo.film', bio: 'Cinephile. 🎥 Watching 365 movies a year. What\'s your favorite director?', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800' },
  { name: 'Aria', username: 'aria.singer', bio: 'Jazz vocalist. 🎤 Singing my heart out in smoky bars. Coffee and vinyl.', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800' },
  { name: 'Max', username: 'max.cycle', bio: 'Cyclist. 🚲 Riding through the city streets. Two wheels, one soul.', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800' },
  { name: 'Zoe', username: 'zoe.bake', bio: 'Pastry chef. 🧁 Making the world sweeter. I probably smell like vanilla.', photo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800' },
  { name: 'Caleb', username: 'caleb.hike', bio: 'Outdoor enthusiast. 🥾 Hiking every trail I find. Let\'s get lost.', photo: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=800' },
  { name: 'Maya', username: 'maya.sketch', bio: 'Digital illustrator. ✏️ Creating characters and worlds. My iPad is my life.', photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=800' },
  { name: 'Gabriel', username: 'gabriel.tech', bio: 'Tech innovator. 🤖 Dreaming of a better future. AI and robotics.', photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=800' },
  { name: 'Layla', username: 'layla.poetry', bio: 'Spoken word poet. 🎤 Words have power. Listen to my rhythm.', photo: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=800' },
  { name: 'Damian', username: 'damian.skate', bio: 'Pro skater. 🛹 Living life on the edge. Never stop sliding.', photo: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?q=80&w=800' },
  { name: 'Stella', username: 'stella.fashion', bio: 'Fashion stylist. 👗 Personal style is your signature. Dress to impress.', photo: 'https://images.unsplash.com/photo-1481214155344-9981700968c4?q=80&w=800' },
  { name: 'Sebastian', username: 'seb.vintage', bio: 'Vintage car enthusiast. 🏎️ Restoring classics. Old is gold.', photo: 'https://images.unsplash.com/photo-1506803682981-6e718a9dd3ee?q=80&w=800' },
];

const PROMPT_TEMPLATES = [
  "My secret talent is...",
  "The best way to my heart is...",
  "My ideal first date involve...",
  "I'm looking for someone who...",
  "First thing you should know about me is...",
];

async function seed() {
  try {
    console.log('🗑️  Wiping existing data (bypassing FK constraints)...');
    
    // Use raw SQL to truncate tables safely
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
    
    const tables = [
        'match_likes', 'match_passes', 'saved_connections', 'messages', 'chats', 
        'user_feedback', 'reports', 'voice_sessions', 'blocks', 'badges', 
        'room_users', 'post_likes', 'post_comments', 'post_shares', 'posts', 
        'notifications', 'prompt_answers', 'prompts', 'profiles', 'users'
    ];
    
    for (const table of tables) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
    }
    
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('✅ Database cleared.');
    
    console.log('📝 Creating base prompts...');
    const promptIds: string[] = [];
    for (const text of PROMPT_TEMPLATES) {
      const id = randomUUID();
      await prisma.prompt.create({
        data: {
          id,
          text,
          type: 'text',
          category: 'icebreaker',
          difficulty: 'easy',
        }
      });
      promptIds.push(id);
    }

    console.log('👤 Generating 30 premium accounts...');
    const hashedStaticPassword = hashPassword('Password123');

    for (const userData of USERS_DATA) {
      const userId = randomUUID();
      
      await prisma.user.create({
        data: {
          id: userId,
          email: `${userData.username}@vibepass.com`,
          username: userData.username,
          passwordHash: hashedStaticPassword,
          age: Math.floor(Math.random() * (45 - 20) + 20),
          pronouns: Math.random() > 0.5 ? 'They/Them' : 'She/Her',
          language: 'en',
          bio: userData.bio,
          profile: {
            create: {
              id: randomUUID(),
              intro: userData.bio,
              profilePhotoUrl: userData.photo,
              coverPhotoUrl: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?q=80&w=1200`,
              currentCity: ['London', 'New York', 'Tokyo', 'Berlin', 'Paris'][Math.floor(Math.random() * 5)],
              interests: 'Art, Music, Travel, Food, Photography',
            }
          }
        }
      });

      // Add 2 random prompt answers per user
      const selectedPromptIds = [...promptIds].sort(() => 0.5 - Math.random()).slice(0, 2);
      for (const pId of selectedPromptIds) {
        await prisma.promptAnswer.create({
          data: {
            id: randomUUID(),
            userId: userId,
            promptId: pId,
            answer: `This is my fun answer for this prompt! I love sharing my vibes on VibePass.`,
          }
        });
      }

      console.log(`  ✓ Created user: ${userData.username}`);
    }

    console.log('\n✨ Seeding completed successfully!');
    console.log('🔑 All accounts password: Password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
