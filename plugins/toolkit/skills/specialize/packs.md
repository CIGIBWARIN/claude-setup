# Optional packs

These are free extras for specific kinds of projects. Suggest at most two, and only when the project clearly fits. Install them at project scope after the user says yes. Each one costs context in every session, which is why none are part of the core install.

| Pack | Suggest when | Marketplace repo | Plugin |
|---|---|---|---|
| Marketing and copy: 52 skills for copywriting, SEO, conversion, ads and analytics | marketing site, landing pages, launches, growth work | `coreyhaines31/marketingskills` | `marketing-skills@marketingskills` |
| Trend research across Reddit, Hacker News, YouTube, Polymarket and GitHub. X and others need optional keys, and it reads browser cookies only if the user opts in | research, content ideas, market or competitor scans | `mvanhorn/last30days-skill` | `last30days@last30days-skill` |
| Obsidian: notes, Bases and Canvas | the folder is an Obsidian vault (it has a `.obsidian/` folder) | `kepano/obsidian-skills` | `obsidian@obsidian-skills` |
| Data files: query CSV, Parquet, Excel and JSON with SQL | analysis on data files, reports from spreadsheets | `anthropics/claude-plugins-official` | `duckdb-skills@claude-plugins-official` |
| Video creation: turns HTML into MP4 with captions and voiceover. It renders locally and needs Node 22+, FFmpeg and Chrome | making promo, social or explainer videos | `anthropics/claude-plugins-official` | `hyperframes@claude-plugins-official` |
| Business roles from Anthropic: `sales`, `finance`, `legal`, `product-management`, `marketing`, `small-business`, `operations`, `human-resources`, `customer-support`, `design`. Some features need the matching app connected | business or ops work in that role | `anthropics/knowledge-work-plugins` | `<role>@knowledge-work-plugins` |

## Installing a pack

1. Run `claude plugin marketplace add <marketplace repo>`. Skip this for `claude-plugins-official`, which is already added.
2. In the project folder, run `claude plugin install <plugin> --scope project`.
3. In `.claude/settings.json`, add the marketplace under `extraKnownMarketplaces` as `{"source": {"source": "github", "repo": "<marketplace repo>"}}`. This lets cloud sessions and teammates resolve the pack. Skip this step for `claude-plugins-official`.
4. Tell the user to restart Claude.
