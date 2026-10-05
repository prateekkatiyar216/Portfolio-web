import {
  Bot,
  Brain,
  ChartLine,
  CodeXml,
  Database,
  FolderGit2,
  Layers,
  LayoutTemplate,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wrench,
  Cloud,
  Palette,
} from 'lucide-react'

/**
 * Presentation-only mapping from data (category names / tech keywords) to
 * icons. Unknown categories fall back to a neutral icon, so new categories
 * in the Excel sheet work without code changes.
 */
const CATEGORY_ICONS = [
  [/front|ui|web/i, LayoutTemplate],
  [/mobile|android|ios/i, Smartphone],
  [/back|server|api/i, Server],
  [/gen.?ai|llm|generative/i, Sparkles],
  [/machine|ml|data science|deep|ai/i, Brain],
  [/program|language/i, CodeXml],
  [/data ?base|storage|sql/i, Database],
  [/cloud|devops/i, Cloud],
  [/design/i, Palette],
  [/security|cyber/i, ShieldCheck],
  [/tool|other|misc/i, Wrench],
]

export function categoryIcon(name = '') {
  return CATEGORY_ICONS.find(([re]) => re.test(name))?.[1] ?? Layers
}

const PROJECT_ICONS = [
  [/rag|gen.?ai|llm|chat ?bot|gpt/i, Bot],
  [/react native|expo|mobile|android|ios|flutter/i, Smartphone],
  [/security|login|auth|threat|hack/i, ShieldCheck],
  [/machine learning|regression|predict|tensorflow|pytorch|scikit/i, ChartLine],
  [/flask|django|node|express|api/i, Server],
]

/** Picks an icon from a project's name + stack + category. */
export function projectIcon(project) {
  const haystack = [project.category, project.name, ...project.stack].filter(Boolean).join(' ')
  return PROJECT_ICONS.find(([re]) => re.test(haystack))?.[1] ?? FolderGit2
}
