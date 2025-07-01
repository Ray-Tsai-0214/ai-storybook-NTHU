import { prisma, Category } from "@/lib/prisma";

const userEmail = "kienhong2000@hotmail.com";
const userName = "Kien Hong";

// Function to generate a URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

const userArtbooks = [
  {
    title: "The Dragon's Secret Garden",
    description: "A magical tale about a young dragon who discovers a hidden garden filled with talking flowers.",
    category: "ADVENTURE" as Category,
    coverPhoto: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    pages: [
      {
        content: "Once upon a time, in a land far away, there lived a young dragon named Ember who was different from all the other dragons.",
        picture: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav"
      },
      {
        content: "While other dragons breathed fire and collected gold, Ember had a special gift - she could make plants grow with her gentle breath.",
        picture: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/nature/sounds/wind-leaves-01.wav"
      },
      {
        content: "One day, Ember discovered a secret garden hidden behind a waterfall, where all the flowers could talk and sing beautiful songs.",
        picture: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/nature/sounds/waterfall-01.wav"
      },
      {
        content: "The flowers told Ember that their garden was dying because they had forgotten how to be happy and laugh together.",
        picture: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/nature/sounds/birds-chirping-01.wav"
      },
      {
        content: "Ember decided to help the flowers remember the joy of friendship by teaching them games and sharing stories from her adventures.",
        picture: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/happy-music.wav"
      }
    ]
  },
  {
    title: "Captain Luna's Space Adventure",
    description: "Follow Captain Luna as she explores distant planets and makes friends with alien creatures.",
    category: "ADVENTURE" as Category,
    coverPhoto: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop",
    pages: [
      {
        content: "Captain Luna zoomed through space in her silver spaceship, looking for new planets to explore and new friends to meet.",
        picture: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/space-music.wav"
      },
      {
        content: "Her first stop was Planet Zephyr, where the trees grew upside down and the rivers flowed in spirals through the purple sky.",
        picture: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/alien-planet.wav"
      },
      {
        content: "On Planet Zephyr, Luna met a friendly alien named Cosmic who had three eyes and could change colors like a rainbow.",
        picture: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/friendly-beep.wav"
      },
      {
        content: "Cosmic showed Luna the most beautiful sight in the universe - a field of star flowers that glowed and danced in the cosmic wind.",
        picture: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/magical-sparkle.wav"
      },
      {
        content: "Together, Luna and Cosmic planted star flower seeds on Earth, creating the first shooting stars that children wish upon today.",
        picture: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/wish-come-true.wav"
      }
    ]
  },
  {
    title: "The Enchanted Library",
    description: "A story about a magical library where books come alive and take children on incredible adventures.",
    category: "FIGURE" as Category,
    coverPhoto: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
    pages: [
      {
        content: "Emma loved to read more than anything else in the world, so when she found the old library at the end of her street, she was thrilled.",
        picture: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/page-turning.wav"
      },
      {
        content: "But this wasn't just any library - as soon as Emma opened the first book, the characters jumped right off the pages!",
        picture: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/magic-appear.wav"
      },
      {
        content: "A brave knight, a wise owl, and a mischievous fairy invited Emma to join them on a quest to save the Story Kingdom.",
        picture: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/adventure-call.wav"
      },
      {
        content: "In the Story Kingdom, all the fairy tales were getting mixed up - Cinderella was climbing Jack's beanstalk and the Three Bears were visiting the Seven Dwarfs!",
        picture: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/confused-magic.wav"
      },
      {
        content: "Emma and her new friends worked together to sort out all the stories, making sure every character found their way back to their own tale.",
        picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/success-chime.wav"
      }
    ]
  },
  {
    title: "The Singing Paintbrush",
    description: "An artist discovers a magical paintbrush that brings her paintings to life with beautiful melodies.",
    category: "FIGURE" as Category,
    coverPhoto: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop",
    pages: [
      {
        content: "Maya was a young artist who loved to paint, but she always felt like something was missing from her artwork.",
        picture: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/gentle-brush.wav"
      },
      {
        content: "One day, while exploring her grandmother's attic, Maya found an old paintbrush that sparkled with golden light.",
        picture: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/golden-sparkle.wav"
      },
      {
        content: "When Maya used the magical paintbrush, something amazing happened - her paintings began to sing the most beautiful songs!",
        picture: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/singing-melody.wav"
      },
      {
        content: "She painted a bird, and it sang like a nightingale. She painted a river, and it bubbled with a gentle melody. She painted flowers, and they hummed like a choir.",
        picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/nature/sounds/nightingale-song.wav"
      },
      {
        content: "Maya realized that the magic wasn't just in the paintbrush - it was in her heart, and she had been painting with love all along.",
        picture: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/heartwarming.wav"
      }
    ]
  },
  {
    title: "The Midnight Clockmaker",
    description: "A mysterious clockmaker who only works at midnight creates clocks that can control time itself.",
    category: "HORROR" as Category,
    coverPhoto: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    pages: [
      {
        content: "In the old town of Chronos, there lived a clockmaker who only worked when the clock struck midnight.",
        picture: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/clock-ticking.wav"
      },
      {
        content: "Children would whisper stories about his workshop, where strange ticking sounds echoed through the night and shadows danced on the walls.",
        picture: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/mysterious-whispers.wav"
      },
      {
        content: "Young Theo was brave enough to peek through the workshop window and saw the clockmaker crafting clocks that glowed with an eerie blue light.",
        picture: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/eerie-glow.wav"
      },
      {
        content: "These weren't ordinary clocks - they could slow down time, speed it up, or even make time go backwards for those who owned them.",
        picture: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/time-distortion.wav"
      },
      {
        content: "But Theo discovered the clockmaker's secret: he was actually trying to create more time so that busy parents could spend extra hours with their children.",
        picture: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/heartwarming-reveal.wav"
      }
    ]
  },
  {
    title: "The Rainbow Bridge to Friendship",
    description: "A heartwarming story about building bridges between different communities through kindness and understanding.",
    category: "ROMANTIC" as Category,
    coverPhoto: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
    pages: [
      {
        content: "In the village of Harmony Hills, two neighborhoods were separated by a deep valley, and the children from each side had never met.",
        picture: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/peaceful-village.wav"
      },
      {
        content: "Little Mia from the East Side and Sam from the West Side both dreamed of building a bridge to connect their communities.",
        picture: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/hopeful-dream.wav"
      },
      {
        content: "One magical morning, a beautiful rainbow appeared after the rain, stretching perfectly across the valley between both sides.",
        picture: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/nature/sounds/rainbow-magic.wav"
      },
      {
        content: "Mia and Sam carefully walked along the rainbow bridge and met in the middle, becoming the first friends from both neighborhoods.",
        picture: "https://images.unsplash.com/photo-1607626972860-5020a45cfa1d?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/friendship-joy.wav"
      },
      {
        content: "Together, they organized a grand festival where everyone crossed the rainbow bridge, and the two communities became one big happy family.",
        picture: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/celebration-music.wav"
      }
    ]
  },
  {
    title: "The Time-Traveling Backpack",
    description: "An ordinary school backpack turns out to have extraordinary powers, taking its owner on adventures through history.",
    category: "ACTION" as Category,
    coverPhoto: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop",
    pages: [
      {
        content: "Jake found an old backpack in his grandfather's attic that looked ordinary, but when he put it on, strange things began to happen.",
        picture: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/mysterious-discovery.wav"
      },
      {
        content: "The first time he wished he could see dinosaurs, the backpack glowed and suddenly he was standing in a prehistoric jungle!",
        picture: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/time-travel-whoosh.wav"
      },
      {
        content: "Jake met a friendly Triceratops who showed him around the ancient world, teaching him about life millions of years ago.",
        picture: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/animals/sounds/dinosaur-friendly.wav"
      },
      {
        content: "Next, the backpack took him to ancient Egypt, where he helped build pyramids and learned the secrets of the pharaohs.",
        picture: "https://images.unsplash.com/photo-1539650116574-75c0c6d73b6e?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/ancient-egypt.wav"
      },
      {
        content: "Jake realized that the backpack was teaching him that history is an adventure, and every time period has something wonderful to discover.",
        picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/wisdom-learned.wav"
      }
    ]
  }
];

async function seedUserData() {
  console.log("🌱 Creating fake data for user:", userEmail);

  try {
    // Create or update the user
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { name: userName },
      create: {
        name: userName,
        email: userEmail,
        emailVerified: true,
      },
    });

    console.log(`✅ User created/updated: ${user.name} (${user.email})`);

    // Create artbooks for the user
    for (let i = 0; i < userArtbooks.length; i++) {
      const artbookData = userArtbooks[i];

      // Generate a unique slug
      const baseSlug = generateSlug(artbookData.title);
      let slug = baseSlug;
      let counter = 1;
      
      // Ensure slug is unique
      while (await prisma.artbook.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const artbook = await prisma.artbook.create({
        data: {
          title: artbookData.title,
          slug: slug,
          description: artbookData.description,
          coverPhoto: artbookData.coverPhoto,
          category: artbookData.category,
          isPublic: true,
          authorId: user.id,
          createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Spread over different days
        },
      });

      // Create pages for the artbook
      for (let pageNum = 1; pageNum <= artbookData.pages.length; pageNum++) {
        const pageData = artbookData.pages[pageNum - 1];
        await prisma.page.create({
          data: {
            pageNumber: pageNum,
            content: pageData.content,
            picture: pageData.picture,
            audio: pageData.audio,
            artbookId: artbook.id,
          },
        });
      }

      // Create a post for social features
      const post = await prisma.post.create({
        data: {
          artbookId: artbook.id,
          views: Math.floor(Math.random() * 100) + 10, // Random views 10-110
        },
      });

      // Add some random likes from other users
      const otherUsers = await prisma.user.findMany({
        where: { 
          email: { not: userEmail } 
        },
        take: 5,
      });

      for (const otherUser of otherUsers.slice(0, Math.floor(Math.random() * 3) + 1)) {
        try {
          await prisma.like.create({
            data: {
              userId: otherUser.id,
              postId: post.id,
            },
          });
        } catch {
          // Skip if like already exists
          continue;
        }
      }

      console.log(`✅ Created artbook: "${artbook.title}" with ${artbookData.pages.length} pages`);
    }

    console.log("🎉 User data seeding completed successfully!");

    // Print summary
    const userArtbooksCount = await prisma.artbook.count({
      where: { authorId: user.id }
    });

    console.log(`\n📊 Summary for ${user.name}:`);
    console.log(`📚 Total Artbooks: ${userArtbooksCount}`);

  } catch (error) {
    console.error("❌ Error seeding user data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedUserData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedUserData };