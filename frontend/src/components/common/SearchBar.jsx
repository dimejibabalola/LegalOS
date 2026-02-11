import { useState, useCallback, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  onChange,
  debounce = 300,
  className,
  value: controlledValue,
  clearable = true,
}) {
  const [value, setValue] = useState(controlledValue || '')
  const isControlled = controlledValue !== undefined

  useEffect(() => {
    if (isControlled) {
      setValue(controlledValue)
    }
  }, [controlledValue, isControlled])

  const debouncedSearch = useCallback(
    debounceFn((query) => {
      onSearch?.(query)
    }, debounce),
    [onSearch, debounce]
  )

  const handleChange = (e) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange?.(newValue)
    debouncedSearch(newValue)
  }

  const handleClear = () => {
    setValue('')
    onChange?.('')
    onSearch?.('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(value)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-10 pr-10"
        value={value}
        onChange={handleChange}
      />
      {clearable && value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  )
}

function debounceFn(fn, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
