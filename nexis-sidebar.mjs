export const sidebar = [
  {
    label: 'Product',
    items: [
      { label: 'Overview', slug: 'product' },
      { label: 'Stemolly Overview', slug: 'product/overview' },
      { label: 'MVP Scope & PoC', items: [
        { label: 'Overview', slug: 'product/mvp-poc' },
        { label: 'MVP-1 Product Scope', slug: 'product/mvp-poc/mvp-scope' },
        { label: 'Engine-Validation PoC: Design & Boundaries', slug: 'product/mvp-poc/poc-design' },
        { label: 'Running & Deploying the PoC', slug: 'product/mvp-poc/poc-ops' },
      ] },
    ],
  },
  {
    label: 'Mental Model Engine',
    items: [
      { label: 'Overview', slug: 'engine' },
      { label: 'Mental Model Design', slug: 'engine/mental-model' },
      { label: 'Engine Implementation', items: [
        { label: 'Overview', slug: 'engine/engine-impl' },
        { label: 'Event Log and the Evidence Schema', slug: 'engine/engine-impl/event-sourcing-evidence' },
        { label: 'The Three Belief Projectors', slug: 'engine/engine-impl/projectors' },
        { label: 'Node Identity and Alias-Merge', slug: 'engine/engine-impl/node-identity-alias-merge' },
        { label: 'Catalog Entry Lifecycle', slug: 'engine/engine-impl/catalog-lifecycle' },
        { label: 'Hexagonal Structure: Engine-Specific Lessons', slug: 'engine/engine-impl/hexagonal-structure' },
      ] },
      { label: 'Engine Validation', slug: 'engine/engine-validation' },
    ],
  },
  {
    label: 'Pedagogy & Sessions',
    items: [
      { label: 'Overview', slug: 'pedagogy' },
      { label: 'Teaching & Sessions', slug: 'pedagogy/teaching' },
      { label: 'Conversation & Internationalisation', slug: 'pedagogy/conversation' },
    ],
  },
  {
    label: 'System Architecture',
    items: [
      { label: 'Overview', slug: 'architecture' },
      { label: 'Core Architecture', slug: 'architecture/core-arch' },
      { label: 'LLM & Agent Layer', slug: 'architecture/llm-agents' },
      { label: 'Module Structure', slug: 'architecture/module-structure' },
      { label: 'Auth & Security', slug: 'architecture/auth-security' },
      { label: 'API & Transport', slug: 'architecture/api' },
    ],
  },
  {
    label: 'Engineering Practices',
    items: [
      { label: 'Overview', slug: 'engineering' },
      { label: 'Backend & Persistence', slug: 'engineering/backend' },
      { label: 'Testing & Fitness Functions', slug: 'engineering/testing' },
      { label: 'Observability & Resilience', slug: 'engineering/observability' },
    ],
  },
  { label: 'All Topics', slug: 'all-topics' },
];
