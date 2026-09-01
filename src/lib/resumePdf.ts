import { jsPDF } from 'jspdf';

export type ResumeType = 'basic' | 'detailed';

type RGB = [number, number, number];

interface Job {
  role: string;
  company: string;
  period: string;
  context?: string;
  bullets: string[];
}

interface GeneratedResume {
  fileName: string;
  arrayBuffer: ArrayBuffer;
}

const colors = {
  ink: [15, 30, 50] as RGB,
  muted: [60, 90, 120] as RGB,
  light: [110, 134, 158] as RGB,
  cyan: [0, 180, 216] as RGB,
  purple: [124, 58, 237] as RGB,
  green: [16, 185, 129] as RGB,
  orange: [245, 130, 32] as RGB,
  line: [222, 231, 240] as RGB,
  soft: [247, 250, 252] as RGB,
  white: [255, 255, 255] as RGB,
};

const contact = 'Bengaluru, India | +91 9560163362 | +91 8448724187 | dinesh.kumar.199998888@gmail.com | Open to Remote / Relocate';

function addFooter(doc: jsPDF, label: string, accent: RGB) {
  const pageCount = doc.getNumberOfPages();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setDrawColor(...colors.line);
    doc.line(42, height - 34, width - 42, height - 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.light);
    doc.text('Dinesh Kumar', 42, height - 18);
    doc.setTextColor(...accent);
    const rightText = `${label} | Page ${page} of ${pageCount}`;
    doc.text(rightText, width - 42 - doc.getTextWidth(rightText), height - 18);
  }
}

function createBaseDoc(accent: RGB, subtitle: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();

  doc.setFillColor(...colors.ink);
  doc.rect(0, 0, width, 104, 'F');
  doc.setFillColor(...accent);
  doc.rect(0, 100, width, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(25);
  doc.setTextColor(...colors.white);
  doc.text('DINESH KUMAR', 42, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(198, 225, 240);
  doc.text(subtitle, 42, 58);

  doc.setFontSize(8.8);
  doc.setTextColor(180, 200, 220);
  doc.text(contact, 42, 79);

  return doc;
}

function createWriter(doc: jsPDF, startY: number, accent: RGB) {
  const margin = 42;
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const right = width - margin;
  let y = startY;

  const checkPage = (needed = 38) => {
    if (y + needed > height - 48) {
      doc.addPage();
      y = 42;
    }
  };

  const newPage = () => {
    doc.addPage();
    y = 42;
  };

  const section = (title: string) => {
    checkPage(34);
    doc.setFillColor(...accent);
    doc.rect(margin, y - 2, 3, 15, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...colors.ink);
    doc.text(title.toUpperCase(), margin + 10, y + 10);
    doc.setDrawColor(...colors.line);
    doc.line(margin, y + 17, right, y + 17);
    y += 30;
  };

  const paragraph = (text: string, size = 9.4, gap = 12) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...colors.muted);
    const lines = doc.splitTextToSize(text, right - margin);
    doc.text(lines, margin, y);
    y += lines.length * (size + 4) + gap;
  };

  const pill = (text: string, x: number, yy: number, fill: RGB) => {
    const padX = 8;
    const pillWidth = doc.getTextWidth(text) + padX * 2;
    doc.setFillColor(...fill);
    doc.roundedRect(x, yy - 10, pillWidth, 16, 8, 8, 'F');
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text(text, x + padX, yy + 1);
    return pillWidth;
  };

  const skillLine = (label: string, value: string, color: RGB = accent) => {
    checkPage(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.9);
    doc.setTextColor(...color);
    doc.text(`${label}:`, margin, y);
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.muted);
    const lines = doc.splitTextToSize(value, right - margin - labelWidth);
    doc.text(lines, margin + labelWidth, y);
    y += Math.max(lines.length, 1) * 12.5 + 4;
  };

  const bullets = (items: string[], bulletColor: RGB = accent, size = 8.9) => {
    items.forEach((item) => {
      checkPage(24);
      doc.setFillColor(...bulletColor);
      doc.circle(margin + 3.5, y - 3, 1.7, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.setTextColor(...colors.muted);
      const lines = doc.splitTextToSize(item, right - margin - 14);
      doc.text(lines, margin + 13, y);
      y += lines.length * (size + 3.8) + 3;
    });
  };

  const job = (item: Job, opts?: { compact?: boolean; accent?: RGB }) => {
    const jobAccent = opts?.accent || accent;
    checkPage(opts?.compact ? 58 : 86);
    doc.setFillColor(...colors.soft);
    doc.roundedRect(margin, y - 13, right - margin, 28, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(opts?.compact ? 10 : 10.5);
    doc.setTextColor(...colors.ink);
    doc.text(item.role, margin + 10, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.3);
    doc.setTextColor(...colors.light);
    doc.text(item.period, right - doc.getTextWidth(item.period) - 8, y + 3);
    y += 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(...jobAccent);
    doc.text(item.company, margin, y);
    y += 13;

    if (item.context) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.3);
      doc.setTextColor(...colors.light);
      const contextLines = doc.splitTextToSize(item.context, right - margin);
      doc.text(contextLines, margin, y);
      y += contextLines.length * 11.5 + 4;
    }

    bullets(item.bullets, jobAccent, opts?.compact ? 8.4 : 8.8);
    y += opts?.compact ? 7 : 12;
  };

  const twoColumnHighlights = (items: string[]) => {
    const gap = 16;
    const colWidth = (right - margin - gap) / 2;
    const startY = y;
    let leftY = startY;
    let rightY = startY;

    items.forEach((item, index) => {
      const isLeft = index % 2 === 0;
      const x = isLeft ? margin : margin + colWidth + gap;
      const yy = isLeft ? leftY : rightY;
      const lines = doc.splitTextToSize(item, colWidth - 18);
      const boxHeight = Math.max(40, lines.length * 11 + 22);
      checkPage(boxHeight + 8);
      doc.setFillColor(...colors.soft);
      doc.roundedRect(x, yy - 14, colWidth, boxHeight, 4, 4, 'F');
      doc.setFillColor(...accent);
      doc.circle(x + 10, yy - 1, 2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.muted);
      doc.text(lines, x + 18, yy + 2);
      if (isLeft) leftY += boxHeight + 8;
      else rightY += boxHeight + 8;
    });

    y = Math.max(leftY, rightY) + 8;
  };

  return {
    get y() { return y; },
    section,
    paragraph,
    pill,
    skillLine,
    bullets,
    job,
    twoColumnHighlights,
    checkPage,
    newPage,
  };
}

function output(doc: jsPDF, fileName: string): GeneratedResume {
  return {
    fileName,
    arrayBuffer: doc.output('arraybuffer'),
  };
}

function buildBasicResume(): GeneratedResume {
  const doc = createBaseDoc(colors.cyan, 'Senior Software Engineer | Team Lead | Full-Stack, Cloud, AI Developer Tooling');
  const writer = createWriter(doc, 126, colors.cyan);
  const width = doc.internal.pageSize.getWidth();

  writer.section('Professional Summary');
  writer.paragraph(
    'Senior Software Engineer and Team Lead with 8+ years of full-stack delivery across institutional banking, fintech, edtech, AI automation, e-commerce, and public-sector platforms. Strong fit for Senior Full-Stack, Frontend Lead, Backend/NestJS, Platform, and AI-enabled developer productivity roles. Known for owning ambiguous work, translating architecture into delivery plans, mentoring engineers, and shipping production systems with caching, performance tuning, and reliable observability.'
  );

  writer.section('Core Skills and Keywords');
  writer.skillLine('Frontend', 'React.js, Next.js, TypeScript, JavaScript, Redux Toolkit, Zustand, React Query, React Native, Angular, Vue.js, HTML5, CSS3');
  writer.skillLine('Backend', 'Node.js, NestJS, Express.js, Java/Spring Boot, REST APIs, GraphQL, WebSockets, Kafka, Temporal, RabbitMQ, Redis caching');
  writer.skillLine('Cloud and DevOps', 'AWS ECS, EC2, S3, Lambda, SQS, SNS, ALB, CloudWatch, Docker, Kubernetes, Helm, CI/CD, GitHub Actions, Jenkins');
  writer.skillLine('Data and Quality', 'MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, JSONB, query optimization, cache invalidation, Jest, React Testing Library, API contracts');
  writer.skillLine('Architecture and AI', 'Microservices, event-driven design, caching strategies, SOLID, DDD, HLD/LLD, Claude Skills, RAG pipelines, agentic AI workflows');

  writer.section('Top Flagship Projects');
  writer.bullets([
    'Commonwealth Bank of Australia - Led engineering for institutional banking workflows; designed NestJS microservices using Kafka, Temporal, caching strategies, retries, and failure recovery.',
    'PCG Education - Led a 6-engineer team for a K-12 special education and Medicaid reimbursement platform; owned React/NestJS delivery, sprint planning, US client demos, and production-quality case-management workflows.',
    'LendingPoint and Zengines AI - Delivered fintech and AI automation products with React/React Native, Next.js SSR, encrypted NestJS middleware, WebSockets, LaunchDarkly feature flags, AWS infrastructure, and Sentry monitoring.',
  ]);

  writer.section('Professional Experience');
  writer.job({
    role: 'Team Lead / Senior Software Engineer',
    company: 'Nous Infosystems - Client: Commonwealth Bank of Australia',
    period: 'Apr 2024 - Oct 2025',
    bullets: [
      'Led design and delivery for an institutional banking platform supporting high-value corporate banking journeys.',
      'Created microservice architecture with NestJS, Kafka, Temporal, Redis/caching patterns, AWS ECS, HashiCorp Vault, Grafana, Prometheus, PagerDuty, and Observe.',
      'Built Claude Skills and RAG pipelines for AI-assisted engineering workflows, improving onboarding and spec-to-code execution.',
      'Owned architecture discussions, PR reviews, client communication, incident readiness, and mentorship for junior/mid engineers.',
    ],
  }, { compact: true, accent: colors.cyan });

  writer.job({
    role: 'Full-Stack Engineer / Team Lead',
    company: 'Trantor Software Pvt. Ltd. - PCG Education, LendingPoint, Zengines AI, Gemini, CureFit, Landmark',
    period: 'Mar 2022 - Apr 2024',
    bullets: [
      'Led PCG Education delivery for 18 months; managed 6 engineers, stakeholder demos, feature planning, and React/NestJS/MySQL implementation.',
      'Built LendingPoint fintech experiences with React, React Native, WebSockets, encrypted middleware, and loyalty rewards flows.',
      'Delivered Zengines AI with Next.js, Zustand, LaunchDarkly, Docker/Kubernetes, AWS EC2/S3/SQS/Lambda, and Sentry monitoring.',
    ],
  }, { compact: true, accent: colors.purple });

  writer.job({
    role: 'Software Engineer',
    company: 'Recrosoft / CartNYou / IZACCESS',
    period: 'Dec 2017 - Feb 2022',
    bullets: [
      'Built Axon digital evidence management screens and services for US law enforcement workflows using React, Angular, Node.js, MongoDB, and Jest.',
      'Delivered production applications across e-commerce, pharmacy, freelance marketplace, tax filing, phone retail, and GPS tracking domains.',
    ],
  }, { compact: true, accent: colors.green });

  writer.section('Selected Strengths');
  writer.bullets([
    'Can join as a senior IC or team lead and immediately contribute across React/Next.js, NestJS APIs, caching/performance, AWS deployment, observability, and architecture discussions.',
    'Has credible regulated-domain experience through CBA institutional banking, LendingPoint fintech, PCG Medicaid workflows, and Axon law-enforcement evidence management.',
    'Brings AI-adjacent delivery signal through Claude Skills, RAG pipelines, Zengines AI, and Gemini model-quality work - useful for teams adopting AI-assisted engineering.',
  ], colors.orange);

  writer.section('Role Alignment');
  writer.skillLine('Primary', 'Senior Full-Stack Engineer, Technical Lead, Frontend Lead, Backend/NestJS Engineer, Platform Engineer');
  writer.skillLine('Strengths', 'Ambiguous problem ownership, project rescue, system design, caching strategy, API-driven UI delivery, team mentoring, client-facing technical communication');

  writer.section('Education');
  writer.skillLine('B.Tech', 'DCRUST - Deenbandhu Chhotu Ram University of Science and Technology, Murthal, Haryana');
  writer.skillLine('Schooling', '10th and 12th - CBSE Board');

  addFooter(doc, 'Basic Resume - ATS Friendly', colors.cyan);
  return output(doc, 'Dinesh_Kumar_Basic_Resume.pdf');
}

function buildDetailedResume(): GeneratedResume {
  const doc = createBaseDoc(colors.purple, 'Senior Software Engineer | Technical Lead | Full-Stack, Cloud-Native Delivery, AI Tooling');
  const writer = createWriter(doc, 126, colors.purple);

  writer.section('Professional Summary');
  writer.paragraph(
    'Senior Full-Stack Engineer and Technical Lead with 8+ years building production-grade systems across institutional banking, fintech, education technology, AI automation, healthcare, e-commerce, government technology, retail, and marketplace products. Brings the combination hiring teams look for: hands-on TypeScript/React/NestJS depth, cloud-native architecture judgment, caching and performance optimization, ownership of ambiguous business workflows, and the maturity to lead engineers through design, delivery, observability, and production support.'
  );
  writer.paragraph(
    'Project experience includes a freelance institutional banking engagement for Commonwealth Bank of Australia, enterprise AI automation with Zengines AI, education workflows for PCG, fintech journeys for LendingPoint and InKind, Google Gemini model-quality work, and multiple commerce, healthcare, pharmacy, evidence-management, marketplace, tax, mobile retail, and GPS tracking products.'
  );

  writer.section('Complete Skills Taxonomy');
  writer.skillLine('Languages', 'TypeScript, JavaScript ES2022+, Java, Python, SQL, HTML5, CSS3/SCSS', colors.cyan);
  writer.skillLine('Frontend', 'React.js, Next.js, Redux, Redux Toolkit, Zustand, React Query, React Native, Angular, Vue.js, Mantine UI, Material UI, Webpack, LaunchDarkly', colors.cyan);
  writer.skillLine('Backend', 'Node.js, NestJS, Express.js, Spring Boot, REST, GraphQL, WebSockets, Kafka, Temporal, RabbitMQ, API security, payload encryption, Redis caching', colors.green);
  writer.skillLine('Cloud and DevOps', 'AWS ECS, EC2, S3, Lambda, SQS, SNS, ALB, CloudWatch, IAM, Docker, Kubernetes, Helm, Vercel, CI/CD, GitHub Actions, Jenkins, HashiCorp Vault', colors.purple);
  writer.skillLine('Databases and Search', 'MySQL, PostgreSQL, JSONB, MongoDB, Redis, Elasticsearch, schema design, query optimization, indexing strategies, cache invalidation', colors.orange);
  writer.skillLine('Observability and Quality', 'Grafana, Prometheus, PagerDuty, Observe, Sentry, Loggly, OpenTelemetry concepts, Jest, React Testing Library, Enzyme, Postman, Swagger', colors.green);
  writer.skillLine('Architecture and AI', 'Microservices, event-driven systems, workflow orchestration, caching strategies, HLD, LLD, SOLID, DDD, CQRS, RAG pipelines, Claude Skills, agentic AI, Spec-Kit', colors.purple);

  writer.section('Project-by-Project Experience');
  writer.job({
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
  }, { accent: colors.purple });

  writer.job({
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
  }, { accent: colors.cyan });

  writer.job({
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
  }, { accent: colors.green });

  writer.job({
    role: 'Full-Stack Engineer / Team Lead',
    company: 'Zengines AI',
    period: 'Project engagement - 6 months',
    context: 'Enterprise AI data automation platform for onboarding, transformation, validation, and integration of large-volume business data.',
    bullets: [
      'Built React, Next.js, React Native, Node.js, NestJS, Vue.js, Zustand, Mantine UI, React Query, and LaunchDarkly powered product workflows.',
      'Used Docker, Kubernetes, AWS EC2/S3/SQS/SNS/Lambda/CloudWatch, MySQL, caching/performance tuning, Sentry, Jest, RTL, HLD, LLD, and DSA to improve stability and delivery quality.',
      'Handled task planning, PR reviews, safe merges, client communication, requirement gathering, reusable component design, API development, and team coordination.',
    ],
  }, { accent: colors.orange });

  writer.job({
    role: 'AI Model Quality Trainer',
    company: 'Google Gemini',
    period: 'Contract - 6 months',
    context: 'Multimodal AI model-quality engagement focused on improving response accuracy, contextual behavior, and responsible AI outcomes.',
    bullets: [
      'Analyzed model outputs, curated datasets, identified response inaccuracies, and suggested data/process improvements for text, image, audio reasoning, and multilingual tasks.',
      'Supported feedback-loop design, performance monitoring, contextual adaptation, developer collaboration, scalable training processes, and bias mitigation practices.',
      'Applied strong frontend/backend product context from React, React Native, Node.js, NestJS, Next.js, Angular, Vue.js, Redux, and MySQL while evaluating AI behavior.',
    ],
  }, { accent: colors.cyan });

  writer.job({
    role: 'Full-Stack Engineer',
    company: 'InKind',
    period: 'Contract - 4 months',
    context: 'Restaurant capital platform where customers buy pre-purchased dining credit and redeem it across participating restaurants.',
    bullets: [
      'Built React and React Native experiences with Redux, React Query, reusable components, routing, API integration, and responsive UI implementation.',
      'Worked on Node.js/NestJS middleware, encryption/decryption for API data, MySQL-backed services, AWS CloudWatch monitoring, S3/EC2/serverless support, and logging.',
      'Implemented loyalty program flows to reward customer engagement and repeat purchases while supporting production fixes, code reviews, optimization, unit testing, and agile delivery.',
    ],
  }, { accent: colors.green });

  writer.job({
    role: 'Full-Stack Engineer',
    company: 'CureFit',
    period: 'Project engagement - 6 months',
    context: 'Health and fitness platform with internal program-management tools and microservice-backed offers workflows.',
    bullets: [
      'Developed React, Angular, JavaScript, Node.js, NestJS, MongoDB, MySQL, Redux, React Native, and microservice-based application features.',
      'Built internal tooling for newly launched programs, eligibility-based display logic, backend endpoints, and offers-module APIs using NestJS and MongoDB.',
      'Handled requirement analysis, scope review, Jest/Enzyme tests, unit testing, maintenance, agile delivery, and production issue support.',
    ],
  }, { accent: colors.orange });

  writer.job({
    role: 'Full-Stack Engineer',
    company: 'Trackwick',
    period: 'Project engagement - 6 months',
    context: 'Real-time employee activity and GPS tracking product for field-force coordination and workforce visibility.',
    bullets: [
      'Created React UI components, frontend API calls, Node.js/MongoDB APIs, user registration, authorization, and authentication workflows.',
      'Worked with JavaScript, Java, Angular, React Native, AWS, MySQL, MongoDB, HTML, CSS, Postman, Jira, and client support workflows.',
      'Supported agile delivery, issue resolution, unit testing, application maintenance, and functionality support for client teams.',
    ],
  }, { accent: colors.cyan });

  writer.job({
    role: 'Full-Stack Engineer',
    company: 'Landmark / MaxFashion',
    period: 'Project engagement - 6 months',
    context: 'Large UAE e-commerce ecosystem across six territories and two languages, including category-led commerce platforms.',
    bullets: [
      'Added features, fixed bugs, created reusable components, handled routing, integrated APIs, and improved page-load performance.',
      'Worked with React, Next.js, Redux, JavaScript, Java, JSP, jQuery, Node.js, MySQL, HTML, CSS, config-driven data flows, and scalable e-commerce code paths.',
      'Supported application maintenance, unit testing, agile delivery, performance optimization, and growth-driven scaling changes.',
    ],
  }, { accent: colors.purple });

  writer.job({
    role: 'Software Engineer',
    company: 'Nationale-Apotheek',
    period: 'Project engagement - 6 months',
    context: 'Netherlands online pharmacy for ordering medicines with fast delivery, built with Next.js and Storyblok CMS.',
    bullets: [
      'Built reusable frontend components, API calls, Node.js handling, responsive UI, and CMS-driven pages using Next.js, TypeScript, Storyblok, Vercel, HTML, and CSS.',
      'Provided client support, Vercel deployment support, Jest/Enzyme tests, unit testing, maintenance, Postman/Jira workflow support, and production issue resolution.',
    ],
  }, { accent: colors.green });

  writer.job({
    role: 'Software Engineer',
    company: 'Axon Evidence Management System',
    period: 'Project engagement - 8 months',
    context: 'Digital Evidence Management System for secure storage, redaction, sharing, transcription, case-building, and integration of law-enforcement evidence.',
    bullets: [
      'Created UI screens from Figma, integrated frontend API calls, supported React and Angular modules, and contributed to Node.js/MongoDB-backed flows.',
      'Worked with TypeScript, React, Angular, Node.js, MongoDB, HTML, CSS, Jest, Enzyme, Postman, Jira, client support, agile delivery, and application maintenance.',
    ],
  }, { accent: colors.cyan });

  writer.job({
    role: 'Software Engineer',
    company: 'Shopiji',
    period: 'Project engagement - 4 months',
    context: 'Mobile-friendly progressive web app for product discovery, offers, shipping information, and payment-enabled shopping journeys.',
    bullets: [
      'Created complete UI components, integrated frontend data, called APIs, and built REST APIs using React, Node.js, MySQL, MongoDB, Python, and Django.',
      'Worked across product catalog, offer-led browsing, payment-supporting flows, and responsive commerce experiences.',
    ],
  }, { accent: colors.orange });

  writer.job({
    role: 'Software Engineer',
    company: 'Psydro',
    period: 'Project engagement - 1 year',
    context: 'Review and discount platform helping consumers make purchasing decisions through reviews, discounts, gamification, and trust-building product journeys.',
    bullets: [
      'Created terms-of-service, discount, gamification, and other product pages using HTML, CSS, JavaScript, React, and Next.js.',
      'Fixed bugs, improved UI flows, and supported consumer-facing marketplace/review experiences.',
    ],
  }, { accent: colors.purple });

  writer.job({
    role: 'Software Engineer',
    company: 'WildHire',
    period: 'Project engagement - 8 months',
    context: 'Freelance marketplace where people and companies find trusted workers, browse categories, negotiate, and agree on task delivery.',
    bullets: [
      'Created the website UI, fixed bugs, and supported marketplace browsing and job-matching flows using HTML, CSS, JavaScript, React, and Next.js.',
      'Contributed to user-facing journeys for worker discovery, category browsing, negotiation, and engagement initiation.',
    ],
  }, { accent: colors.green });

  writer.job({
    role: 'Software Engineer',
    company: 'Intuit TurboTax DIY',
    period: 'Project engagement - 6 months',
    context: 'Do-it-yourself tax preparation product components for guided tax filing experiences.',
    bullets: [
      'Built reusable React components for DIY screens, fixed bugs, and contributed to guided form-style product flows using React and Node.js.',
      'Focused on reliable UI behavior, reusable component design, and maintainability for tax-preparation journeys.',
    ],
  }, { accent: colors.cyan });

  writer.job({
    role: 'Software Engineer',
    company: 'Mobiles N You',
    period: 'Project engagement - 6 months',
    context: 'Customer app and admin panel for purchasing phones and accessories with product comparison and affordable purchase flows.',
    bullets: [
      'Created React and Redux UI components, called APIs, created REST APIs, and integrated data using React, Redux, Node.js, MongoDB, and MySQL.',
      'Worked on customer-facing commerce screens, admin flows, product comparison, catalog data, and application integration.',
    ],
  }, { accent: colors.orange });

  writer.newPage();
  writer.section('Architecture and Leadership Highlights');
  writer.twoColumnHighlights([
    'Architecture decisions: Microservices, event-driven workflows, Kafka message design, Temporal orchestration, caching strategy, API contracts, secrets management, and deployment strategy.',
    'Leadership: Led 6+ engineer squads, mentored junior/mid engineers, reviewed PRs, planned sprints, and translated client asks into technical delivery plans.',
    'Observability: Built dashboards, metrics, alerting, log ingestion, on-call runbooks, and production troubleshooting loops.',
    'AI tooling: Built Claude Skills and RAG pipelines for enterprise developer productivity and worked on Gemini model-quality workflows.',
    'Multi-country delivery: Shipped products for Australia, USA, Netherlands, UAE, and India across regulated and consumer domains.',
    'Hiring-manager signal: Can operate as senior IC, team lead, architecture partner, caching/performance owner, client-facing engineer, and delivery owner.',
  ]);

  writer.section('Education');
  writer.skillLine('Bachelor of Technology', 'DCRUST - Deenbandhu Chhotu Ram University of Science and Technology, Murthal, Haryana', colors.purple);
  writer.skillLine('Schooling', '10th Standard and 12th Standard - CBSE Board', colors.cyan);

  addFooter(doc, 'Detailed Resume - Hiring Manager Deep Dive', colors.purple);
  return output(doc, 'Dinesh_Kumar_Detailed_Resume.pdf');
}

export async function createResumePdf(type: ResumeType): Promise<GeneratedResume> {
  return type === 'detailed' ? buildDetailedResume() : buildBasicResume();
}
