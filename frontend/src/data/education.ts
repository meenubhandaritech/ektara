// Plain-language educational content (English). General information only; legal details must be
// confirmed on current official sources. Nothing here promises timelines or outcomes.

export const CARA_URL = 'https://www.wcd.gov.in/prospective-adoptive-parents/cara';
export const CARINGS_URL = 'https://carings.wcd.gov.in/';

export const AUTHORITIES = [
  { abbr: 'CARA', name: 'Central Adoption Resource Authority', role: 'The central government authority that oversees adoption in India and publishes official guidance for in-country and inter-country adoption.' },
  { abbr: 'CARINGS', name: 'Child Adoption Resource Information and Guidance System', role: 'The official portal where adoption registration and processing take place. EKTARA is not connected to it.' },
  { abbr: 'SAA', name: 'Specialised Adoption Agency', role: 'A recognised agency that cares for children and takes part in the official adoption process.' },
  { abbr: 'SARA', name: 'State Adoption Resource Agency', role: 'The state-level body that coordinates adoption work within a state.' },
  { abbr: 'DCPU', name: 'District Child Protection Unit', role: 'A district-level unit working on child protection and related services.' },
  { abbr: 'CWC', name: 'Child Welfare Committee', role: 'A statutory body that makes decisions about the care and protection of children in need.' },
  { abbr: 'AFAA', name: 'Authorised Foreign Adoption Agency', role: 'An agency authorised to work with CARA on inter-country adoption.' },
];

export const PATHWAYS = [
  { id: 'domestic', title: 'Domestic (in-country) adoption', body: 'Adoption by prospective parents who live in India, of a child who is legally free for adoption, through the official system (CARA and CARINGS). Requirements and steps are set by current official regulations.' },
  { id: 'intercountry', title: 'Inter-country adoption', body: 'Adoption by families who live outside India. It usually involves an Authorised Foreign Adoption Agency or the central authority in the family’s country of residence, in addition to Indian authorities.' },
  { id: 'nri-oci', title: 'NRI and OCI considerations', body: 'Whether a family is treated under the in-country or inter-country route can depend on citizenship and residency status. This is a point to confirm directly with CARA, not to assume.' },
  { id: 'relative', title: 'Relative adoption', body: 'Adoption of a relative’s child can follow different provisions than adoption of an unrelated child. A qualified lawyer can say which law applies.' },
  { id: 'stepparent', title: 'Step-parent adoption', body: 'Adoption of a spouse’s child involves specific provisions and consents. It is not the same as adopting an unrelated child.' },
];

export const COMPARISON = [
  { term: 'Legal adoption', meaning: 'A legal process that makes a child permanently part of a family, with the same rights as a biological child. Done only through the lawful, official process.' },
  { term: 'Foster care', meaning: 'Temporary family-based care for a child. It does not create a permanent legal parent–child relationship and is different from adoption.' },
  { term: 'Guardianship', meaning: 'A legal arrangement giving someone responsibility for a child’s care, without making the child their legal child.' },
  { term: 'Relative adoption', meaning: 'Adoption of a relative’s child, which may follow different legal provisions from adopting an unrelated child.' },
  { term: 'Step-parent adoption', meaning: 'Adoption of a spouse’s child, with its own provisions and consents.' },
];

export const GLOSSARY = [
  { term: 'Adoption', meaning: 'A legal process that makes a child a permanent member of a family.' },
  { term: 'Prospective adoptive parent (PAP)', meaning: 'A person or couple who is preparing to adopt and has not yet been legally matched or granted an adoption.' },
  { term: 'Home Study Report (HSR)', meaning: 'An assessment of a family’s circumstances and readiness, prepared by an authorised agency or professional as part of the official process.' },
  { term: 'Referral', meaning: 'The official step in which an approved family is told about a child through the official system. It is never arranged privately.' },
  { term: 'Child legally free for adoption', meaning: 'A child whom the relevant authority has declared eligible for adoption after the required legal steps.' },
  { term: 'Pre-adoption foster care', meaning: 'A period during which a child lives with the prospective family under official supervision before the adoption is finalised. Confirm current rules on official sources.' },
  { term: 'Adoption order', meaning: 'The legal order that finalises an adoption. Which body issues it is set by current law; confirm on official sources.' },
  { term: 'Post-adoption follow-up', meaning: 'Reports and check-ins required after an adoption, as set by official rules.' },
  { term: 'HAMA', meaning: 'The Hindu Adoptions and Maintenance Act, 1956, a personal-law framework that may apply to some families. A lawyer can confirm whether it applies.' },
  { term: 'Juvenile Justice framework', meaning: 'The child-protection law framework under which the official adoption process for children in need of care operates. Read the current text on official sources.' },
];

export interface JourneyStage {
  id: string;
  name: string;
  what: string;
  who: string;
  understand: string;
  prepare: string;
  resourceLabel: string;
  resourceUrl: string;
  routeNote?: string;
}

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'learn',
    name: '1. Learn and reflect',
    what: 'You read about adoption, the official system and what it involves for a family.',
    who: 'You. Official guidance is published by CARA.',
    understand: 'Adoption is a lifelong commitment. Take time to talk as a family and consider counselling if helpful.',
    prepare: 'No documents yet. Read the official guidance and note your questions.',
    resourceLabel: 'CARA guidance',
    resourceUrl: CARA_URL,
  },
  {
    id: 'route',
    name: '2. Understand which route may apply',
    what: 'You find out which official information is relevant to your situation, for example in-country, inter-country, relative or step-parent adoption.',
    who: 'You, with confirmation from CARA or a qualified professional.',
    understand: 'Routes are not interchangeable. EKTARA’s Route Navigator gives preliminary pointers only.',
    prepare: 'Know your citizenship, residency status and your relationship to the child, if any.',
    resourceLabel: 'CARA guidance',
    resourceUrl: CARA_URL,
    routeNote: 'NRI, OCI, foreign-national, relative and step-parent situations can involve different procedures. Confirm the route with CARA or a lawyer.',
  },
  {
    id: 'register',
    name: '3. Official registration',
    what: 'Eligible families register through the official portal and submit what the official process asks for.',
    who: 'You, on CARINGS. Agencies and authorities review through the official workflow.',
    understand: 'Registration and its status exist only on CARINGS. EKTARA cannot register you or show your application status.',
    prepare: 'Gather the documents the official instructions list for your route. EKTARA’s checklist is a preparation aid only.',
    resourceLabel: 'CARINGS portal',
    resourceUrl: CARINGS_URL,
  },
  {
    id: 'hsr',
    name: '4. Home Study Report',
    what: 'An authorised agency or professional assesses the family’s circumstances and readiness.',
    who: 'An authorised agency or professional, as set by the current official process.',
    understand: 'The home study is an assessment to support the child’s welfare. Be open and prepared to share information about your family life.',
    prepare: 'Confirm who conducts it and what they need, using the official sources.',
    resourceLabel: 'CARA guidance',
    resourceUrl: CARA_URL,
  },
  {
    id: 'referral',
    name: '5. Referral through the official system',
    what: 'Approved families are informed of a child through the official referral process.',
    who: 'The official system (CARINGS and the authorised agencies).',
    understand: 'Waiting times vary and cannot be predicted or promised. Never approach children or private intermediaries.',
    prepare: 'Read the official referral guidance and prepare your family emotionally.',
    resourceLabel: 'CARINGS portal',
    resourceUrl: CARINGS_URL,
  },
  {
    id: 'legal',
    name: '6. Legal completion',
    what: 'After the official steps, the adoption is completed through a legal order issued by the body the law specifies.',
    who: 'The competent legal authority, as set by current law, with the agency.',
    understand: 'Confirm the current procedure and the issuing authority on official sources or with a lawyer.',
    prepare: 'Follow the instructions provided through the official process.',
    resourceLabel: 'CARA guidance',
    resourceUrl: CARA_URL,
  },
  {
    id: 'post',
    name: '7. After adoption',
    what: 'The family settles in. Official post-adoption follow-up may be required.',
    who: 'You and the agency or authority, as set by official rules.',
    understand: 'Follow-up requirements are defined by official rules. Support and counselling can help the whole family.',
    prepare: 'Note any follow-up requirements and set reminders in your dashboard.',
    resourceLabel: 'CARA guidance',
    resourceUrl: CARA_URL,
  },
];

export const HOME_FAQ = [
  { q: 'Is EKTARA a government website?', a: 'No. EKTARA is independent. It is not operated or endorsed by the Government of India or CARA.' },
  { q: 'Can EKTARA register me for adoption?', a: 'No. Official registration happens on CARINGS. EKTARA helps you understand and prepare.' },
  { q: 'Can EKTARA match me with a child?', a: 'No. Children are matched only through the official system. EKTARA never lists or shows children.' },
  { q: 'Does EKTARA tell me if I am eligible?', a: 'No. Only the official authorities can. EKTARA gives preliminary information to help you ask the right questions.' },
  { q: 'Does EKTARA store my documents?', a: 'No. The checklist helps you prepare. You do not upload documents.' },
];
