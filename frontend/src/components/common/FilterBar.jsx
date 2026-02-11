import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export function FilterBar({ filters, onFilterChange, className }) {
  const [activeFilters, setActiveFilters] = useState({})

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value }
    if (!value || value === 'all') {
      delete newFilters[key]
    }
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilters = () => {
    setActiveFilters({})
    onFilterChange?.({})
  }

  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Filters:</span>
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={activeFilters[filter.key] || 'all'}
          onValueChange={(value) => handleFilterChange(filter.key, value)}
        >
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 gap-1 text-slate-500"
        >
          <X className="h-3 w-3" />
          Clear
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
            {activeFilterCount}
          </Badge>
        </Button>
      )}
    </div>
  )
}
