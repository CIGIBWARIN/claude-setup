---
name: build-to-target
description: Build anything with a visible or checkable result (page, app, game, chart, document, video, script output) by pinning a target, then looping build, look, compare, fix. Use for "make it look or work like X".
---

# Build to target

Slop comes from building blind and stopping when the code compiles. Quality comes from a concrete target and a loop that checks the real output against it.

## 1. Pin the target before building

Use the most concrete thing available:

- **Visual work:** reference images. Use the user's, or find real examples. Failing that, name 3 to 5 measurable traits (layout, palette hex codes, type scale, spacing). For web pages, the taste skill supplies directions.
- **Behavior:** exact inputs and the outputs they should give, or the command and what it should print.
- **Documents and content:** an example of the target format and voice.
- **Performance:** a number, such as 60 fps or under 200 ms.

Write the target down in 3 to 6 lines. If it's only a guess, ask once.

## 2. Build the smallest version that runs end to end

## 3. Look at the real output, never only the code

- **Web UI or graphics:** use `/run` if the project has a run command. Otherwise, open it in a browser and take a screenshot: the built-in browser pane in the desktop app, the agent-browser CLI if installed, taste's inspector, or `chrome`/`msedge` `--headless --screenshot`. Check the console for errors.
- **Scripts and CLIs:** run them with the target inputs.
- **Files** (docs, slides, data, video): open them and inspect the result.

## 4. Compare, list the gaps, fix the biggest one

Name concrete gaps, like "header twice too tall" or "contrast too low", not "looks off". Fix the biggest gap, then go back to step 3.

## 5. Stop when it matches, or after about 5 rounds

Report the target, the evidence (a screenshot path, the output, or a number), and what still differs, in one line. If rounds stop improving, name the blocker and ask.
