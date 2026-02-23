/**
 * Structured tips for the Tips page. Each tip follows:
 * what it looks like, why it happens, steps, what not to do, signs of improvement.
 */

export const TIP_SECTIONS = {
  workingOn: "What we're working on",
  readYourDog: 'Read your dog',
  situation: 'Situation-based tips',
  quickAction: 'Quick action',
  progressAware: 'Progress-aware suggestions',
};

export const tipsBySection = {
  workingOn: [
    {
      slug: 'leash-reactivity',
      title: 'Leash reactivity',
      shortDescription: 'Barking or lunging on leash when seeing other dogs or people.',
      whatItLooksLike: 'Your dog may bark, lunge, freeze, or pull hard when they see a trigger on walks. Their body might be stiff, tail high or tucked, ears forward or pinned.',
      whyItHappens: 'Leash frustration (wanting to greet but can\'t), fear, or past negative experiences. The leash removes escape options, which can increase stress.',
      steps: [
        'Increase distance from triggers so your dog can stay under threshold.',
        'Use high-value treats and reward for calm behavior (looking at you, loose leash).',
        'Practice "look at that" — reward for noticing the trigger without reacting.',
        'Build duration: reward for staying calm as you gradually decrease distance over many sessions.',
      ],
      whatNotToDo: [
        'Don\'t punish or yell — it can increase fear and association with the trigger.',
        'Avoid forcing your dog past triggers at close range.',
        'Don\'t let strangers or dogs approach if your dog is over threshold.',
      ],
      signsOfImprovement: 'Fewer or shorter reactions, more frequent check-ins with you, ability to recover faster, willingness to take treats near triggers.',
    },
    {
      slug: 'overarousal-at-meetups',
      title: 'Overarousal at meetups',
      shortDescription: 'Too excited or wound up to focus when meeting other dogs or people.',
      whatItLooksLike: 'Pulling, jumping, whining, inability to settle, mouthing, or zooming. Hard to get attention even with treats.',
      whyItHappens: 'Meetups are highly reinforcing; your dog may have learned that excitement gets them what they want. Some dogs are naturally high-arousal.',
      steps: [
        'Practice calm behaviors (sit, down, stay) in low-distraction settings first.',
        'Arrive early and let your dog decompress before others arrive.',
        'Use parallel walking before any face-to-face greetings.',
        'Keep initial meetups short and end on a calm note.',
      ],
      whatNotToDo: [
        'Don\'t start with on-leash face-to-face greetings.',
        'Avoid long, unstructured play until your dog can self-regulate.',
        'Don\'t punish excitement — redirect and reward calm.',
      ],
      signsOfImprovement: 'Easier to get focus, quicker to settle, less pulling and jumping, more check-ins with you during the meetup.',
    },
  ],
  readYourDog: [
    {
      slug: 'stress-signals',
      title: 'Stress signals & body language',
      shortDescription: 'Learn to spot when your dog is uncomfortable before they react.',
      whatItLooksLike: 'Lip licks, yawning (when not tired), whale eye (whites of eyes showing), turning head away, stiff body, low or slow tail wag, freezing, sniffing the ground suddenly.',
      whyItHappens: 'Dogs communicate discomfort through body language first. If we miss these signals, they may escalate to growling or snapping.',
      steps: [
        'Watch your dog in low-stress settings to learn their baseline.',
        'Notice subtle changes: ears, tail, body tension, where they look.',
        'When you see stress signals, create distance or remove the stressor.',
        'Reward calm behavior so your dog learns you\'re a safe partner.',
      ],
      whatNotToDo: [
        'Don\'t force interaction when you see stress signals.',
        'Avoid dismissing "small" signs — they often precede bigger reactions.',
        'Don\'t punish growling; it\'s communication. Address the cause instead.',
      ],
      signsOfImprovement: 'You notice signals earlier; your dog offers more calming signals and recovers faster when you create distance.',
    },
    {
      slug: 'calming-signals',
      title: 'Calming signals',
      shortDescription: 'Behaviors dogs use to calm themselves and communicate "I mean no harm."',
      whatItLooksLike: 'Lip lick, yawn, turn away, play bow (in some contexts), sniffing, slow blink, curved body approach, sitting or lying down.',
      whyItHappens: 'Dogs use these to de-escalate and signal friendliness. Recognizing them helps you support your dog and read other dogs.',
      steps: [
        'Learn the most common calming signals (lip lick, yawn, turn away, sniff).',
        'When your dog offers them, honor the message — give space or reduce pressure.',
        'You can use distance and calm yourself as "calming signals" your dog understands.',
      ],
      whatNotToDo: [
        'Don\'t push your dog into situations when they\'re offering many calming signals.',
        'Don\'t assume a wagging tail always means happy — check the rest of the body.',
      ],
      signsOfImprovement: 'You and your dog communicate better; you respond to their signals and they feel heard.',
    },
  ],
  situation: [
    {
      slug: 'before-meetup',
      title: 'Before a meetup',
      shortDescription: 'Set your dog up for success before you leave or before others arrive.',
      whatItLooksLike: 'A calm, prepared dog and a clear plan: where you\'ll walk, how you\'ll greet, and what to do if things get tense.',
      whyItHappens: 'Dogs do better with predictability. A rushed or chaotic start can raise arousal and make regulation harder.',
      steps: [
        'Exercise or mental work beforehand so your dog isn\'t bursting with energy.',
        'Review the plan: parallel walk first, no face-to-face until everyone is calm.',
        'Pack treats, water, and a long line if needed.',
        'Arrive early so your dog can sniff and settle before others arrive.',
      ],
      whatNotToDo: [
        'Don\'t skip the pre-meetup routine if your dog is reactive or easily aroused.',
        'Avoid last-minute changes that might stress your dog.',
      ],
      signsOfImprovement: 'Your dog is easier to manage from the start; transitions into the meetup feel smoother.',
    },
    {
      slug: 'greetings',
      title: 'Greetings (dogs & people)',
      shortDescription: 'Safe, low-pressure ways to say hello.',
      whatItLooksLike: 'Dogs approach in a curve, sniff, and have choice to engage or move away. No tight leashes or face-to-face staring.',
      whyItHappens: 'Direct approaches and tight leashes can feel threatening. Dogs need space and time to assess.',
      steps: [
        'Use parallel walking instead of head-on approaches.',
        'Allow sniffing and keep leashes loose so dogs can communicate.',
        'Keep greetings short; separate before either dog gets overstimulated.',
        'For people: ask your dog to sit or stay and reward; let them choose to approach.',
      ],
      whatNotToDo: [
        'Don\'t allow face-to-face, nose-to-nose greetings on leash.',
        'Avoid forcing your dog to greet people or dogs they\'re unsure about.',
        'Don\'t let children run up or hug without consent.',
      ],
      signsOfImprovement: 'Greetings are brief and calm; your dog can disengage without escalating.',
    },
    {
      slug: 'overwhelmed',
      title: 'When your dog is overwhelmed',
      shortDescription: 'What to do when your dog is over threshold or shutting down.',
      whatItLooksLike: 'Unable to take treats, fixated on trigger, barking/lunging, or conversely hiding, freezing, or trying to leave.',
      whyItHappens: 'Stress has exceeded their ability to cope. Learning and listening shut down; they need safety, not commands.',
      steps: [
        'Create distance immediately — move away from the trigger.',
        'Don\'t ask for behaviors; just get to a quieter spot.',
        'Let your dog recover (sniff, shake off, breathe) before continuing.',
        'End the session or change the plan; don\'t push past threshold again.',
      ],
      whatNotToDo: [
        'Don\'t punish, yell, or correct — it adds more stress.',
        'Avoid blocking their view by standing in front; create distance instead.',
        'Don\'t force them to "sit" or "focus" until they\'ve had time to recover.',
      ],
      signsOfImprovement: 'You recognize threshold earlier; your dog recovers faster when you create distance.',
    },
    {
      slug: 'busy-environments',
      title: 'Busy environments',
      shortDescription: 'Tips for parks, streets, and places with lots of activity.',
      whatItLooksLike: 'Many triggers, movement, and noise. Your dog may be on high alert or unable to relax.',
      whyItHappens: 'Busy places are stimulating. Reactive or sensitive dogs can quickly go over threshold.',
      steps: [
        'Start at quieter times or edges of the space; build up gradually.',
        'Use barriers (distance, cars, trees) to buffer triggers when possible.',
        'Reward check-ins and calm behavior frequently.',
        'Have an exit plan and use it if your dog is struggling.',
      ],
      whatNotToDo: [
        'Don\'t expect your dog to cope with the same level of bustle as a non-reactive dog yet.',
        'Avoid staying in the middle of chaos "to get them used to it."',
      ],
      signsOfImprovement: 'Your dog can handle more activity with less reaction; you both feel more confident in busy spots.',
    },
  ],
  quickAction: [
    {
      slug: 'right-now-breathe',
      title: 'Right now: Breathe',
      shortDescription: 'You and your dog both benefit from a calmer handler.',
      whatItLooksLike: 'You take a slow breath; your posture softens; you might slow your pace.',
      whyItHappens: 'Dogs read our tension. When we calm ourselves, we help them regulate.',
      steps: ['Take one slow breath in and out.', 'Loosen the leash slightly if you\'ve tightened it.', 'Move toward quieter space if needed.'],
      whatNotToDo: ['Don\'t grip the leash tighter or pull.', 'Avoid talking in a tense or high voice.'],
      signsOfImprovement: 'You remember to breathe in tense moments; your dog responds to your calmer energy.',
    },
    {
      slug: 'right-now-distance',
      title: 'Right now: Create distance',
      shortDescription: 'The single most effective tool when your dog is stressed.',
      whatItLooksLike: 'You turn and walk away from the trigger, or move to the side, until your dog can focus again.',
      whyItHappens: 'Distance reduces pressure. You can\'t train when your dog is over threshold.',
      steps: ['Turn and walk away from the trigger (not backward).', 'Keep moving until your dog can take a treat or look at you.', 'Reward when they re-engage.'],
      whatNotToDo: ['Don\'t stand still and hold the leash tight.', 'Avoid moving toward the trigger.'],
      signsOfImprovement: 'You create distance quickly; your dog learns that distance is always an option.',
    },
    {
      slug: 'right-now-treat-scatter',
      title: 'Right now: Treat scatter',
      shortDescription: 'Use the ground to break fixation and encourage sniffing.',
      whatItLooksLike: 'You scatter a handful of treats on the ground so your dog can sniff and eat.',
      whyItHappens: 'Sniffing is calming. It also breaks eye contact with the trigger and gives your dog something to do.',
      steps: ['Scatter treats on the ground in front of your dog.', 'Let them sniff and eat; use the moment to move away if needed.', 'Keep moving once they\'re done.'],
      whatNotToDo: ['Don\'t force a sit or hand-feed if they\'re too stressed to take from your hand.'],
      signsOfImprovement: 'Your dog re-engages faster after a scatter; you use it before they go over threshold.',
    },
  ],
  progressAware: [
    {
      slug: 'focus-on-basics',
      title: 'Focus on basics',
      shortDescription: 'When progress is early, solid foundations matter most.',
      whatItLooksLike: 'Short, successful sessions on name response, loose leash, and simple cues in low-distraction settings.',
      whyItHappens: 'Building a strong base makes everything else easier. Rushing into hard environments too soon can set progress back.',
      steps: [
        'Practice name and "look" at home and in the yard.',
        'Reward loose leash walking on quiet streets.',
        'Keep sessions short (5–10 min) and end on success.',
      ],
      whatNotToDo: ['Don\'t skip low-distraction practice.', 'Avoid long sessions that lead to frustration.'],
      signsOfImprovement: 'Your dog responds reliably in easy settings; you feel ready to add mild distractions.',
    },
    {
      slug: 'add-mild-distraction',
      title: 'Add mild distraction',
      shortDescription: 'When basics are solid, introduce one distraction at a time.',
      whatItLooksLike: 'Practicing with one distant dog, or one person walking by, at a distance your dog can still focus.',
      whyItHappens: 'Generalizing to real life requires adding difficulty gradually. One variable at a time helps you see what works.',
      steps: [
        'Choose one type of distraction (e.g. person at 50 ft).',
        'Reward every look at you or calm behavior.',
        'Decrease distance only when your dog is successful 80%+ of the time.',
      ],
      whatNotToDo: ['Don\'t add multiple triggers at once.', 'Don\'t move closer on a bad day.'],
      signsOfImprovement: 'Your dog can focus with mild distraction; you know the distance that works.',
    },
  ],
};

/** All tips flattened with section for lookup by slug */
export function getAllTips() {
  const list = [];
  Object.entries(tipsBySection).forEach(([sectionKey, tips]) => {
    tips.forEach((t) => list.push({ ...t, sectionKey }));
  });
  return list;
}

export function getTipBySlug(slug) {
  return getAllTips().find((t) => t.slug === slug) || null;
}

export function getTipsForSection(sectionKey) {
  return tipsBySection[sectionKey] || [];
}
