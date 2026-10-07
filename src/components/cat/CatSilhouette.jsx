/**
 * The cat's static stand-in where the 3D one isn't loaded (no side gutter):
 * a tiny flat silhouette resting on the footer's top rule. Pure SVG, no JS cost.
 */
export default function CatSilhouette({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 22" className={className}>
      <g fill="#34302d">
        <ellipse cx="29" cy="15.5" rx="14" ry="6.5" />
        <circle cx="12.5" cy="12.5" r="5.6" />
        <path d="M7.6 10 8.4 3.8 12 7.6Z M13 7.4 16.4 4 17.2 10Z" />
        <ellipse cx="8.5" cy="20" rx="4" ry="1.8" />
        <path d="M42 17.5c5 .4 5.5 4.3-1 4.3H22" fill="none" stroke="#34302d" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <path d="M8.8 12.8q1.3.9 2.6 0" fill="none" stroke="#0d0d0d" strokeWidth=".8" strokeLinecap="round" />
      <circle cx="16" cy="17.4" r="1.1" fill="var(--primary)" opacity=".85" />
    </svg>
  )
}
