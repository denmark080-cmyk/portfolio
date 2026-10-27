# Denmark Catolico — React.js Portfolio & Power BI Analytics Studio

Official portfolio of **Denmark Catolico** (`BSIT-BA` • 3rd Year at **South East Asian Institute of Technology — SEAIT**), refactored into a clean, modular **React.js + Vite** application ready for immediate deployment on **Vercel**.

---

## 📁 Organized Project Structure

```text
denmark-portfolio/
├── public/                        # Static assets served at root '/'
│   └── photo/
│       ├── profile1.png           # Center cutout portrait
│       ├── seait_logo.png         # College logo (SEAIT)
│       ├── saravia.png            # Senior & Junior High logo (Saravia NHS)
│       └── marbel8.png            # Elementary logo (Marbel 8 Elementary)
├── src/
│   ├── activities/                # All 6 HTML activities converted to React (.jsx)
│   │   ├── SchemaExplorer.jsx     # 01: Lab 6 Star vs. Snowflake Schema Explorer
│   │   ├── Lab7Dashboard.jsx      # 02: Lab 7 Advanced Multi-Fact Data Modeling
│   │   ├── EducationEmployment.jsx# 03: Education & Employment Rate (2019–2025)
│   │   ├── MarketingDashboard.jsx # 04: 2025 Marketing Performance Dashboard
│   │   ├── ElectionDashboard.jsx  # 05: Election Results & Civic Intelligence
│   │   └── TbDengueSurveillance.jsx # 06: TB & Dengue Epidemiological Surveillance
│   ├── components/                # Modular Portfolio UI Components
│   │   ├── Navbar.jsx             # "My portfolio." frosted-blur header, theme & color picker
│   │   ├── PersonalInfoHero.jsx   # Personal details & SEAIT identity card
│   │   ├── CenterPortrait.jsx     # Sticky center portrait column
│   │   ├── RightHeroExpertise.jsx # Right hero & credentials print action
│   │   ├── EducationalBackground.jsx # Academic timeline with school logos
│   │   ├── ExperiencesSkills.jsx  # Power BI, Vibe Coding, Leadership, Team Building
│   │   ├── PowerBIActivitiesSection.jsx # Unified Workbench Studio + 6 Activity Cards
│   │   ├── PrintableCV.jsx        # Formatted A4/Letter Curriculum Vitae print & preview sheet
│   │   └── Footer.jsx             # Portfolio footer
│   ├── data/                      # Structured Datasets & Portfolio Records
│   │   ├── portfolioData.js       # Personal info, education, skills & activity metadata
│   │   ├── schemaExplorerData.js  # Star & Snowflake schema definitions
│   │   ├── educationEmploymentData.js # 105-country longitudinal dataset (2019–2025)
│   │   ├── marketingData.js       # 2025 Marketing campaigns & daily performance data
│   │   └── electionData.js        # Regional & provincial election dataset (2016–2025)
│   ├── styles/
│   │   └── portfolio.css          # Complete Light/Dark theme, workbench & responsive styles
│   ├── App.jsx                    # Root React router & state controller
│   └── main.jsx                   # React DOM entry point
├── index.html                     # Vite HTML entry point
├── package.json                   # Dependencies (React 18, Chart.js, Vite)
├── vite.config.js                 # Vite build & dev server configuration
├── vercel.json                    # Vercel SPA routing & build configuration
└── .gitignore                     # Git ignore rules
```

---

## 🚀 Deploying to Vercel

This project is pre-configured with [`vercel.json`](./vercel.json), [`package.json`](./package.json), and [`vite.config.js`](./vite.config.js) for zero-configuration deployment on **Vercel**:

### Option 1: Deploy via GitHub + Vercel Dashboard
1. Push this `denmark-portfolio` folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel will automatically detect **Vite** (`Framework Preset: Vite`, `Build Command: npm run build`, `Output Directory: dist`).
4. Click **Deploy**.

### Option 2: Deploy via Vercel CLI
```bash
npm install
npx vercel --prod
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server (http://localhost:5173)
npm run dev

# 3. Build production bundle into /dist
npm run build
```

