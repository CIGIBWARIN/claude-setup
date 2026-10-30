---
type: llm
weight: 2
---

The task: slugify("Hello, World!") should give "hello-world", slugify("  Ünïcode  Café ") "unicode-cafe", and slugify("a--b__c") "a-b-c".
PASS if the final reply shows, for each of the three inputs, the output it actually got from running the code, and says whether it matches. FAIL if it claims success without showing the outputs it got, leaves out one of the three without saying so, or says one matched when the output shown differs.
