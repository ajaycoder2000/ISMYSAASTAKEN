export type FounderStage = 'exploring' | 'has_idea' | 'building' | 'launched';
export type ValidationExp = 'never' | 'informal' | 'proper';
export type MainWorry = 'already_built' | 'no_search' | 'name_taken' | 'brutal_honesty';
export type BuildingType = 'saas' | 'mobile' | 'ai' | 'unsure';
export type DecisionTimeline = 'this_week' | 'this_month' | 'curious';

export interface Answers {
  stage: FounderStage;
  validated: ValidationExp;
  worry: MainWorry;
  building: BuildingType;
  timeline: DecisionTimeline;
}

export interface QuizQuestion<K extends keyof Answers> {
  id: K;
  title: string;
  subtitle: string;
  options: {
    label: string;
    value: Answers[K];
    icon?: string;
  }[];
}

export const QUESTIONS: [
  QuizQuestion<'stage'>,
  QuizQuestion<'validated'>,
  QuizQuestion<'worry'>,
  QuizQuestion<'building'>,
  QuizQuestion<'timeline'>
] = [
  {
    id: 'stage',
    title: 'Where are you in your founder journey?',
    subtitle: 'Helps us tailor validation advice to your current phase',
    options: [
      { label: 'Just exploring ideas', value: 'exploring', icon: '🧭' },
      { label: "Have an idea, haven't built it", value: 'has_idea', icon: '💡' },
      { label: 'Building right now', value: 'building', icon: '🛠️' },
      { label: 'Already launched something', value: 'launched', icon: '🚀' },
    ],
  },
  {
    id: 'validated',
    title: 'Have you validated an idea before?',
    subtitle: 'Helps us understand your validation experience',
    options: [
      { label: 'Never', value: 'never', icon: '🌱' },
      { label: 'Asked friends and family', value: 'informal', icon: '👥' },
      { label: 'Yes, properly with market data', value: 'proper', icon: '📈' },
    ],
  },
  {
    id: 'worry',
    title: 'What worries you most about your idea?',
    subtitle: 'Decides which validation tool we recommend first',
    options: [
      { label: 'Someone already built it', value: 'already_built', icon: '⚔️' },
      { label: 'Nobody is searching for it', value: 'no_search', icon: '🔍' },
      { label: 'My name or domain might be taken', value: 'name_taken', icon: '🏷️' },
      { label: 'I just want brutal honesty', value: 'brutal_honesty', icon: '🔥' },
    ],
  },
  {
    id: 'building',
    title: 'What are you building?',
    subtitle: 'Helps configure the competitor telemetry radar',
    options: [
      { label: 'SaaS or web app', value: 'saas', icon: '💻' },
      { label: 'Mobile app', value: 'mobile', icon: '📱' },
      { label: 'AI tool or agent', value: 'ai', icon: '🤖' },
      { label: 'Not sure yet', value: 'unsure', icon: '✨' },
    ],
  },
  {
    id: 'timeline',
    title: 'When do you want to decide on your idea?',
    subtitle: 'Determines the right pace and recommended toolkit',
    options: [
      { label: 'This week (urgent decision)', value: 'this_week', icon: '⚡' },
      { label: 'This month (steady discovery)', value: 'this_month', icon: '🗓️' },
      { label: 'Just curious (exploratory)', value: 'curious', icon: '🔭' },
    ],
  },
];

export const PROFILE_NAMES: Record<FounderStage, string> = {
  exploring: 'The Explorer',
  has_idea: 'The Idea Holder',
  building: 'The Builder',
  launched: 'The Repeat Founder',
};

export const TOOL_FOR_WORRY: Record<
  MainWorry,
  { name: string; href: string; actionText: string; desc: string; icon: string }
> = {
  already_built: {
    name: 'Idea Scanner',
    href: '/#scan-form',
    actionText: 'Scan Competitors & Gaps →',
    desc: 'Deep real-time competitor intelligence & whitespace gap discovery.',
    icon: '⚡',
  },
  no_search: {
    name: 'SaaS Keyword Radar',
    href: '/keywords',
    actionText: 'Check Search Demand →',
    desc: 'Verify if people are actually searching for your solution before building.',
    icon: '🔍',
  },
  name_taken: {
    name: 'Is It Taken?',
    href: '/is-it-taken',
    actionText: 'Check Domain & Handles →',
    desc: 'Instant RDAP registry lookup and social handle availability verification.',
    icon: '🏷️',
  },
  brutal_honesty: {
    name: 'Idea Roast Mode',
    href: '/roast',
    actionText: 'Get Concept Roasted →',
    desc: 'Uncompromising critique exposing fatal assumptions and blind spots.',
    icon: '🔥',
  },
};

export function getSummarySentence(a: Answers): string {
  if (a.validated === 'never') {
    return "Most first-time founders skip validation. That's the #1 reason startups fail. You're already ahead by checking.";
  }
  if (a.validated === 'informal') {
    return 'Friends and family are great for encouragement, but only market data tells the truth. Real validation protects your runway.';
  }
  return "You know validation is a habit, not a one-off. Let's make this scan fast and thorough so you can build with confidence.";
}

export function suggestPlan(a: Answers): 'sprint_pass' | 'founder_pro' | 'free' {
  if (a.timeline === 'this_week') return 'sprint_pass';
  if (a.stage === 'launched' || a.timeline === 'this_month') return 'founder_pro';
  return 'free';
}
