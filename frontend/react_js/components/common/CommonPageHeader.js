import Link from 'next/link'
import styles from './CommonPageHeader.module.css'

export default function CommonPageHeader({ title, strongText, breadcrumbs }) {
  return (
    <section className="page-header page-header-modern bg-color-grey page-header-sm">
      <div className={styles.pageHeaderContainer}>
        <div className="row">
          <div className="col-md-8 order-2 order-md-1 align-self-center p-static">
            <h1 className="text-dark">
              {title && <span className="text-color-default">{title} </span>}
              <strong>{strongText}</strong>
            </h1>
          </div>
          <div className="col-md-4 order-1 order-md-2 align-self-center">
            <ul className="breadcrumb d-block text-md-end">
              {breadcrumbs && breadcrumbs.map((crumb, index) => (
                <li key={index} className={index === breadcrumbs.length - 1 ? 'active' : ''}>
                  {crumb.link ? (
                    <Link href={crumb.link}>{crumb.text}</Link>
                  ) : (
                    crumb.text
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}




