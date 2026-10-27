export const GOOGLE_DRIVE_REPO_URL =
  'https://drive.google.com/drive/folders/1kvnmSS1q8tT2CkKWdiTfHlKUbP29ZY_-?usp=sharing';

export const PERSONAL_DETAILS = [
  { label: 'Full Name', value: 'Denmark Catolico' },
  { label: 'Age • Sex', value: '21 • Male' },
  { label: 'Date of Birth', value: 'Dec, 12 2005' },
  { label: 'Nationality', value: 'Filipino' },
  { label: 'SEAIT ID Code', value: '2024-0917' },
  { label: 'Course • Year Level', value: 'BSIT-BA • 3rd Year' },
  { label: 'Professional Email', value: 'dailyaiuseacc08@gmail.com' },
  { label: 'Phone / WhatsApp', value: '09309022553' },
  {
    label: 'College • Address',
    value: 'South East Asian Institute of Technology (SEAIT) • City of Koronadal',
    fullWidth: true
  }
];

export const EDUCATION_TIMELINE = [
  {
    id: 'college',
    school: 'South East Asian Institute of Technology',
    badge: 'College • 3rd Year (Present)',
    level: 'College • 3rd Year (Present)',
    program: 'BSIT - BA (Bachelor of Science in Information Technology — Major in Business Analytics)',
    meta: 'City of Koronadal • SEAIT ID: 2024-0917 • Business Analytics, Star & Snowflake Schema Modeling, and Power BI Architecture',
    logo: '/photo/seait_logo.png',
    alt: 'SEAIT College Logo',
    isCurrent: true,
    current: true
  },
  {
    id: 'shs',
    school: 'Saravia National High School',
    badge: 'Senior High School',
    level: 'Senior High School',
    program: 'Accountancy, Business and Management (ABM)',
    meta: 'City of Koronadal • Foundational business accounting, financial organization, analytical thinking, and strategic management track',
    logo: '/photo/saravia.png',
    alt: 'Saravia National High School Logo',
    isCurrent: false,
    current: false
  },
  {
    id: 'jhs',
    school: 'Saravia National High School',
    badge: 'Junior High School',
    level: 'Junior High School',
    program: 'Secondary Education Curriculum',
    meta: 'City of Koronadal • Complete secondary academic curriculum, math, sciences, and student leadership activities',
    logo: '/photo/saravia.png',
    alt: 'Saravia National High School Logo',
    isCurrent: false,
    current: false
  },
  {
    id: 'elem',
    school: 'Marbel 8 Elementary School',
    badge: 'Elementary School',
    level: 'Elementary School',
    program: 'Primary Education Curriculum',
    meta: 'City of Koronadal • Primary academic foundation, character formation, and early analytical exploration',
    logo: '/photo/marbel8.png',
    alt: 'Marbel 8 Elementary School Logo',
    isCurrent: false,
    current: false
  }
];

export const SKILLS_LIST = [
  {
    id: 'power-bi',
    code: 'BI',
    pill: 'BI',
    badge: 'Flagship Specialty',
    title: 'Power BI',
    description:
      'Advanced data modeling, star & snowflake schema architecture, DAX formulas, dimensional warehousing, and interactive executive dashboards.',
    highlight: true
  },
  {
    id: 'vibe-coding',
    code: 'AI',
    pill: 'AI',
    badge: 'Modern Tech Workflow',
    title: 'Vibe Coding',
    description:
      'AI-assisted rapid prototyping, accelerated software development, intelligent prompt engineering, and swift translation from concept to production code.',
    highlight: false
  },
  {
    id: 'leadership',
    code: 'LEAD',
    pill: 'LEAD',
    badge: 'Project Management',
    title: 'Leadership',
    description:
      'Steering collegiate technical projects, defining strategic milestones, task delegation, team accountability, and driving high-standard deliverables.',
    highlight: false
  },
  {
    id: 'team-building',
    code: 'TEAM',
    pill: 'TEAM',
    badge: 'Collaboration',
    title: 'Team Building',
    description:
      'Fostering high-trust team culture, cross-functional synergy between developers, analysts, and designers, constructive feedback, and group cohesion.',
    highlight: false
  }
];

export const PBI_ACTIVITIES = [
  {
    index: 0,
    id: 'pbi-lab6-schema',
    cardId: 'pbi-lab6-schema',
    slug: 'schema-explorer',
    tabNum: '01',
    tabLabel: 'Lab 6: Star & Snowflake',
    studioTitle: 'Lab 6: Star & Snowflake Schema Explorer (Data Warehouse)',
    category: 'modeling',
    kicker: '01 / Data Warehouse Architecture • Lab 6',
    statusDotClass: 'status-dot-live',
    statusLabel: 'Embedded Interactive Engine',
    title: 'Lab 6: Star Schema vs. Snowflake Schema',
    lead: 'Dimensional modeling laboratory comparing de-normalized Star Schemas and normalized Snowflake Schemas.',
    description:
      'Interactive dimensional design explorer demonstrating fact-to-dimension relationships, surrogate keys, snowflake normalization depth (Subcategory → Category), attribute hierarchy traversals, and query performance trade-offs for analytical processing.',
    embedTitle: 'Live Interactive Workspace: Lab 6 Schema Explorer',
    specs: [
      { tag: 'Modeling Patterns', value: 'Star Schema • Snowflake Schema' },
      { tag: 'Core Dimensions', value: 'Dim_Product, Dim_Customer, Dim_Date, Dim_Store' },
      { tag: 'Fact Granularity', value: 'Fact_Sales (Transaction Line Item Grain)' },
      { tag: 'Analytical Optimization', value: 'Join Reduction • Storage Footprint' }
    ],
    tech: [
      'Power BI',
      'Star Schema',
      'Snowflake Schema',
      'Dimensional Modeling',
      'DAX',
      'Data Warehouse'
    ],
    detailSummary: 'Technical Schema & DAX Specifications',
    detailContent:
      'Architecture Breakdown: In Lab 6, we implemented both Star and Snowflake schema configurations. The Star Schema de-normalizes dimensions into single flat tables for fastest analytical query execution, while the Snowflake Schema normalizes child dimensions (such as Product Subcategory and Category) to eliminate redundancy and maintain 3NF integrity.'
  },
  {
    index: 1,
    id: 'pbi-lab7-modeling',
    cardId: 'pbi-lab7-modeling',
    slug: 'lab7-modeling',
    tabNum: '02',
    tabLabel: 'Lab 7: Advanced Modeling',
    studioTitle: 'Lab 7: Advanced Data Modeling Dashboard (Multi-Fact)',
    category: 'modeling',
    kicker: '02 / Enterprise Analytical Modeling • Lab 7',
    statusDotClass: 'status-dot-live',
    statusLabel: 'Embedded Interactive Engine',
    title: 'Lab 7: Advanced Data Modeling',
    lead: 'Multi-fact enterprise data modeling featuring complex relationships, bridge tables, and dynamic DAX metrics.',
    description:
      'Advanced modeling dashboard addressing many-to-many cardinality, role-playing calendar dimensions, bi-directional cross-filtering controls, semi-additive measures, and executive KPI benchmarking.',
    embedTitle: 'Live Interactive Workspace: Lab 7 Advanced Modeling',
    specs: [
      { tag: 'Model Architecture', value: 'Multi-Fact • Conformed Dimensions' },
      { tag: 'Cardinality Rules', value: '1:*, *:*, Bridge Resolution' },
      { tag: 'DAX Engine', value: 'CALCULATE, USERELATIONSHIP, Time Intelligence' },
      { tag: 'Performance Target', value: 'VertiPaq Memory Optimization' }
    ],
    tech: [
      'Power BI Desktop',
      'Advanced DAX',
      'Multi-Fact Modeling',
      'Role-Playing Dates',
      'Bridge Tables',
      'VertiPaq Engine'
    ],
    detailSummary: 'Technical Implementation & Calculation Engine',
    detailContent:
      'Key Modeling Insights: Implemented inactive relationship activation via USERELATIONSHIP() to decouple Order Date from Ship Date without duplicating tables. Configured granular aggregation tables to accelerate dashboard responsiveness on high-volume fact records.'
  },
  {
    index: 2,
    id: 'pbi-education-employment',
    cardId: 'pbi-education-employment',
    slug: 'education-employment',
    tabNum: '03',
    tabLabel: 'Education & Employment',
    studioTitle: 'Education & Employment Rate (2019-2025 Longitudinal Study)',
    category: 'enterprise',
    kicker: '03 / Socio-Economic Analytics • Longitudinal Study',
    statusDotClass: 'status-dot-amber',
    statusLabel: 'Embedded Live Dashboard',
    title: 'Education and Employment Rate (2019-2025)',
    lead: 'Longitudinal study evaluating educational attainment against national and regional workforce employment trends.',
    description:
      'Explores the correlation between higher education graduation rates, technical vocational certifications, and regional employment absorption across 105 countries from 2019 through 2025.',
    embedTitle: 'Live Interactive Workspace: Education & Employment',
    specs: [
      { tag: 'Time Horizon', value: '7-Year Analysis (2019 – 2025)' },
      { tag: 'Geographic Scope', value: '105 Countries • 6 Global Regions' },
      { tag: 'Key Metrics', value: 'Graduation Rates • Employment % • GDP Spending' },
      { tag: 'Visual Archetypes', value: 'Dual-Axis Trends • Scatter Correlation • Rankings' }
    ],
    tech: [
      'Power BI',
      'Time-Series Analysis',
      'Correlation Modeling',
      'Socio-Economic Metrics',
      'Data Cleansing'
    ],
    detailSummary: 'Analytics Findings & Insights',
    detailContent:
      'Key Finding: Identified a strong post-pandemic recovery inflection in 2022–2023 with tertiary and technical certifications exhibiting the highest positive correlation with long-term workforce employment stability.'
  },
  {
    index: 3,
    id: 'pbi-marketing',
    cardId: 'pbi-marketing',
    slug: 'marketing',
    tabNum: '04',
    tabLabel: 'Marketing Performance',
    studioTitle: '2025 Marketing Performance & ROI Dashboard',
    category: 'enterprise',
    kicker: '04 / Growth & Commercial Analytics • Performance 2025',
    statusDotClass: 'status-dot-cyan',
    statusLabel: 'Embedded Live Dashboard',
    title: '2025 Marketing Performance Dashboard',
    lead: 'Executive commercial analytics monitoring multi-channel campaign ROI, conversion funnels, CAC, and LTV.',
    description:
      'High-level marketing intelligence dashboard delivering real-time visibility into customer acquisition spend, organic vs paid conversion efficiency, ad-spend return (ROAS), and cohort retention across digital marketing channels.',
    embedTitle: 'Live Interactive Workspace: 2025 Marketing Dashboard',
    specs: [
      { tag: 'Executive KPIs', value: 'CAC • LTV • ROAS • Funnel Conversion %' },
      { tag: 'Channel Coverage', value: 'Paid Search • Social Ads • Email • Organic' },
      { tag: 'Cohort Engine', value: '30-60-90 Day Retention Decay' },
      { tag: 'Budget Attribution', value: 'Linear • Time-Decay • First/Last Touch' }
    ],
    tech: [
      'Power BI',
      'Marketing Attribution',
      'Funnel Analysis',
      'CAC & LTV',
      'Executive Visuals'
    ],
    detailSummary: 'Channel Optimization Insights',
    detailContent:
      'Attribution Summary: Demonstrated that while Paid Social drives 48% of initial top-of-funnel awareness, Organic Search + Retargeting Email delivered the highest LTV-to-CAC ratio (4.61x ROAS) with a 23% faster conversion cycle.'
  },
  {
    index: 4,
    id: 'pbi-election',
    cardId: 'pbi-election',
    slug: 'election',
    tabNum: '05',
    tabLabel: 'Election Results',
    studioTitle: 'Election Results & Civic Intelligence Dashboard',
    category: 'public',
    kicker: '05 / Civic Intelligence • Public Sector Analytics',
    statusDotClass: 'status-dot-live',
    statusLabel: 'Embedded Live Dashboard',
    title: 'Election Results Dashboard',
    lead: 'Civic intelligence dashboard tracking voter turnout, candidate vote shares, party distribution, and provincial metrics.',
    description:
      'Dynamic election results visualization system aggregating electoral returns across regions and provinces (2016–2025), featuring party vote share rankings, election-over-election swing analysis, and regional matrix breakdowns.',
    embedTitle: 'Live Interactive Workspace: Election Dashboard',
    specs: [
      { tag: 'Domain', value: 'Civic Intelligence • Electoral Data' },
      { tag: 'Granularity', value: 'Regional • Provincial (2016 – 2025)' },
      { tag: 'Key Metrics', value: 'Total Votes • Election Swing % • Leading Party' },
      { tag: 'Visual Tools', value: 'Smooth Trend Lines • Region Matrix • Swing Bars' }
    ],
    tech: [
      'Power BI',
      'Civic Analytics',
      'Vote Share Matrices',
      'Provincial Level Data',
      'Dynamic Filters'
    ],
    detailSummary: 'Electoral Insights & Data Pipeline',
    detailContent:
      'Data Highlights: Structured multi-election provincial tallies (2016, 2019, 2022, 2025) with conditional color coding to highlight largest positive and negative provincial swings between election cycles.'
  },
  {
    index: 5,
    id: 'pbi-tb-dengue',
    cardId: 'pbi-tb-dengue',
    slug: 'tb-dengue',
    tabNum: '06',
    tabLabel: 'TB & Dengue Surveillance',
    studioTitle: 'Public Health: TB & Dengue Epidemiological Surveillance',
    category: 'public',
    kicker: '06 / Public Health • Epidemiological Surveillance',
    statusDotClass: 'status-dot-amber',
    statusLabel: 'Embedded Live Dashboard',
    title: 'Public Health: TB and Dengue Surveillance',
    lead: 'Epidemiological intelligence platform monitoring Tuberculosis and Dengue incidence across 17 Philippine regions.',
    description:
      'Interactive public health surveillance system featuring 1,461-day longitudinal calendar modeling, quarterly disease heatmaps, age-group breakdown distributions, regional incidence rates per 100,000 population, and Case Fatality Rate (CFR) scatter correlations.',
    embedTitle: 'Live Interactive Workspace: TB & Dengue Surveillance',
    specs: [
      { tag: 'Monitoring Period', value: '2022 – 2025 (1,461 Days)' },
      { tag: 'Diseases Tracked', value: 'Tuberculosis (TB) • Dengue Fever' },
      { tag: 'Clinical Metrics', value: 'Incidence / 100k • CFR % • Age Mix' },
      { tag: 'Analytical Visuals', value: 'Quarterly Heatmap • Scatter Plot • Age Stack' }
    ],
    tech: [
      'Power BI',
      'Epidemiology',
      'Incidence Rate',
      'Case Fatality Rate (CFR)',
      'Quarterly Heatmap',
      'Public Health'
    ],
    detailSummary: 'Epidemiological Findings & Clinical Analysis',
    detailContent:
      'Surveillance Analysis: Visualizes seasonal Q3 peaks for Dengue corresponding to the Philippine monsoon period, contrasted with steady year-round pulmonary TB notifications. Demonstrates that pediatric and elderly cohorts require prioritized clinical interventions based on CFR scatter distributions.'
  }
];
