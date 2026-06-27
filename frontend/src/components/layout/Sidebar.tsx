import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Package,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSignOut } from '@/features/auth/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/AuthContext'

type SidebarProps = {
  open: boolean
  onClose: () => void
}

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
]

function getInitials(email: string | null, displayName: string | null): string {
  const source = displayName?.trim() || email?.trim() || '?'
  const parts = source.split(/\s+/)

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

function isActiveRoute(href: string, pathname: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }

  if (href === '/products') {
    return (
      pathname === '/products' ||
      (pathname.startsWith('/products/') && pathname !== '/products/new')
    )
  }

  return pathname === href
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()
  const { isAdmin, role } = useRole()
  const signOut = useSignOut()

  const visibleNavItems = navItems

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between p-6">
          <div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="mt-3 text-lg font-bold">SaaS Dashboard</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator />

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {visibleNavItems.map(({ label, href, icon: Icon }) => {
            const active = isActiveRoute(href, location.pathname)

            return (
              <Link key={href} to={href} onClick={onClose}>
                <Button
                  variant={active ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start gap-2')}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="space-y-3 border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">
                {getInitials(user?.email ?? null, user?.displayName ?? null)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user?.displayName ?? user?.email}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
              <Badge
                variant={isAdmin ? 'default' : 'secondary'}
                className={cn(
                  'mt-1 capitalize',
                  isAdmin && 'bg-blue-600 hover:bg-blue-600/90',
                )}
              >
                {role}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => void signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}
