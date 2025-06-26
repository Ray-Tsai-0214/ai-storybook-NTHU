import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

const userEmail = "kienhong2000@hotmail.com";
const userName = "Kien Hong";

const userArtbooks = [
  {
    title: "The Dragon's Secret Garden",
    description: "A magical tale about a young dragon who discovers a hidden garden filled with talking flowers.",
    category: "ADVENTURE" as Category,
    pages: [
      "Once upon a time, in a land far away, there lived a young dragon named Ember who was different from all the other dragons.",
      "While other dragons breathed fire and collected gold, Ember had a special gift - she could make plants grow with her gentle breath.",
      "One day, Ember discovered a secret garden hidden behind a waterfall, where all the flowers could talk and sing beautiful songs.",
      "The flowers told Ember that their garden was dying because they had forgotten how to be happy and laugh together.",
      "Ember decided to help the flowers remember the joy of friendship by teaching them games and sharing stories from her adventures."
    ]
  },
  {
    title: "Captain Luna's Space Adventure",
    description: "Follow Captain Luna as she explores distant planets and makes friends with alien creatures.",
    category: "ADVENTURE" as Category,
    pages: [
      "Captain Luna zoomed through space in her silver spaceship, looking for new planets to explore and new friends to meet.",
      "Her first stop was Planet Zephyr, where the trees grew upside down and the rivers flowed in spirals through the purple sky.",
      "On Planet Zephyr, Luna met a friendly alien named Cosmic who had three eyes and could change colors like a rainbow.",
      "Cosmic showed Luna the most beautiful sight in the universe - a field of star flowers that glowed and danced in the cosmic wind.",
      "Together, Luna and Cosmic planted star flower seeds on Earth, creating the first shooting stars that children wish upon today."
    ]
  },
  {
    title: "The Enchanted Library",
    description: "A story about a magical library where books come alive and take children on incredible adventures.",
    category: "FIGURE" as Category,
    pages: [
      "Emma loved to read more than anything else in the world, so when she found the old library at the end of her street, she was thrilled.",
      "But this wasn't just any library - as soon as Emma opened the first book, the characters jumped right off the pages!",
      "A brave knight, a wise owl, and a mischievous fairy invited Emma to join them on a quest to save the Story Kingdom.",
      "In the Story Kingdom, all the fairy tales were getting mixed up - Cinderella was climbing Jack's beanstalk and the Three Bears were visiting the Seven Dwarfs!",
      "Emma and her new friends worked together to sort out all the stories, making sure every character found their way back to their own tale."
    ]
  },
  {
    title: "The Singing Paintbrush",
    description: "An artist discovers a magical paintbrush that brings her paintings to life with beautiful melodies.",
    category: "FIGURE" as Category,
    pages: [
      "Maya was a young artist who loved to paint, but she always felt like something was missing from her artwork.",
      "One day, while exploring her grandmother's attic, Maya found an old paintbrush that sparkled with golden light.",
      "When Maya used the magical paintbrush, something amazing happened - her paintings began to sing the most beautiful songs!",
      "She painted a bird, and it sang like a nightingale. She painted a river, and it bubbled with a gentle melody. She painted flowers, and they hummed like a choir.",
      "Maya realized that the magic wasn't just in the paintbrush - it was in her heart, and she had been painting with love all along."
    ]
  },
  {
    title: "The Midnight Clockmaker",
    description: "A mysterious clockmaker who only works at midnight creates clocks that can control time itself.",
    category: "HORROR" as Category,
    pages: [
      "In the old town of Chronos, there lived a clockmaker who only worked when the clock struck midnight.",
      "Children would whisper stories about his workshop, where strange ticking sounds echoed through the night and shadows danced on the walls.",
      "Young Theo was brave enough to peek through the workshop window and saw the clockmaker crafting clocks that glowed with an eerie blue light.",
      "These weren't ordinary clocks - they could slow down time, speed it up, or even make time go backwards for those who owned them.",
      "But Theo discovered the clockmaker's secret: he was actually trying to create more time so that busy parents could spend extra hours with their children."
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

      const artbook = await prisma.artbook.create({
        data: {
          title: artbookData.title,
          description: artbookData.description,
          category: artbookData.category,
          isPublic: true,
          authorId: user.id,
          createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Spread over different days
        },
      });

      // Create pages for the artbook
      for (let pageNum = 1; pageNum <= artbookData.pages.length; pageNum++) {
        await prisma.page.create({
          data: {
            pageNumber: pageNum,
            content: artbookData.pages[pageNum - 1],
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
        } catch (error) {
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