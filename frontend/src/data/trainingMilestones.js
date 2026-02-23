/**
 * Default behavioral milestones for the goal path checklist.
 * Each can be checked (logged) multiple times with optional notes.
 */

export const DEFAULT_MILESTONES = [
  { id: 'm1', label: 'Noticed a trigger but stayed calm' },
  { id: 'm2', label: 'Checked in with you (look or glance)' },
  { id: 'm3', label: 'Took a treat near a trigger' },
  { id: 'm4', label: 'Stayed calm when trigger passed' },
  { id: 'm5', label: 'Chose to walk away or disengage' },
];

/** Suggestion text for "what to try next" based on next incomplete step index (0-based) */
export const NEXT_STEP_SUGGESTIONS = [
  'Try a short walk where you can spot one trigger at a distance. When they notice it, mark and treat for staying calm.',
  'Reward every time they look at you on their own — even a quick glance. You’re building a “check in” habit.',
  'Practice “treat when they see it”: as soon as they notice the trigger, feed a treat. Keep distance so they can eat.',
  'Set up a pass-by (trigger walks past at safe distance). Reward for staying calm as it goes by.',
  'When they’re ready, let them choose to turn away or move on. Reward that choice — they’re learning to self-regulate.',
];

/** Encouraging message when all steps have at least one win */
export const ALL_STEPS_STARTED = "You've logged wins on every step — keep celebrating the small stuff.";
