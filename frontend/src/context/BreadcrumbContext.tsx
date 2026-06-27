import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type BreadcrumbContextValue = {
  currentLabel: string | null
  setCurrentLabel: (label: string | null) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [currentLabel, setCurrentLabelState] = useState<string | null>(null)

  const setCurrentLabel = useCallback((label: string | null) => {
    setCurrentLabelState(label)
  }, [])

  const value = useMemo(
    () => ({ currentLabel, setCurrentLabel }),
    [currentLabel, setCurrentLabel],
  )

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumbContext() {
  return useContext(BreadcrumbContext)
}

/** Set the label for the current page's last breadcrumb segment (cleared on unmount). */
export function useBreadcrumbLabel(label: string | null) {
  const context = useContext(BreadcrumbContext)

  useEffect(() => {
    if (!context) return

    context.setCurrentLabel(label)

    return () => {
      context.setCurrentLabel(null)
    }
  }, [context, label])
}

export type BreadcrumbItem = {
  label: string
  href?: string
}

export function buildBreadcrumbs(
  pathname: string,
  currentLabel: string | null,
): BreadcrumbItem[] {
  if (pathname === '/dashboard') {
    return [{ label: 'Dashboard' }]
  }

  if (pathname.startsWith('/products')) {
    const crumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard' },
    ]

    if (pathname === '/products') {
      crumbs.push({ label: 'Products' })
      return crumbs
    }

    crumbs.push({ label: 'Products', href: '/products' })

    if (pathname === '/products/new') {
      crumbs.push({ label: 'New Product' })
      return crumbs
    }

    if (/^\/products\/[^/]+$/.test(pathname)) {
      crumbs.push({ label: currentLabel ?? 'Product Details' })
    }

    return crumbs
  }

  return [{ label: 'Dashboard', href: '/dashboard' }]
}
