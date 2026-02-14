const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const supportArticles = [
  { title: 'What is reactivity?', slug: 'what-is-reactivity', category: 'Basics', order: 0, body: 'Reactivity in dogs is a heightened response to certain triggers (other dogs, people, sounds, or environments). It often looks like barking, lunging, or pulling. It usually comes from fear, frustration, or over-arousal—not "bad" behavior. Understanding this helps us train with empathy and set up safe, gradual exposure.' },
  { title: 'Safety first: community guidelines', slug: 'safety-guidelines', category: 'Basics', order: 1, body: 'BuddyMatch is built on safety and respect.\n\n• Only arrange meetups in neutral, low-traffic areas.\n• Keep distance until both handlers agree to move closer.\n• One dog per handler at structured meetups.\n• No punishment-based corrections; we support force-free methods.\n• If either dog is over threshold, pause and create space.\n• Take the Safety Pledge in your profile to show your commitment.' },
  { title: 'Choosing a meetup location', slug: 'choosing-location', category: 'Meetups', order: 0, body: 'Pick locations that are:\n\n• Neutral (not either dog’s “turf”)\n• Relatively quiet with few surprises\n• Easy to leave if you need more space\n• Large enough for parallel walking or controlled distance work\n\nParks with wide paths, empty parking lots at off-hours, or quiet side streets work well. Avoid busy dog parks or narrow trails.' },
  { title: 'Parallel walking intro', slug: 'parallel-walking', category: 'Meetups', order: 1, body: 'Parallel walking is a low-pressure way to introduce reactive dogs.\n\n1. Start at a distance where both dogs can notice each other but stay under threshold (no barking/lunging).\n2. Walk in the same direction, on opposite sides of the path or road.\n3. Keep the walk short and positive; reward calm behavior.\n4. Over multiple sessions, you can gradually decrease distance if both dogs stay comfortable.' },
  { title: 'Reading your dog’s body language', slug: 'body-language', category: 'Training', order: 0, body: 'Signs of stress or rising arousal: stiffening, staring, raised hackles, lip licking, yawning, turning away, freezing. If you see these, create more distance or end the session. Calm, loose body language and optional engagement with you are good signs. Learning to read your dog helps you stop sessions before they go over threshold.' },
  { title: 'When to get professional help', slug: 'professional-help', category: 'Support', order: 0, body: 'Consider a force-free trainer or behavior consultant if:\n\n• Your dog has a bite history or you’re worried about safety\n• You’re stuck and not making progress\n• Your own stress is affecting your ability to train\n• You want a tailored plan for your dog’s specific triggers\n\nBuddyMatch is for peer support and practice; it doesn’t replace professional guidance when needed.' },
];

async function main() {
  for (const a of supportArticles) {
    await prisma.supportArticle.upsert({
      where: { slug: a.slug },
      create: a,
      update: { title: a.title, category: a.category, order: a.order, body: a.body },
    });
  }
  console.log('Support articles seeded.');

  const demoEmail = 'demo@buddymatch.example';
  const existing = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existing) {
    const hash = await bcrypt.hash('demo1234', 10);
    await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash: hash,
        name: 'Demo User',
        city: 'Portland',
        lat: 45.5152,
        lng: -122.6784,
        experience: 'Intermediate',
        availability: 'Weekend mornings',
        safetyPledgedAt: new Date(),
      },
    });
    console.log('Demo user created: demo@buddymatch.example / demo1234');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
