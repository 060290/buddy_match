const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const supportArticles = [
  { title: 'What is reactivity?', slug: 'what-is-reactivity', category: 'Basics', order: 0, body: 'Reactivity in dogs is a heightened response to certain triggers (other dogs, people, sounds, or environments). It often looks like barking, lunging, or pulling. It usually comes from fear, frustration, or over-arousal—not "bad" behavior. Understanding this helps us train with empathy and set up safe, gradual exposure.' },
  { title: 'Safety first: community guidelines', slug: 'safety-guidelines', category: 'Basics', order: 1, body: 'BuddyMatch is built on safety and respect.\n\n• Only arrange meetups in neutral, low-traffic areas.\n• Keep distance until both handlers agree to move closer.\n• One dog per handler at structured meetups.\n• No punishment-based corrections; we support force-free methods.\n• If either dog is over threshold, pause and create space.\n• Take the Safety Pledge in your profile to show your commitment.' },
  { title: 'Choosing a meetup location', slug: 'choosing-location', category: 'Meetups', order: 0, body: 'Pick locations that are:\n\n• Neutral (not either dog’s “turf”)\n• Relatively quiet with few surprises\n• Easy to leave if you need more space\n• Large enough for parallel walking or controlled distance work\n\nParks with wide paths, empty parking lots at off-hours, or quiet side streets work well. Avoid busy dog parks or narrow trails.' },
  { title: 'Parallel walking intro', slug: 'parallel-walking', category: 'Meetups', order: 1, body: 'Parallel walking is a low-pressure way to introduce reactive dogs.\n\n1. Start at a distance where both dogs can notice each other but stay under threshold (no barking/lunging).\n2. Walk in the same direction, on opposite sides of the path or road.\n3. Keep the walk short and positive; reward calm behavior.\n4. Over multiple sessions, you can gradually decrease distance if both dogs stay comfortable.' },
  { title: 'Reading your dog’s body language', slug: 'body-language', category: 'Training', order: 0, body: 'Signs of stress or rising arousal: stiffening, staring, raised hackles, lip licking, yawning, turning away, freezing. If you see these, create more distance or end the session. Calm, loose body language and optional engagement with you are good signs. Learning to read your dog helps you stop sessions before they go over threshold.' },
  { title: 'When to get professional help', slug: 'professional-help', category: 'Support', order: 0, body: 'Consider a force-free trainer or behavior consultant if:\n\n• Your dog has a bite history or you\'re worried about safety\n• You\'re stuck and not making progress\n• Your own stress is affecting your ability to train\n• You want a tailored plan for your dog\'s specific triggers\n\nBuddyMatch is for peer support and practice; it doesn\'t replace professional guidance when needed.' },
  // Dog behavior situations
  { title: 'Leash reactivity', slug: 'leash-reactivity', category: 'Dog behavior', order: 0, body: 'Many dogs bark or lunge on leash but are fine off-leash. This is often "leash frustration" or "barrier frustration": the leash blocks the dog from approaching or leaving, which increases arousal. It can also be fear—the dog feels trapped and reacts to make the trigger go away.\n\nWhat helps: Keep distance from triggers so your dog stays under threshold. Reward calm behavior and voluntary check-ins with you. Avoid yanking or punishing; it can make reactivity worse. Work on loose-leash walking in low-stimulation areas first. Force-free trainers often use desensitization and counterconditioning (associating the trigger with something good) at a distance that works for your dog.' },
  { title: 'Dog-to-dog reactivity', slug: 'dog-to-dog-reactivity', category: 'Dog behavior', order: 1, body: 'Dogs who react to other dogs may be fearful, frustrated (wanting to greet but unable to), or over-aroused. Some have had bad experiences; others never learned calm social skills.\n\nSafe approaches: Manage the environment so your dog isn\'t forced into close contact. Use distance, barriers, or parallel walking with a willing buddy. Reward calm behavior when another dog is in view. Never flood your dog (forcing them into situations they can\'t handle). Introduce new dogs slowly and in controlled setups. BuddyMatch meetups are designed for this—structured, at a distance, with owners who understand.' },
  { title: 'Fear of strangers or people', slug: 'fear-of-people', category: 'Dog behavior', order: 2, body: 'Some dogs are nervous or reactive around unfamiliar people. They might bark, hide, or show stress signals (lip licking, yawning, turning away). This is usually fear-based, not dominance.\n\nWhat helps: Don\'t force greetings or let people pet your dog without consent. Give your dog space and let them approach when they\'re ready. Reward calm behavior when people are at a comfortable distance. Avoid punishing fear—it can increase anxiety. A force-free trainer or behavior consultant can design a desensitization plan. In public, use a vest or bandana that signals "need space" if it helps others give distance.' },
  { title: 'Barrier frustration (fence, window, crate)', slug: 'barrier-frustration', category: 'Dog behavior', order: 3, body: 'Dogs who bark or lunge at windows, fences, or behind gates are often frustrated because they can\'t reach what they see (another dog, a passerby). The barrier increases arousal and prevents normal approach/retreat.\n\nWhat helps: Reduce access to the trigger when unsupervised—close curtains, block the view, or use a different room. Provide enrichment and exercise so your dog has an outlet. Train an alternative behavior (e.g. "go to mat") and reward it when they notice the trigger. Don\'t punish; it doesn\'t address the underlying frustration. Management plus training (e.g. counterconditioning at a distance) is the standard approach.' },
  { title: 'Sound sensitivity and noise reactivity', slug: 'sound-sensitivity', category: 'Dog behavior', order: 4, body: 'Dogs who panic or react to loud noises (thunder, fireworks, construction) are experiencing fear or stress. Some also react to everyday sounds (doorbells, beeps, other dogs barking).\n\nWhat helps: Create a safe, quiet space (e.g. a room with white noise or music). Don\'t punish or force exposure. Gradual desensitization (playing sounds at low volume and rewarding calm behavior) can help when done carefully. For severe cases, a vet may recommend medication or referral to a behavior professional. During storms or fireworks, stay calm and offer treats or play if your dog can engage—but don\'t force interaction.' },
  { title: 'Excitement and over-arousal', slug: 'excitement-arousal', category: 'Dog behavior', order: 5, body: 'Some dogs "react" because they\'re over-excited—they want to play or greet and can\'t contain themselves. This can look like pulling, barking, or jumping. It\'s not always fear; it\'s often frustration or high arousal.\n\nWhat helps: Teach impulse control (e.g. sit, wait, calm greetings). Use distance so your dog can practice staying under threshold. Reward calm behavior before they tip over. Avoid reinforcing the excited behavior (e.g. only saying hi when they\'re calm). Structured meetups with other owners can provide practice at a safe distance so your dog learns that calm = good things happen.' },
  // More training
  { title: 'Working under threshold', slug: 'under-threshold', category: 'Training', order: 1, body: '"Under threshold" means your dog can notice the trigger but still think, learn, and choose behaviors (e.g. look at you, take a treat). Over threshold, they\'re in fight/flight mode—training doesn\'t stick and reactions can get worse.\n\nPractice at a distance where your dog is relaxed. If they\'re barking, lunging, or unable to take food, you\'re too close. Increase distance, then try again. Progress happens when we stay under threshold and build positive associations over time.' },
  { title: 'Using treats and rewards safely', slug: 'treats-rewards', category: 'Training', order: 2, body: 'Food rewards are a standard, evidence-based way to reinforce calm behavior and build positive associations with triggers. Use high-value treats (e.g. small pieces of chicken or cheese) in distracting situations.\n\nAt meetups: Bring your own treats. Reward your dog for calm behavior and for checking in with you. Don\'t offer treats to the other dog without their owner\'s permission (diet or allergies). Keep rewards small so your dog doesn\'t get full too quickly. If your dog won\'t take treats, you\'re likely over threshold—create more distance.' },
  // Support
  { title: 'Resources and further reading', slug: 'resources', category: 'Support', order: 1, body: 'Credible, force-free sources for learning more about dog behavior and training:\n\n• American Veterinary Society of Animal Behavior (AVSAB) – position statements on punishment, dominance, and behavior.\n• International Association of Animal Behavior Consultants (IAABC) – articles and consultant directory.\n• Certification Council for Professional Dog Trainers (CCPDT) – trainer directory and education.\n• Fear Free Pets – reducing fear and stress in dogs (and other animals).\n\nYour veterinarian can also refer you to a board-certified veterinary behaviorist (DACVB) for serious behavior concerns. Always choose professionals who use force-free, science-based methods.' },
];

const supportResources = [
  { category: 'Basics', title: 'AVSAB Position Statement on Punishment', url: 'https://avsab.org/resources/position-statements/', type: 'article', order: 0 },
  { category: 'Basics', title: 'Fear Free Pets – Reducing Fear in Dogs', url: 'https://fearfreepets.com/', type: 'article', order: 1 },
  { category: 'Basics', title: 'IAABC – Understanding Dog Behavior', url: 'https://iaabc.org/behavior-library', type: 'article', order: 2 },
  { category: 'Dog behavior', title: 'Leash Reactivity (CCPDT)', url: 'https://ccpdt.org/', type: 'article', order: 0 },
  { category: 'Dog behavior', title: 'Kikopup – Leash Reactivity (YouTube)', url: 'https://www.youtube.com/@kikopup', type: 'video', order: 1 },
  { category: 'Dog behavior', title: 'Dog-to-Dog Aggression (AVSAB)', url: 'https://avsab.org/resources/position-statements/', type: 'article', order: 2 },
  { category: 'Dog behavior', title: 'Susan Garrett – Crate Games & Calm (YouTube)', url: 'https://www.youtube.com/@SusanGarrettDogTraining', type: 'video', order: 3 },
  { category: 'Dog behavior', title: 'Noise Sensitivity (Fear Free)', url: 'https://fearfreepets.com/noise-sensitivity-in-pets/', type: 'article', order: 4 },
  { category: 'Meetups', title: 'Parallel Walking – Grisha Stewart / BAT (YouTube)', url: 'https://www.youtube.com/@grishastewart', type: 'video', order: 0 },
  { category: 'Meetups', title: 'Safe Dog Introductions (IAABC)', url: 'https://iaabc.org/behavior-library', type: 'article', order: 1 },
  { category: 'Training', title: 'Reading Dog Body Language (Lili Chin)', url: 'https://www.doggiedrawings.net/', type: 'article', order: 0 },
  { category: 'Training', title: 'Kikopup – Threshold & Counterconditioning (YouTube)', url: 'https://www.youtube.com/@kikopup', type: 'video', order: 1 },
  { category: 'Training', title: 'Positive Reinforcement (AVSAB)', url: 'https://avsab.org/resources/position-statements/', type: 'article', order: 2 },
  { category: 'Support', title: 'Find a Force-Free Trainer (CCPDT)', url: 'https://ccpdt.org/dog-owners/find-a-trainer/', type: 'article', order: 0 },
  { category: 'Support', title: 'Find a Behavior Consultant (IAABC)', url: 'https://iaabc.org/consultants', type: 'article', order: 1 },
  { category: 'Support', title: 'AVSAB – When to See a Behavior Professional', url: 'https://avsab.org/resources/position-statements/', type: 'article', order: 2 },
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

  await prisma.supportResource.deleteMany({});
  await prisma.supportResource.createMany({ data: supportResources });
  console.log('Support resources (articles & videos) seeded.');

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
