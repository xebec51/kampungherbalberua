import { motion } from "framer-motion";

/**
 * Fixed lookup of pre-built motion components for the tags this design
 * system actually uses. Using a static lookup (instead of `motion.create()`
 * per render) keeps component identity stable across re-renders, so React
 * never needlessly unmounts/remounts the underlying DOM node and animation
 * state.
 *
 * Consumers must index this map directly in their component body, e.g.
 * `const MotionTag = tagMap[as];` — routing the lookup through a helper
 * function trips the `react-hooks/static-components` lint rule, which
 * can't verify a function call always returns a stable component
 * reference the way it can a plain object index.
 */
const preciseTagMap = {
  div: motion.div,
  span: motion.span,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  footer: motion.footer,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  dl: motion.dl,
  dt: motion.dt,
  dd: motion.dd,
  figure: motion.figure,
  a: motion.a,
  button: motion.button,
} as const;

export type MotionTagName = keyof typeof preciseTagMap;

/**
 * Same components as above, but typed uniformly as `typeof motion.div`.
 * The concrete elements rendered still differ per tag at runtime (a real
 * `<section>`, `<button>`, etc.) — this loosens only the *type* so a
 * dynamic `MotionTagName` lookup (e.g. `tagMap[as]`) doesn't force every
 * caller to deal with the full ref/attribute intersection type
 * TypeScript would otherwise infer across all tag variants.
 */
export const tagMap = preciseTagMap as Record<MotionTagName, typeof motion.div>;
