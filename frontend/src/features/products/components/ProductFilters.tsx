import { useEffect, useMemo, useState } from 'react'
import { ArrowDownAZ, ArrowUpAZ, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PRODUCT_CATEGORIES } from '@/features/products/schemas/product.schema'
import { cn } from '@/lib/utils'
import type { ProductFilters as ProductFiltersType } from '@/types'

type ProductFiltersProps = {
  filters: ProductFiltersType
  onFiltersChange: (updates: ProductFiltersType) => void
}

const DEFAULT_FILTERS: ProductFiltersType = {
  category: 'all',
  status: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

type ActiveFilterChip = {
  key: string
  label: string
  onRemove: () => void
}

function getActiveFilterChips(
  filters: ProductFiltersType,
  onFiltersChange: (updates: ProductFiltersType) => void,
  clearSearch: () => void,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  if (filters.search?.trim()) {
    chips.push({
      key: 'search',
      label: `Search: "${filters.search.trim()}"`,
      onRemove: () => {
        clearSearch()
        onFiltersChange({ search: undefined })
      },
    })
  }

  if (filters.category && filters.category !== 'all') {
    chips.push({
      key: 'category',
      label: `Category: ${filters.category}`,
      onRemove: () => onFiltersChange({ category: 'all' }),
    })
  }

  if (filters.status && filters.status !== 'all') {
    chips.push({
      key: 'status',
      label: `Status: ${filters.status === 'active' ? 'Active' : 'Inactive'}`,
      onRemove: () => onFiltersChange({ status: 'all' }),
    })
  }

  if (filters.sortBy && filters.sortBy !== 'createdAt') {
    const sortLabels: Record<string, string> = {
      updatedAt: 'Updated date',
      name: 'Name',
      price: 'Price',
    }
    chips.push({
      key: 'sortBy',
      label: `Sort: ${sortLabels[filters.sortBy] ?? filters.sortBy}`,
      onRemove: () => onFiltersChange({ sortBy: 'createdAt' }),
    })
  }

  if (filters.sortOrder && filters.sortOrder !== 'desc') {
    chips.push({
      key: 'sortOrder',
      label: 'Sort: Ascending',
      onRemove: () => onFiltersChange({ sortOrder: 'desc' }),
    })
  }

  return chips
}

function activeTriggerClass(isActive: boolean, widthClass: string) {
  return cn(
    widthClass,
    isActive &&
      'border-primary bg-primary/5 text-foreground ring-1 ring-primary/40',
  )
}

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '')

  const activeChips = useMemo(
    () => getActiveFilterChips(filters, onFiltersChange, () => setSearchInput('')),
    [filters, onFiltersChange],
  )

  const activeCount = activeChips.length
  const hasSearch = Boolean(filters.search?.trim())
  const hasCategory = Boolean(filters.category && filters.category !== 'all')
  const hasStatus = Boolean(filters.status && filters.status !== 'all')
  const hasCustomSort =
    (filters.sortBy && filters.sortBy !== 'createdAt') ||
    filters.sortOrder === 'asc'

  useEffect(() => {
    setSearchInput(filters.search ?? '')
  }, [filters.search])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim()
      if (trimmed !== (filters.search ?? '')) {
        onFiltersChange({ search: trimmed || undefined })
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput, filters.search, onFiltersChange])

  function clearFilters() {
    setSearchInput('')
    onFiltersChange({
      ...DEFAULT_FILTERS,
      page: 1,
      pageSize: filters.pageSize,
      search: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Filters</p>
        {activeCount > 0 && (
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
            +{activeCount} active
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className={cn(
              'pl-9',
              hasSearch && 'border-primary ring-1 ring-primary/40',
            )}
          />
        </div>

        <Select
          value={filters.category ?? 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              category: value as ProductFiltersType['category'],
            })
          }
        >
          <SelectTrigger
            className={activeTriggerClass(hasCategory, 'w-full lg:w-[180px]')}
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {PRODUCT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status ?? 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              status: value as ProductFiltersType['status'],
            })
          }
        >
          <SelectTrigger
            className={activeTriggerClass(hasStatus, 'w-full lg:w-[160px]')}
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy ?? 'createdAt'}
          onValueChange={(value) =>
            onFiltersChange({
              sortBy: value as ProductFiltersType['sortBy'],
            })
          }
        >
          <SelectTrigger
            className={activeTriggerClass(
              Boolean(filters.sortBy && filters.sortBy !== 'createdAt'),
              'w-full lg:w-[160px]',
            )}
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created date</SelectItem>
            <SelectItem value="updatedAt">Updated date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          className={cn(
            hasCustomSort &&
              'border-primary bg-primary/5 ring-1 ring-primary/40',
          )}
          onClick={() =>
            onFiltersChange({
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
            })
          }
          aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
        >
          {filters.sortOrder === 'asc' ? (
            <ArrowUpAZ className="h-4 w-4" />
          ) : (
            <ArrowDownAZ className="h-4 w-4" />
          )}
        </Button>
      </div>

      {activeCount > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="secondary"
                className="gap-1 pr-1 font-normal"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label={`Remove ${chip.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2 self-end sm:self-auto"
          >
            <X className="h-4 w-4" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
