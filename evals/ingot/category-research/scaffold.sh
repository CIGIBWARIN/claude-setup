mkdir -p .claude && echo '{"env":{"INGOT_CATEGORY":"research"}}' > .claude/settings.json
cat > sales.csv <<'CSV'
month,revenue
2026-01,12000
2026-02,12600
2026-03,13860
2026-04,13860
CSV
