import { getPublicAssetUrl } from '../utils/assets'

function ResourceLinks({ links }) {
  return (
    <ul>
      {links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          <a href={link.href} target="_blank" rel="noreferrer">
            {link.iconType === 'image' ? (
              <img
                className={link.iconClassName}
                src={getPublicAssetUrl(link.icon)}
                alt=""
              />
            ) : (
              <svg
                className={link.iconClassName}
                role="presentation"
                aria-hidden="true"
              >
                <use href={getPublicAssetUrl(link.icon)}></use>
              </svg>
            )}
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default ResourceLinks
