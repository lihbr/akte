---
title: Comparisons
---

# Comparisons

Overall, the main difference between Akte and the tools listed below is that Akte has a much smaller scope than any of them, and is much lower level.

These comparisons exists to help sharing a better picture of where Akte stands next to other tool.

:::callout{icon=❔ title="Noticed an error?"}
If you noticed any error, or think a statement is unclear or wrong, [feel free to open a PR](https://github.com/lihbr/akte/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc)~
:::

## 11ty

[11ty](https://11ty.dev) is an awesome static site generator which I had the opportunity to work with a lot[^1]. Among the other tools listed here, 11ty might be the closest one to Akte.

11ty and Akte both can:
- Generate various kind of files
- Be used programmatically
- Fully or partially run in serverless environments
- Provide integration with Vite

Unlike 11ty, Akte:
- Is TypeScript first and allows you to type all your data[^2]
- Exports [ESM](https://nodejs.org/api/esm.html) code ([CJS](https://nodejs.org/api/modules.html) exports are also available)
- Does not natively integrate with any template language
- Does not have (yet?) a dedicated plugin API

## Astro

[Astro](https://astro.build) is an all-in-one web framework embracing the [island architecture](https://jasonformat.com/islands-architecture) and providing integrations with most JavaScript frameworks.

Overall, Astro is **much more** featureful t²han Akte but lacks some flexibility coming to its serverless integrations[^3], but it's improving fast. Astro also does not seem to offer a programmatic API.

[^1]: I [created and maintain 11ty plugins](https://github.com/prismicio-community/eleventy-plugin-prismic), had the opportunity [give talks about 11ty](https://lihbr.com/talks/11ties/integrating-11ty-with-a-cms-and-making-it-cool-to-use), and [my website](https://lihbr.com), among others, was built with 11ty
[^2]: [It's fair to note 11ty can run TypeScript with 3rd party tools](https://gist.github.com/zachleat/b274ee939759b032bc320be1a03704a2)
[^3]: Namely, Astro is not able to have a same page used both at build time and in a serverless environment, which has been a dealbreaker for me on previous occasions, this might be worked around leveraging [Astro integration API](https://docs.astro.build/en/reference/integrations-reference)
