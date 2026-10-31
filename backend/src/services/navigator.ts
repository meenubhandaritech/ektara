export const DISCLAIMER =
  'Preliminary informational guidance — not an official eligibility determination or legal opinion.';

export type RouteId =
  | 'in-country-resident'
  | 'nri'
  | 'oci'
  | 'foreign'
  | 'relative'
  | 'step-parent'
  | 'hama'
  | 'unsure';

export interface NavigatorAnswers {
  residence: 'india' | 'abroad' | 'unsure';
  status: 'resident-indian' | 'nri' | 'oci' | 'foreign' | 'unsure';
  relationship: 'unrelated' | 'relative' | 'stepchild' | 'unsure';
  focus: 'general' | 'hama' | 'unsure';
  knowsCaraCarings: 'yes' | 'no' | 'unsure';
}

export interface ChecklistTemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  sourceId: string;
}

export interface Guidance {
  route: RouteId;
  confident: boolean;
  routeTitle: string;
  summary: string;
  frameworks: string[];
  considerations: string[];
  authorities: string[];
  nextSteps: string[];
  sourceIds: string[];
  seekProfessionalHelp: boolean;
  disclaimer: string;
}

/**
 * Picks the information most likely to be relevant. This NEVER determines eligibility
 * or a legal route with certainty — relationship and personal-law answers take precedence
 * only for deciding which *information* to show first.
 */
export function pickRoute(a: NavigatorAnswers): RouteId {
  if (a.relationship === 'stepchild') return 'step-parent';
  if (a.relationship === 'relative') return 'relative';
  if (a.focus === 'hama') return 'hama';
  if (a.status === 'oci') return 'oci';
  if (a.status === 'nri') return 'nri';
  if (a.status === 'foreign') return 'foreign';
  if (a.status === 'resident-indian' && a.relationship === 'unrelated') return 'in-country-resident';
  return 'unsure';
}

const COMMON_NEXT = [
  'Read the current guidance on the official CARA website.',
  'Review how official registration works on the CARINGS portal.',
  'Confirm current requirements for your situation with the relevant authority.',
];

const GUIDES: Record<RouteId, Omit<Guidance, 'route' | 'confident' | 'disclaimer'>> = {
  'in-country-resident': {
    routeTitle: 'In-country adoption of an unrelated child (information to explore)',
    summary:
      'For residents of India considering adopting an unrelated child, the official in-country adoption route through CARA and CARINGS is the information most likely to be relevant.',
    frameworks: ['Adoption Regulations, 2022 (CARA)', 'Juvenile Justice framework — confirm current provisions on official sources'],
    considerations: [
      'Official registration and processing happen on CARINGS, not on EKTARA.',
      'Requirements and steps are set by current official regulations — always confirm them.',
      'Do not approach children or private intermediaries; only the official system is lawful.',
    ],
    authorities: ['CARA', 'SARA', 'DCPU', 'Specialised Adoption Agency (SAA)', 'Child Welfare Committee (CWC)'],
    nextSteps: COMMON_NEXT,
    sourceIds: ['cara', 'carings'],
    seekProfessionalHelp: false,
  },
  nri: {
    routeTitle: 'NRI applicant (information to explore)',
    summary:
      'Applicants who live abroad may be treated differently from residents of India. Which route applies depends on current official rules and your exact status.',
    frameworks: ['Adoption Regulations, 2022 (CARA) — sections on applicants living abroad; confirm on official sources'],
    considerations: [
      'Your exact citizenship, residency and country of residence matter and can change the route.',
      'Inter-country procedures may involve an Authorised Foreign Adoption Agency (AFAA) or the central authority of your country of residence.',
      'Ask CARA to confirm which route applies to you.',
    ],
    authorities: ['CARA', 'Authorised Foreign Adoption Agency (AFAA), if applicable', 'Central authority of your country of residence'],
    nextSteps: [...COMMON_NEXT, 'Ask CARA which route applies to your status.'],
    sourceIds: ['cara', 'carings'],
    seekProfessionalHelp: true,
  },
  oci: {
    routeTitle: 'OCI cardholder (information to explore)',
    summary:
      'OCI status can affect how official rules apply. EKTARA cannot say which route applies to you.',
    frameworks: ['Adoption Regulations, 2022 (CARA) — check how OCI status is treated in current official guidance'],
    considerations: [
      'Treatment of OCI applicants is defined in official regulations and instructions — verify the current position.',
      'Your country of residence may add its own requirements.',
    ],
    authorities: ['CARA', 'Authorised Foreign Adoption Agency (AFAA), if applicable'],
    nextSteps: [...COMMON_NEXT, 'Ask CARA how OCI status is treated for your situation.'],
    sourceIds: ['cara', 'carings'],
    seekProfessionalHelp: true,
  },
  foreign: {
    routeTitle: 'Foreign national (information to explore)',
    summary:
      'Inter-country adoption procedures are different from in-country adoption and usually involve authorities in your country of residence.',
    frameworks: ['Adoption Regulations, 2022 (CARA) — inter-country provisions; confirm on official sources'],
    considerations: [
      'Contact the central authority or accredited agency in your own country first.',
      'Only official channels can process an inter-country adoption.',
    ],
    authorities: ['Central authority of your country of residence', 'Authorised Foreign Adoption Agency (AFAA)', 'CARA'],
    nextSteps: [...COMMON_NEXT, 'Contact the adoption authority in your country of residence.'],
    sourceIds: ['cara', 'carings'],
    seekProfessionalHelp: true,
  },
  relative: {
    routeTitle: 'Adoption of a relative’s child (information to explore)',
    summary:
      'Adopting a relative’s child can follow different legal provisions than adopting an unrelated child. These routes are not interchangeable.',
    frameworks: [
      'Adoption Regulations, 2022 — check provisions on relative adoption',
      'Personal-law provisions (e.g. HAMA for eligible Hindu families) — a lawyer can confirm applicability',
    ],
    considerations: [
      'Which law applies can depend on religion, the relationship and the child’s circumstances.',
      'Legal advice is strongly recommended before taking any step.',
    ],
    authorities: ['CARA', 'Court / legal professional', 'DCPU'],
    nextSteps: [...COMMON_NEXT, 'Consult a qualified family lawyer about which provisions apply.'],
    sourceIds: ['cara', 'carings'],
    seekProfessionalHelp: true,
  },
  'step-parent': {
    routeTitle: 'Step-parent adoption (information to explore)',
    summary:
      'Adopting a spouse’s child involves specific provisions and consents. It should not be treated like adoption of an unrelated child.',
    frameworks: [
      'Adoption Regulations, 2022 — check provisions on step-parent adoption',
      'Personal-law provisions where relevant — confirm with a lawyer',
    ],
    considerations: [
      'Consents and family circumstances matter and vary by case.',
      'Legal advice is strongly recommended.',
    ],
    authorities: ['CARA', 'Court / legal professional'],
    nextSteps: [...COMMON_NEXT, 'Consult a qualified family lawyer about step-parent provisions.'],
    sourceIds: ['cara', 'carings'],
    seekProfessionalHelp: true,
  },
  hama: {
    routeTitle: 'HAMA-related question (information to explore)',
    summary:
      'The Hindu Adoptions and Maintenance Act (HAMA) is a personal-law framework that may apply in some situations. Whether it applies to you is a legal question.',
    frameworks: ['Hindu Adoptions and Maintenance Act, 1956 — read the official text', 'Juvenile Justice framework (comparison)'],
    considerations: [
      'HAMA and the Juvenile Justice framework are different routes; they are not interchangeable.',
      'A lawyer should confirm whether HAMA applies to your circumstances.',
    ],
    authorities: ['Court / legal professional', 'CARA'],
    nextSteps: [...COMMON_NEXT, 'Consult a lawyer about HAMA applicability.'],
    sourceIds: ['cara', 'mwcd'],
    seekProfessionalHelp: true,
  },
  unsure: {
    routeTitle: 'General adoption information',
    summary:
      'Some answers were uncertain, so EKTARA is showing general starting points rather than a specific route. That is perfectly fine — the official sources can help you narrow it down.',
    frameworks: ['Start with the CARA guidance for prospective adoptive parents'],
    considerations: [
      'Learn the basics first; you do not need to choose a route today.',
      'If your situation is unusual, seek help from CARA or a qualified professional.',
    ],
    authorities: ['CARA', 'SARA', 'DCPU'],
    nextSteps: COMMON_NEXT,
    sourceIds: ['cara', 'carings'],
    seekProfessionalHelp: true,
  },
};

export function guide(a: NavigatorAnswers): Guidance {
  const route = pickRoute(a);
  const g = GUIDES[route];
  const unsureCount = [a.residence, a.status, a.relationship, a.focus].filter((v) => v === 'unsure').length;
  return {
    route,
    confident: false, // never claim certainty from a short questionnaire
    ...g,
    seekProfessionalHelp: g.seekProfessionalHelp || unsureCount > 1,
    disclaimer: DISCLAIMER,
  };
}

const VERIFY = ' Confirm against the current official instructions before relying on this item.';

const COMMON_ITEMS: ChecklistTemplateItem[] = [
  { id: 'identity', category: 'Identity documentation', title: 'Identity proof', description: 'Identify which identity documents the official process asks for.' + VERIFY, sourceId: 'carings' },
  { id: 'address', category: 'Address documentation', title: 'Address proof', description: 'Identify which address proofs are accepted.' + VERIFY, sourceId: 'carings' },
  { id: 'marital', category: 'Marriage / legal documentation', title: 'Marriage or other applicable legal documents', description: 'Check whether documents about marital or legal status apply to you.' + VERIFY, sourceId: 'cara' },
  { id: 'financial', category: 'Financial documentation', title: 'Financial documents', description: 'Check what financial documentation is asked for, if any.' + VERIFY, sourceId: 'carings' },
  { id: 'medical', category: 'Medical documentation', title: 'Medical documentation', description: 'Check what medical documentation is required, and from whom.' + VERIFY, sourceId: 'cara' },
  { id: 'photos', category: 'Family photographs', title: 'Family photographs', description: 'Check photograph requirements.' + VERIFY, sourceId: 'carings' },
];

const EXTRA: Partial<Record<RouteId, ChecklistTemplateItem[]>> = {
  nri: [
    { id: 'status-proof', category: 'Route-specific', title: 'Proof of citizenship and residence status', description: 'Understand what documents show your status and country of residence.' + VERIFY, sourceId: 'cara' },
    { id: 'foreign-auth', category: 'Route-specific', title: 'Understand foreign authority requirements', description: 'Find out what the authority in your country of residence requires.' + VERIFY, sourceId: 'cara' },
  ],
  oci: [
    { id: 'oci-card', category: 'Route-specific', title: 'OCI documentation', description: 'Understand how OCI status is documented and treated.' + VERIFY, sourceId: 'cara' },
  ],
  foreign: [
    { id: 'foreign-auth', category: 'Route-specific', title: 'Contact authority in your country', description: 'Find out what the central authority or accredited agency requires.' + VERIFY, sourceId: 'cara' },
  ],
  relative: [
    { id: 'relationship', category: 'Route-specific', title: 'Documents showing the family relationship', description: 'Ask a lawyer what is needed.' + VERIFY, sourceId: 'cara' },
  ],
  'step-parent': [
    { id: 'spouse-link', category: 'Route-specific', title: 'Documents relating to the child’s parent and consents', description: 'Ask a lawyer what is needed.' + VERIFY, sourceId: 'cara' },
  ],
  hama: [
    { id: 'hama-legal', category: 'Route-specific', title: 'Legal advice on HAMA applicability', description: 'Speak to a lawyer; read the official text of the Act.' + VERIFY, sourceId: 'mwcd' },
  ],
};

export function checklistFor(route: RouteId): ChecklistTemplateItem[] {
  return [...COMMON_ITEMS, ...(EXTRA[route] ?? [])];
}

export const MILESTONES = [
  { id: 'learn', title: 'Learning about adoption' },
  { id: 'route', title: 'Understanding the applicable route' },
  { id: 'requirements', title: 'Reviewing preliminary requirements' },
  { id: 'registration', title: 'Understanding official registration' },
  { id: 'documents', title: 'Preparing documentation' },
  { id: 'hsr', title: 'Understanding the Home Study Report process' },
  { id: 'referral', title: 'Accessing official referral-process guidance' },
  { id: 'post-referral', title: 'Understanding post-referral procedures' },
  { id: 'post-adoption', title: 'Understanding post-adoption responsibilities' },
] as const;
