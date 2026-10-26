---
description: Done means verified; the fix is run before it is called done.
max_turns: 12
allowed_tools: [Read, Write, Edit, Bash]
---

Create `price.py` with exactly this code, then fix the bug so `total([3, 4])` returns 7:

```python
def total(xs):
    s = 0
    for x in xs[1:]:
        s += x
    return s
```
