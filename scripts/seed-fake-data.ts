import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

const categories: Category[] = ["ADVENTURE", "HORROR", "ACTION", "ROMANTIC", "FIGURE"];

const sampleTitles = [
  "The Magic Forest Adventure",
  "Brave Little Dragon",
  "Mystery of the Lost Castle",
  "Princess and the Golden Key",
  "Journey to the Rainbow Mountain",
  "The Friendly Monster",
  "Secret of the Enchanted Garden",
  "Captain Starlight's Quest",
  "The Singing Flowers",
  "Adventures in Candyland",
  "The Wise Old Owl",
  "Dancing with Unicorns",
  "The Treasure Hunt",
  "Moonbeam's Magic Show",
  "The Curious Cat's Journey",
];

const sampleDescriptions = [
  "A wonderful tale of friendship and courage in a magical world.",
  "Follow our hero as they discover the power of believing in themselves.",
  "An exciting adventure filled with mystery and wonder.",
  "A heartwarming story about kindness and helping others.",
  "Join the journey through fantastic lands and meet amazing characters.",
  "A story about overcoming fears and finding inner strength.",
  "Discover the magic that exists all around us.",
  "An tale of adventure, friendship, and magical discoveries.",
  "Learn about the importance of being true to yourself.",
  "A delightful story that will spark imagination and joy.",
];

const sampleAuthors = [
  { name: "Emma Chen", email: "emma@example.com" },
  { name: "Alex Johnson", email: "alex@example.com" },
  { name: "Maria Garcia", email: "maria@example.com" },
  { name: "David Kim", email: "david@example.com" },
  { name: "Sarah Wilson", email: "sarah@example.com" },
  { name: "Michael Brown", email: "michael@example.com" },
  { name: "Luna Rodriguez", email: "luna@example.com" },
  { name: "James Taylor", email: "james@example.com" },
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysAgo: number): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * daysAgo * 24 * 60 * 60 * 1000));
  return pastDate;
}

async function seedFakeData() {
  console.log("🌱 Starting to seed fake data...");

  try {
    // Create fake users
    console.log("👥 Creating fake users...");
    const users = [];
    for (const author of sampleAuthors) {
      const user = await prisma.user.upsert({
        where: { email: author.email },
        update: {},
        create: {
          name: author.name,
          email: author.email,
          emailVerified: true,
        },
      });
      users.push(user);
    }

    // Create fake artbooks with pages, posts, likes, and comments
    console.log("📚 Creating fake artbooks...");
    
    for (let i = 0; i < 15; i++) {
      const author = getRandomElement(users);
      const title = getRandomElement(sampleTitles);
      const description = getRandomElement(sampleDescriptions);
      const category = getRandomElement(categories);
      const createdAt = getRandomDate(30); // Random date within last 30 days
      const fullTitle = `${title} ${i + 1}`;
      
      // Generate a unique slug
      function generateSlug(title: string): string {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      }

      const baseSlug = generateSlug(fullTitle);
      let slug = baseSlug;
      let counter = 1;

      // Ensure slug is unique
      while (await prisma.artbook.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const artbook = await prisma.artbook.create({
        data: {
          title: fullTitle,
          slug,
          description,
          category,
          isPublic: true,
          authorId: author.id,
          createdAt,
          updatedAt: createdAt,
        },
      });

      // Create pages for the artbook
      const pageCount = getRandomNumber(3, 8);
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        await prisma.page.create({
          data: {
            pageNumber: pageNum,
            content: `This is the story content for page ${pageNum} of "${artbook.title}". ${getRandomElement(sampleDescriptions)}`,
            artbookId: artbook.id,
          },
        });
      }

      // Create a post for the artbook
      const post = await prisma.post.create({
        data: {
          artbookId: artbook.id,
          views: getRandomNumber(0, 500),
          createdAt,
          updatedAt: createdAt,
        },
      });

      // Create random likes
      const likeCount = getRandomNumber(0, 20);
      const likedUsers = users.slice(0, likeCount);
      for (const likedUser of likedUsers) {
        try {
          await prisma.like.create({
            data: {
              userId: likedUser.id,
              postId: post.id,
              createdAt: getRandomDate(7), // Likes within last 7 days
            },
          });
        } catch (error) {
          // Skip if like already exists (duplicate key)
          continue;
        }
      }

      // Create random comments
      const commentCount = getRandomNumber(0, 8);
      for (let c = 0; c < commentCount; c++) {
        const commenter = getRandomElement(users);
        const commentTexts = [
          "What a wonderful story!",
          "My kids love this book!",
          "Beautiful illustrations and great story.",
          "This is so creative and fun!",
          "Amazing work, keep it up!",
          "Can't wait to read more from this author.",
          "This made me smile. Thank you!",
          "Perfect bedtime story for children.",
        ];
        
        await prisma.comment.create({
          data: {
            content: getRandomElement(commentTexts),
            userId: commenter.id,
            postId: post.id,
            createdAt: getRandomDate(14), // Comments within last 14 days
          },
        });
      }

      console.log(`✅ Created artbook: ${artbook.title}`);
    }

    console.log("🎉 Fake data seeding completed successfully!");
    
    // Print summary
    const totalArtbooks = await prisma.artbook.count();
    const totalLikes = await prisma.like.count();
    const totalComments = await prisma.comment.count();
    const totalViews = await prisma.post.aggregate({
      _sum: { views: true }
    });

    console.log("\n📊 Summary:");
    console.log(`📚 Total Artbooks: ${totalArtbooks}`);
    console.log(`👥 Total Users: ${users.length}`);
    console.log(`❤️ Total Likes: ${totalLikes}`);
    console.log(`💬 Total Comments: ${totalComments}`);
    console.log(`👀 Total Views: ${totalViews._sum.views || 0}`);

  } catch (error) {
    console.error("❌ Error seeding fake data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedFakeData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedFakeData };