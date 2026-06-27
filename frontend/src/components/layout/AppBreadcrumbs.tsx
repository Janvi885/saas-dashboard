import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  buildBreadcrumbs,
  useBreadcrumbContext,
} from '@/context/BreadcrumbContext'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function AppBreadcrumbs() {
  const location = useLocation()
  const context = useBreadcrumbContext()
  const crumbs = buildBreadcrumbs(
    location.pathname,
    context?.currentLabel ?? null,
  )

  if (crumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="max-w-[180px] truncate sm:max-w-xs">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
