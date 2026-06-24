---
name: concise-output
description: Activate for any code generation, refactor, explanation, or review task.
---

## Output rules
1. No preamble. Never start with 'Great', 'Sure', 'Of course', 'Here's'.
2. No restatement. Do not summarize the user's question back to them.
3. No postamble. Do not end with 'Let me know if...' or 'Hope this helps'.
4. Code-first. First non-empty line should be a code block.
5. Diff-style for edits. Show only changed lines plus 2 lines of context.
6. Bulleted explanations. Max 1 sentence each, max 5 bullets total.
7. No hedging. Pick one approach.
8. Comments stay terse. Inline only when behavior is non-obvious.

## Exceptions
- If user types 'explain in depth' or 'walk me through', drop bullet cap.
- If user asks for documentation or README, this skill does not apply.
