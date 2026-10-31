import { store } from './store.js';

/**
 * Seed content. Deliberately conservative:
 *  - Only real, well-known official URLs are used.
 *  - Section/page references are left blank rather than invented.
 *  - Every entry must be re-verified by an administrator before real deployment.
 */
const VERIFIED = '2026-10-31';
const NEXT = '2027-04-30';

export const SOURCES = [
  {
    id: 'cara',
    title: 'CARA — Information for Prospective Adoptive Parents',
    organisation: 'Ministry of Women and Child Development (CARA)',
    sourceType: 'official',
    category: 'Authority',
    url: 'https://www.wcd.gov.in/prospective-adoptive-parents/cara',
    summary: 'The central adoption authority’s page for prospective adoptive parents, with regulations, FAQs and guidance.',
    lastVerified: VERIFIED,
    nextReview: NEXT,
    verificationStatus: 'seeded-needs-admin-verification',
  },
  {
    id: 'carings',
    title: 'CARINGS — Official Adoption Portal',
    organisation: 'Government of India (MWCD / CARA)',
    sourceType: 'official',
    category: 'Portal',
    url: 'https://carings.wcd.gov.in/',
    summary: 'The official portal where adoption registration and processing take place. EKTARA does not replace or connect to it.',
    lastVerified: VERIFIED,
    nextReview: NEXT,
    verificationStatus: 'seeded-needs-admin-verification',
  },
  {
    id: 'mwcd',
    title: 'Ministry of Women and Child Development',
    organisation: 'Ministry of Women and Child Development',
    sourceType: 'official',
    category: 'Ministry',
    url: 'https://www.wcd.gov.in/',
    summary: 'The central ministry under which CARA functions. Official notices, acts and contact details are published here.',
    lastVerified: VERIFIED,
    nextReview: NEXT,
    verificationStatus: 'seeded-needs-admin-verification',
  },
  {
    id: 'foj',
    title: 'Families of Joy — Adoption awareness and support',
    organisation: 'Families of Joy (NGO)',
    sourceType: 'educational',
    category: 'Awareness & support',
    url: 'https://familiesofjoy.org/',
    summary: 'An NGO offering awareness and support material. General educational resource — not law and not an adoption authority.',
    lastVerified: VERIFIED,
    nextReview: NEXT,
    verificationStatus: 'seeded-needs-admin-verification',
  },
];

const base = {
  status: 'published',
  version: 1,
  language: 'en',
  section: '',
  effectiveDate: '',
  lastReviewed: VERIFIED,
  reviewer: 'seed (pending admin review)',
  updatedAt: VERIFIED,
};

export const ARTICLES = [
  {
    id: 'what-is-cara',
    title: 'What is CARA?',
    keywords: ['cara', 'central adoption resource authority', 'authority'],
    content:
      'CARA (Central Adoption Resource Authority) is the central government body under the Ministry of Women and Child Development that oversees adoption in India. It is the official authority for in-country and inter-country adoption of Indian children.',
    sourceId: 'cara',
    documentName: 'CARA — Prospective Adoptive Parents page',
    ...base,
  },
  {
    id: 'what-is-carings',
    title: 'What is CARINGS?',
    keywords: ['carings', 'portal', 'register', 'registration'],
    content:
      'CARINGS (Child Adoption Resource Information and Guidance System) is the official government portal used for adoption registration and processing. Prospective parents register and proceed through official steps there. EKTARA is independent and cannot access or change anything in CARINGS.',
    sourceId: 'carings',
    documentName: 'CARINGS portal',
    ...base,
  },
  {
    id: 'begin-adoption',
    title: 'How do I begin adoption in India?',
    keywords: ['begin', 'start', 'how to adopt', 'first step', 'process'],
    content:
      'A good first step is to learn the basics and read the official guidance on the CARA website. Official registration and processing are done through the CARINGS portal. Requirements can differ by route (for example in-country, inter-country, relative or step-parent), so check the current official instructions for your situation and ask the relevant authority or a qualified professional if unsure.',
    sourceId: 'cara',
    documentName: 'CARA — Prospective Adoptive Parents page',
    ...base,
  },
  {
    id: 'hsr',
    title: 'What is a Home Study Report (HSR)?',
    keywords: ['home study', 'hsr', 'home study report', 'who conducts'],
    content:
      'A Home Study Report is an assessment of a prospective adoptive family’s circumstances and readiness, prepared by an authorised agency or professional as part of the official process. The exact responsibilities, steps and timing are set by current official regulations, so confirm them on the CARA website or through CARINGS rather than relying on a summary.',
    sourceId: 'cara',
    documentName: 'CARA — Prospective Adoptive Parents page',
    ...base,
  },
  {
    id: 'authorities',
    title: 'SAA, SARA, DCPU, CWC and AFAA — who is who?',
    keywords: ['saa', 'sara', 'dcpu', 'cwc', 'afaa', 'agency', 'authorised', 'authorized'],
    content:
      'SAA: Specialised Adoption Agency, an agency recognised to place children for adoption. SARA: State Adoption Resource Agency, the state-level body. DCPU: District Child Protection Unit, working at district level. CWC: Child Welfare Committee, which decides on the care and protection of children in need. AFAA: Authorised Foreign Adoption Agency, relevant to inter-country adoption. To find a recognised agency, use the official CARA/CARINGS listings; do not rely on unofficial lists.',
    sourceId: 'cara',
    documentName: 'CARA — Prospective Adoptive Parents page',
    ...base,
  },
  {
    id: 'domestic-vs-intercountry',
    title: 'Domestic and inter-country adoption',
    keywords: ['domestic', 'inter-country', 'intercountry', 'nri', 'oci', 'foreign', 'difference'],
    content:
      'In-country (domestic) adoption and inter-country adoption follow different official routes. Which one may be relevant depends on factors such as where the family lives and citizenship or residency status. NRI, OCI and foreign-national applicants should read the current official guidance and, where unsure, ask CARA or a qualified professional. EKTARA cannot decide which route applies to you.',
    sourceId: 'cara',
    documentName: 'CARA — Prospective Adoptive Parents page',
    ...base,
  },
  {
    id: 'relative-stepparent',
    title: 'Relative and step-parent adoption',
    keywords: ['relative', 'step-parent', 'stepparent', 'stepchild', 'hama', 'family member'],
    content:
      'Adoption by a relative or a step-parent can involve different legal provisions than adoption of an unrelated child, and may involve personal-law routes (such as HAMA for eligible Hindu families) or the Juvenile Justice framework depending on the situation. These are not interchangeable procedures. Ask a qualified lawyer or the relevant authority, and read the current official guidance.',
    sourceId: 'cara',
    documentName: 'CARA — Prospective Adoptive Parents page',
    ...base,
  },
  {
    id: 'documents',
    title: 'Which documents should I understand before registering?',
    keywords: ['documents', 'checklist', 'papers', 'what do i need'],
    content:
      'Official registration typically asks for identity, address, and other supporting documents, but the exact list depends on your route and the current official instructions. EKTARA’s checklist is only a preparation aid. Always confirm the current requirements on CARINGS or with the relevant authority.',
    sourceId: 'carings',
    documentName: 'CARINGS portal',
    ...base,
  },
  {
    id: 'find-agency',
    title: 'Where can I find an authorised adoption agency?',
    keywords: ['find agency', 'authorised agency', 'authorized', 'saa list', 'where'],
    content:
      'Use the official CARA and CARINGS resources to find recognised agencies and authorities. Be cautious about anyone offering a child outside the official system. Private arrangements to obtain a child are not part of the legal process.',
    sourceId: 'cara',
    documentName: 'CARA — Prospective Adoptive Parents page',
    ...base,
  },
];

export const FAQS = ARTICLES.map((a) => ({ id: a.id, question: a.title, answer: a.content, sourceId: a.sourceId }));

export async function seedPublicContent() {
  for (const s of SOURCES) await store.set(`officialSources/${s.id}`, s);
  for (const a of ARTICLES) await store.set(`knowledgeArticles/${a.id}`, a);
  for (const f of FAQS) await store.set(`faqs/${f.id}`, f);
}
