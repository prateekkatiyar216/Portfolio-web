/**
 * Excel schema description.
 *
 * Sheet names and column headers are matched loosely (case, spacing and
 * punctuation are ignored) against the alias lists below, so renaming
 * "Organization" to "Company" or "Tech Stack" to "Technologies" in the
 * workbook keeps working without touching any code.
 *
 * To support a new column, add its header (or an alias) here and read it in
 * normalizeData.js.
 */

export const SHEETS = {
  personal: ['Personal Info', 'Personal', 'Profile', 'About', 'Contact'],
  skills: ['Skills', 'Technical Skills', 'Tech Skills'],
  softSkills: ['Soft Skills', 'Softskills'],
  education: ['Education', 'Academics', 'Qualifications'],
  experience: ['Experience', 'Work Experience', 'Work', 'Internships', 'Employment'],
  projects: ['Projects', 'Project'],
  certifications: ['Certifications', 'Certificates', 'Certification'],
  achievements: ['Achievements', 'Awards', 'Honors', 'Hackathons'],
}

export const COLUMNS = {
  personal: {
    field: ['Field', 'Key', 'Label', 'Name'],
    value: ['Details', 'Value', 'Detail', 'Info'],
  },
  skills: {
    category: ['Category', 'Group', 'Type', 'Area'],
    skill: ['Skill', 'Skills', 'Name', 'Technology'],
  },
  softSkills: {
    skill: ['Soft Skill', 'Skill', 'Name'],
  },
  education: {
    institution: ['Institution', 'School', 'College', 'University'],
    city: ['City', 'Location'],
    qualification: ['Qualification', 'Degree', 'Course', 'Program'],
    field: ['Stream / Subjects', 'Stream', 'Subjects', 'Field', 'Major', 'Specialization'],
    start: ['Start Year', 'Start', 'From'],
    end: ['End Year', 'End', 'To', 'Year'],
    score: ['Score', 'CGPA', 'GPA', 'Percentage', 'Grade'],
    details: ['Details', 'Description', 'Notes'],
  },
  experience: {
    role: ['Role', 'Title', 'Position', 'Designation'],
    organization: ['Organization', 'Company', 'Employer', 'Organisation'],
    location: ['Location', 'City'],
    start: ['Start', 'Start Date', 'From'],
    end: ['End', 'End Date', 'To'],
    mentor: ['Mentor', 'Manager', 'Supervisor'],
    highlight: ['Responsibility / Achievement', 'Responsibility', 'Achievement', 'Description', 'Details'],
    tech: ['Tech Stack', 'Technologies', 'Tech', 'Stack'],
  },
  projects: {
    name: ['Project', 'Name', 'Title', 'Project Name'],
    stack: ['Tech Stack', 'Technologies', 'Tech', 'Stack'],
    description: ['Description', 'Details', 'Summary'],
    github: ['GitHub', 'Github URL', 'Repository', 'Repo', 'Source'],
    demo: ['Live Demo', 'Demo', 'Live', 'Live URL', 'URL', 'Website'],
    image: ['Image', 'Screenshot', 'Thumbnail', 'Image URL'],
    category: ['Category', 'Type'],
    featured: ['Featured', 'Highlight', 'Is Featured'],
  },
  certifications: {
    name: ['Certification', 'Certificate', 'Name', 'Title'],
    issuer: ['Issuer', 'Issued By', 'Organization', 'Provider'],
    date: ['Date', 'Issued', 'Issue Date', 'Year'],
    url: ['Certificate Link', 'Link', 'URL', 'Credential URL'],
  },
  achievements: {
    title: ['Achievement', 'Award', 'Title', 'Name'],
    description: ['Description', 'Details'],
    date: ['Date', 'Year'],
    url: ['Link', 'URL'],
  },
}

/** Personal-info rows ("Field" column) mapped to profile keys. */
export const PERSONAL_FIELDS = {
  name: ['Full Name', 'Name'],
  title: ['Title', 'Headline', 'Role', 'Professional Title'],
  location: ['Location', 'City', 'Address'],
  phone: ['Phone', 'Mobile', 'Phone Number', 'Contact Number'],
  email: ['Email', 'E-mail', 'Mail'],
  summary: ['Professional Summary', 'Summary', 'About', 'Bio', 'Introduction'],
  tagline: ['Tagline', 'Short Intro'],
}

/**
 * Known profile/link platforms. Any other Personal Info row whose value is a
 * URL is still shown, as a generic "website" link.
 */
export const LINK_PLATFORMS = [
  { id: 'github', label: 'GitHub', aliases: ['GitHub', 'Github Profile'], kind: 'code' },
  { id: 'linkedin', label: 'LinkedIn', aliases: ['LinkedIn', 'Linkedin Profile'], kind: 'social' },
  { id: 'leetcode', label: 'LeetCode', aliases: ['LeetCode'], kind: 'coding' },
  { id: 'hackerrank', label: 'HackerRank', aliases: ['HackerRank'], kind: 'coding' },
  { id: 'tryhackme', label: 'TryHackMe', aliases: ['TryHackMe'], kind: 'coding' },
  { id: 'codeforces', label: 'Codeforces', aliases: ['Codeforces'], kind: 'coding' },
  { id: 'codechef', label: 'CodeChef', aliases: ['CodeChef'], kind: 'coding' },
  { id: 'gfg', label: 'GeeksforGeeks', aliases: ['GeeksforGeeks', 'GFG'], kind: 'coding' },
  { id: 'kaggle', label: 'Kaggle', aliases: ['Kaggle'], kind: 'coding' },
  { id: 'twitter', label: 'X', aliases: ['Twitter', 'X'], kind: 'social' },
  { id: 'website', label: 'Website', aliases: ['Website', 'Portfolio', 'Blog'], kind: 'social' },
]
