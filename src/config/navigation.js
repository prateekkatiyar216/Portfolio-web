/**
 * Site sections in page order. `hasData` decides whether a section (and its
 * nav link) is rendered, so empty sheets never produce empty sections.
 */
export const SECTIONS = [
  { id: 'about', label: 'About', hasData: (d) => Boolean(d.profile.summary) || d.skills.soft.length > 0 },
  { id: 'experience', label: 'Experience', hasData: (d) => d.experience.length > 0 },
  { id: 'projects', label: 'Projects', hasData: (d) => d.projects.length > 0 },
  { id: 'skills', label: 'Skills', hasData: (d) => d.skills.groups.length > 0 },
  {
    id: 'education',
    label: 'Education',
    hasData: (d) => d.education.length > 0 || d.certifications.length > 0 || d.achievements.length > 0,
  },
  { id: 'contact', label: 'Contact', hasData: () => true },
]

export function visibleSections(data) {
  return SECTIONS.filter((s) => s.hasData(data))
}
