// Single source of truth for Dinesh's career facts.
// Used by the detailed resume PDF and by the tailored-resume agents, which may
// only reword/reorder what is here — never add facts that are not in this file.

export interface ProfileJob {
  id: string;
  role: string;
  company: string;
  period: string;
  context: string;
  bullets: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export const PROFILE = {
  name: 'Dinesh Kumar',
  contact: 'Bengaluru, India | +91 9560163362 | +91 8448724187 | dinesh.kumar.199998888@gmail.com | Open to Remote / Relocate',
  totalExperience: '8+ years (Dec 2017 - Oct 2025)',

  summary: [
    'Senior Full-Stack Engineer and Technical Lead with 8+ years building production-grade systems across institutional banking, fintech, education technology, AI automation, healthcare, e-commerce, government technology, retail, and marketplace products. Brings the combination hiring teams look for: hands-on TypeScript/React/NestJS depth, cloud-native architecture judgment, caching and performance optimization, ownership of ambiguous business workflows, and the maturity to lead engineers through design, delivery, observability, and production support.',
    'Project experience includes a freelance institutional banking engagement for Commonwealth Bank of Australia, enterprise AI automation with Zengines AI, education workflows for PCG, fintech journeys for LendingPoint and InKind, Google Gemini model-quality work, and multiple commerce, healthcare, pharmacy, evidence-management, marketplace, tax, mobile retail, and GPS tracking products.',
  ],

  skills: [
    { label: 'Languages', items: ['TypeScript', 'JavaScript ES2022+', 'Java', 'Python', 'SQL', 'HTML5', 'CSS3/SCSS'] },
    { label: 'Frontend', items: ['React.js', 'Next.js', 'Redux', 'Redux Toolkit', 'Zustand', 'React Query', 'React Native', 'Angular', 'Vue.js', 'Context API', 'Mantine UI', 'Material UI', 'Webpack', 'Babel', 'responsive design', 'cross-browser compatibility', 'LaunchDarkly'] },
    { label: 'Backend', items: ['Node.js', 'NestJS', 'Express.js', 'Spring Boot', 'REST', 'GraphQL', 'WebSockets', 'Kafka', 'Temporal', 'RabbitMQ', 'API security', 'payload encryption', 'Redis caching'] },
    { label: 'Cloud and DevOps', items: ['AWS ECS', 'EC2', 'S3', 'Lambda', 'SQS', 'SNS', 'ALB', 'CloudWatch', 'IAM', 'Docker', 'Kubernetes', 'Helm', 'Vercel', 'Git', 'version control', 'CI/CD', 'GitHub Actions', 'Jenkins', 'HashiCorp Vault'] },
    { label: 'Databases and Search', items: ['MySQL', 'PostgreSQL', 'JSONB', 'MongoDB', 'Redis', 'Elasticsearch', 'schema design', 'query optimization', 'indexing strategies', 'cache invalidation'] },
    { label: 'Observability and Quality', items: ['Grafana', 'Prometheus', 'PagerDuty', 'Observe', 'Sentry', 'Loggly', 'OpenTelemetry concepts', 'Jest', 'React Testing Library', 'Enzyme', 'debugging', 'Postman', 'Swagger'] },
    { label: 'Architecture and AI', items: ['Microservices', 'event-driven systems', 'workflow orchestration', 'caching strategies', 'HLD', 'LLD', 'SOLID', 'DDD', 'CQRS', 'RAG pipelines', 'Claude Skills', 'agentic AI', 'Spec-Kit', 'LLMs', 'multi-agent systems', 'LangChain', 'LangGraph', 'LangSmith', 'prompt engineering'] },
  ] as SkillGroup[],

  employment: [
    { role: 'Team Lead / Senior Software Engineer', company: 'Nous Infosystems (Client: Commonwealth Bank of Australia)', period: 'Apr 2024 - Oct 2025' },
    { role: 'Full-Stack Engineer / Team Lead', company: 'Trantor Software Pvt. Ltd.', period: 'Mar 2022 - Apr 2024' },
    { role: 'Software Engineer', company: 'Recrosoft / CartNYou / IZACCESS', period: 'Dec 2017 - Feb 2022' },
  ],

  jobs: [
    {
      id: 'cba',
      role: 'Freelance Team Lead / Senior Software Engineer',
      company: 'Commonwealth Bank of Australia - Institutional Banking',
      period: 'Freelance engagement - approx. 10 months',
      context: 'Institutional banking platform for complex corporate banking journeys, long-running business processes, regulatory-grade reliability, and high-value client workflows.',
      bullets: [
        'Designed event-driven NestJS microservices with Kafka for asynchronous messaging and Temporal for durable workflow orchestration, retries, compensation paths, and failure recovery.',
        'Built React and Next.js customer-facing journeys with Redux Toolkit for API-heavy state management and predictable data flows.',
        'Contributed Java/Spring Boot integrations, MySQL data modeling, caching/performance strategy, AWS ECS/S3/ALB/CloudWatch deployment paths, CI/CD pipelines, and HashiCorp Vault secret patterns.',
        'Built Python automation, RAG pipelines, Claude Skills, and Spec-Kit style workflows to convert requirements into structured technical design and implementation plans.',
        'Set up observability and operating practices with Grafana, Prometheus, PagerDuty, Observe/Obstack, ServiceNow, DHP, health checks, runbooks, and incident support.',
        'Owned HLD/LLD, API design, workflow architecture, caching decisions, performance optimization, secure coding, code review, sprint collaboration, and production readiness.',
      ],
    },
    {
      id: 'portfolio',
      role: 'Creator - AI Multi-Agent Resume Platform (Personal Project)',
      company: 'dineshkumar.dev Portfolio',
      period: 'Personal project - 2026',
      context: 'Public portfolio with an LLM-powered multi-agent system that reads a job posting and generates a job-tailored, fact-checked resume PDF delivered by email.',
      bullets: [
        'Built a LangGraph multi-agent pipeline (job scout, JD analyst, fit assessor, parallel summary/skills/experience writers, ATS fact-checking reviewer, editor) using LangChain with Claude, Gemini and Groq LLMs and provider fallbacks.',
        'Implemented LLM structured outputs with Zod schemas, prompt engineering, guardrails against hallucinated claims, and LangSmith tracing for observability of every agent run.',
        'Designed a job-fit scoring model combining priority-weighted skill matching with TF-IDF cosine similarity, plus LLM-based semantic skill matching verified against source data.',
        'Built job-ingestion data pipelines from LinkedIn and Naukri APIs, JSON-LD extraction and scraping APIs (Apify, ScraperAPI) with SSRF protection, rate-limit retries and graceful fallbacks.',
        'Shipped on Next.js 14 and TypeScript with streaming NDJSON APIs, email OTP verification with signed tokens, jsPDF rendering, Vercel serverless deployment and GitHub Actions CI/CD.',
      ],
    },
    {
      id: 'pcg',
      role: 'Full-Stack Engineer / Team Lead',
      company: 'PCG Education',
      period: 'Contract - 18 months',
      context: 'K-12 special education and Medicaid reimbursement platform used by US school districts.',
      bullets: [
        'Led a 6-engineer team for 18 months, balancing delivery planning, code reviews, client demos, estimation, and hands-on implementation.',
        'Built case-management, reimbursement, user workflow, and reporting experiences using React, NestJS, MySQL, and PostgreSQL JSONB.',
        'Designed scalable REST/GraphQL APIs, microservices, SQL schemas, caching-friendly read paths, middleware security, API contracts, LLD/HLD artifacts, AWS deployment support, and Jira/Postman delivery workflows.',
        'Improved maintainability through modular APIs, reusable UI patterns, testable service boundaries, and clear acceptance criteria.',
      ],
    },
    {
      id: 'lendingpoint',
      role: 'Full-Stack Engineer',
      company: 'LendingPoint',
      period: 'Project engagement - 1 year',
      context: 'Fintech lending platform with merchant-customer communication and loan journey workflows.',
      bullets: [
        'Delivered React web and React Native mobile features with Redux-driven state management.',
        'Built WebSocket-powered real-time communication for live negotiation and customer support journeys.',
        'Implemented NestJS middleware for encrypted API payload handling, API logging with Loggly, AWS CloudWatch monitoring, config-driven flows, and production issue support.',
        'Created loan-module APIs using Node.js, MongoDB, MySQL, caching-aware service patterns, and microservices; designed transactional loyalty rewards to encourage timely repayments and product usage.',
      ],
    },
    {
      id: 'zengines',
      role: 'Full-Stack Engineer / Team Lead',
      company: 'Zengines AI',
      period: 'Project engagement - 6 months',
      context: 'Enterprise AI data automation platform for onboarding, transformation, validation, and integration of large-volume business data.',
      bullets: [
        'Built React, Next.js, React Native, Node.js, NestJS, Vue.js, Zustand, Mantine UI, React Query, and LaunchDarkly powered product workflows.',
        'Used Docker, Kubernetes, AWS EC2/S3/SQS/SNS/Lambda/CloudWatch, MySQL, caching/performance tuning, Sentry, Jest, RTL, HLD, LLD, and DSA to improve stability and delivery quality.',
        'Handled task planning, PR reviews, safe merges, client communication, requirement gathering, reusable component design, API development, and team coordination.',
      ],
    },
    {
      id: 'gemini',
      role: 'AI Model Quality Trainer',
      company: 'Google Gemini',
      period: 'Contract - 6 months',
      context: 'Multimodal AI model-quality engagement focused on improving response accuracy, contextual behavior, and responsible AI outcomes.',
      bullets: [
        'Analyzed model outputs, curated datasets, identified response inaccuracies, and suggested data/process improvements for text, image, audio reasoning, and multilingual tasks.',
        'Supported feedback-loop design, performance monitoring, contextual adaptation, developer collaboration, scalable training processes, and bias mitigation practices.',
        'Applied strong frontend/backend product context from React, React Native, Node.js, NestJS, Next.js, Angular, Vue.js, Redux, and MySQL while evaluating AI behavior.',
      ],
    },
    {
      id: 'inkind',
      role: 'Full-Stack Engineer',
      company: 'InKind',
      period: 'Contract - 4 months',
      context: 'Restaurant capital platform where customers buy pre-purchased dining credit and redeem it across participating restaurants.',
      bullets: [
        'Built React and React Native experiences with Redux, React Query, reusable components, routing, API integration, and responsive UI implementation.',
        'Worked on Node.js/NestJS middleware, encryption/decryption for API data, MySQL-backed services, AWS CloudWatch monitoring, S3/EC2/serverless support, and logging.',
        'Implemented loyalty program flows to reward customer engagement and repeat purchases while supporting production fixes, code reviews, optimization, unit testing, and agile delivery.',
      ],
    },
    {
      id: 'curefit',
      role: 'Full-Stack Engineer',
      company: 'CureFit',
      period: 'Project engagement - 6 months',
      context: 'Health and fitness platform with internal program-management tools and microservice-backed offers workflows.',
      bullets: [
        'Developed React, Angular, JavaScript, Node.js, NestJS, MongoDB, MySQL, Redux, React Native, and microservice-based application features.',
        'Built internal tooling for newly launched programs, eligibility-based display logic, backend endpoints, and offers-module APIs using NestJS and MongoDB.',
        'Handled requirement analysis, scope review, Jest/Enzyme tests, unit testing, maintenance, agile delivery, and production issue support.',
      ],
    },
    {
      id: 'trackwick',
      role: 'Full-Stack Engineer',
      company: 'Trackwick',
      period: 'Project engagement - 6 months',
      context: 'Real-time employee activity and GPS tracking product for field-force coordination and workforce visibility.',
      bullets: [
        'Created React UI components, frontend API calls, Node.js/MongoDB APIs, user registration, authorization, and authentication workflows.',
        'Worked with JavaScript, Java, Angular, React Native, AWS, MySQL, MongoDB, HTML, CSS, Postman, Jira, and client support workflows.',
        'Supported agile delivery, issue resolution, unit testing, application maintenance, and functionality support for client teams.',
      ],
    },
    {
      id: 'landmark',
      role: 'Full-Stack Engineer',
      company: 'Landmark / MaxFashion',
      period: 'Project engagement - 6 months',
      context: 'Large UAE e-commerce ecosystem across six territories and two languages, including category-led commerce platforms.',
      bullets: [
        'Added features, fixed bugs, created reusable components, handled routing, integrated APIs, and improved page-load performance.',
        'Worked with React, Next.js, Redux, JavaScript, Java, JSP, jQuery, Node.js, MySQL, HTML, CSS, config-driven data flows, and scalable e-commerce code paths.',
        'Supported application maintenance, unit testing, agile delivery, performance optimization, and growth-driven scaling changes.',
      ],
    },
    {
      id: 'apotheek',
      role: 'Software Engineer',
      company: 'Nationale-Apotheek',
      period: 'Project engagement - 6 months',
      context: 'Netherlands online pharmacy for ordering medicines with fast delivery, built with Next.js and Storyblok CMS.',
      bullets: [
        'Built reusable frontend components, API calls, Node.js handling, responsive UI, and CMS-driven pages using Next.js, TypeScript, Storyblok, Vercel, HTML, and CSS.',
        'Provided client support, Vercel deployment support, Jest/Enzyme tests, unit testing, maintenance, Postman/Jira workflow support, and production issue resolution.',
      ],
    },
    {
      id: 'axon',
      role: 'Software Engineer',
      company: 'Axon Evidence Management System',
      period: 'Project engagement - 8 months',
      context: 'Digital Evidence Management System for secure storage, redaction, sharing, transcription, case-building, and integration of law-enforcement evidence.',
      bullets: [
        'Created UI screens from Figma, integrated frontend API calls, supported React and Angular modules, and contributed to Node.js/MongoDB-backed flows.',
        'Worked with TypeScript, React, Angular, Node.js, MongoDB, HTML, CSS, Jest, Enzyme, Postman, Jira, client support, agile delivery, and application maintenance.',
      ],
    },
    {
      id: 'shopiji',
      role: 'Software Engineer',
      company: 'Shopiji',
      period: 'Project engagement - 4 months',
      context: 'Mobile-friendly progressive web app for product discovery, offers, shipping information, and payment-enabled shopping journeys.',
      bullets: [
        'Created complete UI components, integrated frontend data, called APIs, and built REST APIs using React, Node.js, MySQL, MongoDB, Python, and Django.',
        'Worked across product catalog, offer-led browsing, payment-supporting flows, and responsive commerce experiences.',
      ],
    },
    {
      id: 'psydro',
      role: 'Software Engineer',
      company: 'Psydro',
      period: 'Project engagement - 1 year',
      context: 'Review and discount platform helping consumers make purchasing decisions through reviews, discounts, gamification, and trust-building product journeys.',
      bullets: [
        'Created terms-of-service, discount, gamification, and other product pages using HTML, CSS, JavaScript, React, and Next.js.',
        'Fixed bugs, improved UI flows, and supported consumer-facing marketplace/review experiences.',
      ],
    },
    {
      id: 'wildhire',
      role: 'Software Engineer',
      company: 'WildHire',
      period: 'Project engagement - 8 months',
      context: 'Freelance marketplace where people and companies find trusted workers, browse categories, negotiate, and agree on task delivery.',
      bullets: [
        'Created the website UI, fixed bugs, and supported marketplace browsing and job-matching flows using HTML, CSS, JavaScript, React, and Next.js.',
        'Contributed to user-facing journeys for worker discovery, category browsing, negotiation, and engagement initiation.',
      ],
    },
    {
      id: 'turbotax',
      role: 'Software Engineer',
      company: 'Intuit TurboTax DIY',
      period: 'Project engagement - 6 months',
      context: 'Do-it-yourself tax preparation product components for guided tax filing experiences.',
      bullets: [
        'Built reusable React components for DIY screens, fixed bugs, and contributed to guided form-style product flows using React and Node.js.',
        'Focused on reliable UI behavior, reusable component design, and maintainability for tax-preparation journeys.',
      ],
    },
    {
      id: 'mobilesnyou',
      role: 'Software Engineer',
      company: 'Mobiles N You',
      period: 'Project engagement - 6 months',
      context: 'Customer app and admin panel for purchasing phones and accessories with product comparison and affordable purchase flows.',
      bullets: [
        'Created React and Redux UI components, called APIs, created REST APIs, and integrated data using React, Redux, Node.js, MongoDB, and MySQL.',
        'Worked on customer-facing commerce screens, admin flows, product comparison, catalog data, and application integration.',
      ],
    },
  ] as ProfileJob[],

  highlights: [
    'Architecture decisions: Microservices, event-driven workflows, Kafka message design, Temporal orchestration, caching strategy, API contracts, secrets management, and deployment strategy.',
    'Leadership: Led 6+ engineer squads, mentored junior/mid engineers, reviewed PRs, planned sprints, and translated client asks into technical delivery plans.',
    'Observability: Built dashboards, metrics, alerting, log ingestion, on-call runbooks, and production troubleshooting loops.',
    'AI tooling: Built Claude Skills and RAG pipelines for enterprise developer productivity and worked on Gemini model-quality workflows.',
    'Multi-country delivery: Shipped products for Australia, USA, Netherlands, UAE, and India across regulated and consumer domains.',
    'Hiring-manager signal: Can operate as senior IC, team lead, architecture partner, caching/performance owner, client-facing engineer, and delivery owner.',
  ],

  education: [
    { label: 'Bachelor of Technology', value: 'DCRUST - Deenbandhu Chhotu Ram University of Science and Technology, Murthal, Haryana' },
    { label: 'Schooling', value: '10th Standard and 12th Standard - CBSE Board' },
  ],
};

export const PROFILE_JOB_IDS = PROFILE.jobs.map((j) => j.id) as [string, ...string[]];
