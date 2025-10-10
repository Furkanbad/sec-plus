// app/api/analyze-sec/constants/llm-instructions.ts

export const EXCERPT_INSTRUCTION = `
**🔴 CRITICAL INSTRUCTION FOR ALL EXCERPTS:**

Every field named 'originalExcerpt', 'excerpt', 'summaryExcerpt', etc. MUST contain:
1. ✅ EXACT, WORD-FOR-WORD quotes from the provided text
2. ✅ Copy-paste directly from the source (1-3 consecutive sentences)
3. ✅ Keep ALL original punctuation, numbers, special characters (®, ™, €, $, %)
4. ✅ Maintain original capitalization

❌ DO NOT:
- Paraphrase, summarize, or rewrite
- Create your own descriptive sentences
- Combine text from different paragraphs
- Add explanatory context
- Remove special characters or trademarks

✅ CORRECT Example:
"The Company's total net sales increased 2% or $7.8 billion during 2024 compared to 2023."

❌ INCORRECT Example:
"iPhone is the Company's line of smartphones based on its iOS operating system."
(This is YOUR description, not a quote!)

If no suitable EXACT quote exists, use: "No direct excerpt found."
`;

export const JSON_EXCERPT_INSTRUCTION = `Return JSON with EXACT quotes in all excerpt fields.`;
