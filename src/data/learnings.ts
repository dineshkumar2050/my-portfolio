export interface LearningTopic {
  id: string;
  title: string;
  file: string;
  category: string;
  catColor: string;
  desc: string;
  icon: string;
}

export const learningTopics: LearningTopic[] = [
  // Frontend
  { id: 'react', title: 'React.js', file: 'react.html', category: 'Frontend', catColor: '#60a5fa', icon: '⚛️', desc: 'Hooks, reconciliation, performance optimization, patterns, and in-depth interview Q&A.' },
  { id: 'nextjs', title: 'Next.js', file: 'nextjs.html', category: 'Frontend', catColor: '#60a5fa', icon: '▲', desc: 'App Router, SSR, SSG, ISR, server components, and deployment strategies.' },
  { id: 'typescript', title: 'TypeScript', file: 'typescript.html', category: 'Frontend', catColor: '#60a5fa', icon: 'TS', desc: 'Types, generics, decorators, utility types, and advanced type patterns.' },
  { id: 'javascript', title: 'JavaScript', file: 'javascript.html', category: 'Frontend', catColor: '#60a5fa', icon: 'JS', desc: 'Event loop, closures, prototypes, async/await, and deep language internals.' },
  { id: 'redux', title: 'Redux', file: 'redux.html', category: 'Frontend', catColor: '#60a5fa', icon: '🔄', desc: 'Flux architecture, middleware, RTK, Thunk, Saga, and state management patterns.' },
  { id: 'react-query', title: 'React Query', file: 'react-query.html', category: 'Frontend', catColor: '#60a5fa', icon: '🔃', desc: 'Server state management, caching, pagination, and optimistic updates.' },
  { id: 'css-scss', title: 'CSS & SCSS', file: 'css-scss.html', category: 'Frontend', catColor: '#60a5fa', icon: '🎨', desc: 'Flexbox, Grid, animations, custom properties, SCSS mixins, and BEM methodology.' },
  { id: 'react-native', title: 'React Native', file: 'react-native.html', category: 'Frontend', catColor: '#60a5fa', icon: '📱', desc: 'Mobile development, navigation, native modules, and performance optimization.' },
  { id: 'vuejs', title: 'Vue.js', file: 'vuejs.html', category: 'Frontend', catColor: '#60a5fa', icon: 'V', desc: 'Vue 3 composition API, reactivity, directives, and ecosystem.' },
  { id: 'angular', title: 'Angular', file: 'angular.html', category: 'Frontend', catColor: '#60a5fa', icon: 'A', desc: 'Components, services, RxJS, routing, and enterprise Angular patterns.' },
  { id: 'html', title: 'HTML', file: 'html.html', category: 'Frontend', catColor: '#60a5fa', icon: '🌐', desc: 'Semantic HTML, accessibility, web APIs, forms, and SEO best practices.' },

  // Backend
  { id: 'nodejs', title: 'Node.js', file: 'nodejs.html', category: 'Backend', catColor: '#34d399', icon: '🟢', desc: 'Event loop, streams, cluster, performance, and building production Node services.' },
  { id: 'nestjs', title: 'NestJS', file: 'nestjs.html', category: 'Backend', catColor: '#34d399', icon: '🐈', desc: 'Modules, dependency injection, guards, interceptors, pipes, and microservices.' },
  { id: 'graphql', title: 'GraphQL', file: 'graphql.html', category: 'Backend', catColor: '#34d399', icon: '◉', desc: 'Schema design, resolvers, subscriptions, DataLoader, and federation.' },
  { id: 'api-gateway', title: 'API Gateway', file: 'api-gateway.html', category: 'Backend', catColor: '#34d399', icon: '🔀', desc: 'Rate limiting, auth, routing, service mesh patterns, and API design.' },
  { id: 'python', title: 'Python', file: 'python.html', category: 'Backend', catColor: '#34d399', icon: '🐍', desc: 'Asyncio, decorators, generators, Django, FastAPI, and Python for data workflows.' },
  { id: 'java', title: 'Java', file: 'java.html', category: 'Backend', catColor: '#34d399', icon: '☕', desc: 'JVM, Spring Boot, concurrency, collections, and enterprise Java patterns.' },

  // Architecture
  { id: 'microservices', title: 'Microservices', file: 'microservices.html', category: 'Architecture', catColor: '#d29922', icon: '🧩', desc: 'Service decomposition, communication patterns, saga, CQRS, and event sourcing.' },
  { id: 'hld-system-design', title: 'System Design (HLD)', file: 'hld-system-design.html', category: 'Architecture', catColor: '#d29922', icon: '🏗️', desc: 'Scalability, CAP theorem, sharding, load balancing, and system design interviews.' },
  { id: 'lld-design-patterns', title: 'LLD & Design Patterns', file: 'lld-design-patterns.html', category: 'Architecture', catColor: '#d29922', icon: '📐', desc: 'SOLID principles, creational, structural, and behavioral design patterns.' },
  { id: 'solid-principles', title: 'SOLID Principles', file: 'solid-principles.html', category: 'Architecture', catColor: '#d29922', icon: '🏛️', desc: 'In-depth SOLID with code examples, violations, and real-world refactoring.' },
  { id: 'dsa', title: 'DSA', file: 'dsa.html', category: 'Architecture', catColor: '#d29922', icon: '🔢', desc: 'Data structures, algorithms, Big-O analysis, and coding interview patterns.' },

  // Infrastructure
  { id: 'docker', title: 'Docker', file: 'docker.html', category: 'Infrastructure', catColor: '#d2a8ff', icon: '🐳', desc: 'Images, containers, Dockerfile, multi-stage builds, Docker Compose, and networking.' },
  { id: 'kubernetes', title: 'Kubernetes', file: 'kubernetes.html', category: 'Infrastructure', catColor: '#d2a8ff', icon: '⎈', desc: 'Pods, deployments, services, ingress, autoscaling, Helm, and K8s operations.' },
  { id: 'aws', title: 'AWS', file: 'aws.html', category: 'Infrastructure', catColor: '#d2a8ff', icon: '☁️', desc: 'EC2, ECS, S3, Lambda, SQS, ALB, RDS, CloudWatch, IAM, and solution design.' },
  { id: 'cicd-jenkins', title: 'CI/CD & Jenkins', file: 'cicd-jenkins.html', category: 'Infrastructure', catColor: '#d2a8ff', icon: '🚀', desc: 'Pipeline design, Jenkins, GitHub Actions, automated testing, and deploy strategies.' },
  { id: 'vault-dhp-sdlc', title: 'Vault, DHP & SDLC', file: 'vault-dhp-sdlc.html', category: 'Infrastructure', catColor: '#d2a8ff', icon: '🔐', desc: 'HashiCorp Vault secrets management, DHP processes, and enterprise SDLC workflows.' },
  { id: 'caching', title: 'Caching', file: 'caching.html', category: 'Infrastructure', catColor: '#d2a8ff', icon: '⚡', desc: 'Redis, Memcached, cache invalidation, CDN, and caching strategies for scale.' },

  // Data
  { id: 'databases', title: 'Databases', file: 'databases.html', category: 'Data', catColor: '#39d0d0', icon: '🗄️', desc: 'SQL vs NoSQL, indexing, transactions, ACID, and database optimization.' },
  { id: 'kafka', title: 'Apache Kafka', file: 'kafka.html', category: 'Data', catColor: '#39d0d0', icon: '📨', desc: 'Topics, partitions, consumer groups, exactly-once semantics, and Kafka patterns.' },
  { id: 'elasticsearch', title: 'Elasticsearch', file: 'elasticsearch.html', category: 'Data', catColor: '#39d0d0', icon: '🔍', desc: 'Indexing, full-text search, aggregations, mappings, and search optimization.' },
  { id: 'temporal', title: 'Temporal', file: 'temporal.html', category: 'Data', catColor: '#39d0d0', icon: '⏱️', desc: 'Durable workflows, activities, signals, queries, and workflow orchestration patterns.' },

  // Observability
  { id: 'observability', title: 'Observability', file: 'observability.html', category: 'Observability', catColor: '#00d4ff', icon: '📈', desc: 'Metrics, logs, traces, Grafana, Prometheus, PagerDuty, and SLO/SLA design.' },

  // AI
  { id: 'agentic-ai', title: 'Agentic AI', file: 'agentic-ai.html', category: 'AI & ML', catColor: '#f778ba', icon: '🤖', desc: 'Autonomous AI agents, tool use, multi-agent systems, and agentic architectures.' },
  { id: 'ai-ml', title: 'AI & ML', file: 'ai-ml.html', category: 'AI & ML', catColor: '#f778ba', icon: '🧠', desc: 'Machine learning fundamentals, neural networks, model training, and ML engineering.' },
  { id: 'claude-guide', title: 'Claude AI Guide', file: 'claude-guide.html', category: 'AI & ML', catColor: '#f778ba', icon: '✦', desc: 'Claude API, Claude Skills, prompt engineering, and building AI-powered workflows.' },
  { id: 'langchain-langgraph', title: 'LangChain & LangGraph', file: 'langchain-langgraph.html', category: 'AI & ML', catColor: '#f778ba', icon: '🔗', desc: 'LLM orchestration, chains, agents, graphs, and RAG pipeline architecture.' },

  // Career
  { id: 'career-interviews', title: 'Career & Interviews', file: 'career-interviews.html', category: 'Career', catColor: '#e3b341', icon: '🎯', desc: 'Interview preparation, behavioral questions, system design rounds, and career growth.' },
  { id: 'manager-architect-qa', title: 'Manager / Architect Q&A', file: 'manager-architect-qa.html', category: 'Career', catColor: '#e3b341', icon: '👔', desc: 'Leadership, architectural decisions, team management, and senior/staff engineer topics.' },
];
