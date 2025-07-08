import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, Hash, Type } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: { value: string; label: string; }[];
  placeholder?: string;
}

export interface ActiveFilter {
  id: string;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greater' | 'less' | 'between';
}

interface AdvancedSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  activeFilters?: ActiveFilter[];
  onFiltersChange?: (filters: ActiveFilter[]) => void;
  placeholder?: string;
  debounceMs?: number;
  showFilterCount?: boolean;
  className?: string;
}

// Custom hook for debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  searchValue,
  onSearchChange,
  filters = [],
  activeFilters = [],
  onFiltersChange,
  placeholder = "Search...",
  debounceMs = 300,
  showFilterCount = true,
  className
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<ActiveFilter[]>(activeFilters);

  const debouncedSearchValue = useDebounce(localSearchValue, debounceMs);

  // Update search value when debounced value changes
  useEffect(() => {
    if (debouncedSearchValue !== searchValue) {
      onSearchChange(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearchChange, searchValue]);

  // Sync local search value with prop
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  // Sync temp filters with active filters
  useEffect(() => {
    setTempFilters(activeFilters);
  }, [activeFilters]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchValue(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setLocalSearchValue('');
    onSearchChange('');
  }, [onSearchChange]);

  const handleAddFilter = useCallback((filterId: string, value: any, operator: string = 'equals') => {
    const newFilter: ActiveFilter = { id: filterId, value, operator: operator as ActiveFilter['operator'] };
    const updatedFilters = tempFilters.filter(f => f.id !== filterId);
    updatedFilters.push(newFilter);
    setTempFilters(updatedFilters);
  }, [tempFilters]);

  const handleRemoveFilter = useCallback((filterId: string) => {
    const updatedFilters = tempFilters.filter(f => f.id !== filterId);
    setTempFilters(updatedFilters);
  }, [tempFilters]);

  const handleApplyFilters = useCallback(() => {
    onFiltersChange?.(tempFilters);
    setIsFilterOpen(false);
  }, [tempFilters, onFiltersChange]);

  const handleClearAllFilters = useCallback(() => {
    setTempFilters([]);
    onFiltersChange?.([]);
  }, [onFiltersChange]);

  const getFilterIcon = (type: FilterOption['type']) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'number': return <Hash className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      default: return <Filter className="w-4 h-4" />;
    }
  };

  const getFilterLabel = (filter: ActiveFilter) => {
    const filterOption = filters.find(f => f.id === filter.id);
    if (!filterOption) return filter.id;

    let valueLabel = filter.value;
    if (filterOption.type === 'select' && filterOption.options) {
      const option = filterOption.options.find(o => o.value === filter.value);
      valueLabel = option?.label || filter.value;
    }

    return `${filterOption.label}: ${valueLabel}`;
  };

  const renderFilterInput = (filter: FilterOption) => {
    const activeFilter = tempFilters.find(f => f.id === filter.id);
    const currentValue = activeFilter?.value || '';

    switch (filter.type) {
      case 'select':
        return (
          <Select
            value={currentValue}
            onValueChange={(value) => handleAddFilter(filter.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleAddFilter(filter.id, e.target.value)}
            placeholder={filter.placeholder || `Enter ${filter.label}`}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={currentValue}
            onChange={(e) => handleAddFilter(filter.id, e.target.value)}
          />
        );

      case 'text':
      default:
        return (
          <Input
            type="text"
            value={currentValue}
            onChange={(e) => handleAddFilter(filter.id, e.target.value)}
            placeholder={filter.placeholder || `Enter ${filter.label}`}
          />
        );
    }
  };

  const activeFilterCount = activeFilters.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          value={localSearchValue}
          onChange={handleSearchInputChange}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {localSearchValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {showFilterCount && activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Filter Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filters.map((filter) => (
                    <div key={filter.id} className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-2">
                        {getFilterIcon(filter.type)}
                        {filter.label}
                      </Label>
                      {renderFilterInput(filter)}
                    </div>
                  ))}
                  
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={handleApplyFilters}
                      size="sm"
                      className="flex-1"
                    >
                      Apply Filters
                    </Button>
                    <Button
                      onClick={handleClearAllFilters}
                      variant="outline"
                      size="sm"
                    >
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>

          {/* Active Filter Badges */}
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {getFilterLabel(filter)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFilter(filter.id)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch; 