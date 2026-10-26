# Optional packs

Free extras for specific kinds of projects. Suggest at most two, only when the project clearly fits, and install them at project scope after the user says yes. Each costs context every session, so none are in the core.

| Category | Pack | Suggest when | Marketplace repo | Plugin |
|---|---|---|---|---|
| agentic, coding | agent-browser: a fast browser CLI for clicking, filling forms, screenshots and scraping. Also run `npm i -g agent-browser && agent-browser install`, which downloads Chrome for Testing once per device. | browser tasks, web testing, scraping, CLI or cloud sessions without the built-in browser | `vercel-labs/agent-browser` | `agent-browser@agent-browser` |
| content | Marketing and copy: 52 skills covering copywriting, SEO, conversion and ads | marketing sites, landing pages, launches, growth work | `coreyhaines31/marketingskills` | `marketing-skills@marketingskills` |
| content | Slides: single-file HTML decks, styles chosen from previews, converts .pptx | presentations, talks, pitch decks | `zarazhangrui/frontend-slides` | `frontend-slides@frontend-slides` |
| content | Fiction and books: story bible, continuity checks, drafting | novels, short stories, scripts | `danjdewhurst/story-skills` | `story-skills@story-skills` |
| content | Video creation: HTML to MP4 with captions and voiceover, rendered locally. Needs Node 22+, FFmpeg and Chrome. Add `"HYPERFRAMES_NO_TELEMETRY": "1"` to `env` in `.claude/settings.json` (it sends usage data otherwise), and skip its HeyGen options, which need an account | promo, social or explainer videos | `anthropics/claude-plugins-official` | `hyperframes@claude-plugins-official` |
| research | Trend research across Reddit, Hacker News, YouTube, Polymarket and GitHub. Its setup adds free extra CLIs through npx. X needs an optional key; it reads browser cookies only if the user opts in. Decline its ScrapeCreators signup and its ht-ml.app publishing, which is public | trends, content ideas, market or competitor scans | `mvanhorn/last30days-skill` | `last30days@last30days-skill` |
| research | Academic: literature review, citations, paper lookup, peer review, all using free APIs. Install the skills directly: `npx skills add K-Dense-AI/scientific-agent-skills` and pick `literature-review`, `citation-management`, `paper-lookup`, `scientific-writing` and `peer-review` | papers, theses, scientific writing | — | — |
| research | Obsidian: notes, Bases and Canvas | the folder is an Obsidian vault (it has a `.obsidian/` folder) | `kepano/obsidian-skills` | `obsidian@obsidian-skills` |
| coding | Mobile apps with Expo (React Native) | iOS or Android apps | `anthropics/claude-plugins-official` | `expo@claude-plugins-official` |
| coding | Language servers: type errors after each edit for the project's main language. Its server must be on PATH, e.g. `go install golang.org/x/tools/gopls@latest` | the main language is Go, Rust, Java, C#, C/C++, Kotlin, PHP, Ruby, Swift or Lua | `anthropics/claude-plugins-official` | one of `gopls-lsp`, `rust-analyzer-lsp`, `jdtls-lsp`, `csharp-lsp`, `clangd-lsp`, `kotlin-lsp`, `php-lsp`, `ruby-lsp`, `swift-lsp`, `lua-lsp` (each `@claude-plugins-official`) |
| coding | Chrome DevTools: performance traces, Core Web Vitals, network and console debugging. Add `"CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS": "1"` to `env` in `.claude/settings.json` | web performance or debugging, pre-launch checks | `anthropics/claude-plugins-official` | `chrome-devtools-mcp@claude-plugins-official` |
| agentic, coding | Building for Claude: plugins, hooks, agents, MCP servers and MCPB bundles, from Anthropic | the project is a Claude plugin, skill set or MCP server | `anthropics/claude-plugins-official` | `plugin-dev@claude-plugins-official`, `mcp-server-dev@claude-plugins-official` |
| content, research, coding | Diagrams: 45 types (architecture, flowchart, sequence, ER, Gantt, Sankey) as one HTML/SVG file; imports Mermaid, draw.io and Excalidraw. Pages load Google Fonts | docs, explainers, reports or posts that need a diagram | `cathrynlavery/diagram-design` | `diagram-design@diagram-design` |
| research, agentic | Financial modeling: DCF, LBO, comps, 3-statement models and Excel audits on your own data. Ignore its paid data connectors | finance models, valuations | `anthropics/financial-services` | `financial-analysis@claude-for-financial-services` |
| any | Business roles from Anthropic: `sales`, `finance`, `legal`, `product-management`, `marketing`, `small-business`, `operations`, `human-resources`, `customer-support`, `design`, `data`. Some features need the matching app connected | business or ops work in that role | `anthropics/knowledge-work-plugins` | `<role>@knowledge-work-plugins` |

## Installing a pack

1. Run `claude plugin marketplace add <marketplace repo>`. Skip this step for `claude-plugins-official`.
2. In the project folder, run `claude plugin install <plugin> --scope project`.
3. In `.claude/settings.json`, add the marketplace under `extraKnownMarketplaces` as `{"source": {"source": "github", "repo": "<marketplace repo>"}}`, so cloud sessions and teammates can resolve it. Skip this step for `claude-plugins-official`.
4. Tell the user to restart Claude.
