import { Menu, LogOut } from 'lucide-react'
import { AppBreadcrumbs } from '@/components/layout/AppBreadcrumbs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSignOut } from '@/features/auth/hooks/authActions'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/AuthContext'

type NavbarProps = {
  onMenuClick: () => void
}

function getInitials(email: string | null, displayName: string | null): string {
  const source = displayName?.trim() || email?.trim() || '?'
  const parts = source.split(/\s+/)

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth()
  const { isAdmin, role } = useRole()
  const signOut = useSignOut()

  return (
    <header className="flex min-h-14 shrink-0 items-center justify-between border-b bg-background px-4 py-2 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <AppBreadcrumbs />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(user?.email ?? null, user?.displayName ?? null)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[160px] truncate text-sm sm:inline">
              {user?.email}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="truncate text-sm font-medium">
                {user?.displayName ?? user?.email}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
              <Badge
                variant={isAdmin ? 'default' : 'secondary'}
                className={cn(
                  'mt-1 w-fit capitalize',
                  isAdmin && 'bg-blue-600 hover:bg-blue-600/90',
                )}
              >
                {role}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
