---
name: build-to-target
description: Build anything with a visible or checkable result (UI, page, game, chart, CLI output, generated file) by pinning a concrete target first and then looping build, look, compare, fix until the real output matches it. Use when building or reworking something the user will look at or run, or when the user says make it look/work like X.
---

# Build to target

Slop comes from building blind and stopping when the code compiles. Quality comes from a concrete target and a loop that checks the real output against it.

## 1. Pin the target before writing code

Pick the most concrete target available. It needs to be something you can compare against, not adjectives.

- **Visual work:** reference images. Use any the user gave you. Otherwise find real examples (sites, screenshots, open image collections) or describe 3 to 5 measurable traits (layout, palette hex codes, type scale, spacing, motion). For web pages, the taste skill provides directions and references.
- **Behavior:** the exact inputs and expected outputs, or the command and the output it should print.
- **Performance:** a number, such as 60 fps, under 200 ms, or under 50 MB.

Write the target in 3 to 6 lines in your reply. If it's a guess, ask once. Otherwise proceed.

## 2. Build the smallest version that runs end to end

Get something running first, then improve it. Don't polish a part before the whole thing runs.

## 3. Look at the real output yourself

Never judge from the code alone.

- **UI or graphics:** open it in a browser (the Playwright or Chrome DevTools tools, or the built-in browser pane) and take a screenshot. Check the console for errors. Check the frame rate when it matters.
- **CLI or scripts:** run them with the target inputs.
- **Generated files:** open and inspect them.

## 4. Compare, list the gaps, fix the biggest one

Put the output next to the target and list concrete gaps, for example "header 2x too tall" or "button contrast too low". Don't write "looks off". Fix the largest gap first, then go back to step 3.

## 5. Stop when it matches, or after about 5 loops

Report:

- the target
- the final evidence: screenshot path, output, or numbers
- what still differs from the target, in one line

If loops stop improving, say what's blocking and ask. Don't keep spinning.
