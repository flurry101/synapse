import { Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router'
import ModelCard from '../../components/developer/ModelCard'
import SearchBar from '../../components/developer/SearchBar'
import SectionCard from '../../components/workspace/SectionCard'
import { developerModels, sortOptions, taskFilters } from '../../mocks/developerData'

const compareStorageKey = 'synapse_developer_compare'

export default function DeveloperSearch() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [taskFilter, setTaskFilter] = useState('All')
  const [sortBy, setSortBy] = useState(sortOptions[0].value)
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    const stored = localStorage.getItem(compareStorageKey)
    if (!stored) {
      return []
    }
    try {
      return JSON.parse(stored) as string[]
    } catch {
      return []
    }
  })

  const toggleCompare = (modelId: string) => {
    setCompareIds((current) => {
      const next = current.includes(modelId)
        ? current.filter((id) => id !== modelId)
        : [...current, modelId].slice(0, 4)
      localStorage.setItem(compareStorageKey, JSON.stringify(next))
      return next
    })
  }

  const results = useMemo(() => {
    const normalized = query.toLowerCase()
    const searched = developerModels.filter((model) => {
      const searchable = `${model.name} ${model.description} ${model.task} ${model.creator}`.toLowerCase()
      const queryMatch = normalized.length === 0 || searchable.includes(normalized)
      const taskMatch = taskFilter === 'All' || model.task === taskFilter
      return queryMatch && taskMatch
    })

    return [...searched].sort((left, right) => {
      if (sortBy === 'accuracy-desc') {
        return right.accuracy - left.accuracy
      }
      if (sortBy === 'latency-asc') {
        return left.latencyMs - right.latencyMs
      }
      if (sortBy === 'price-asc') {
        return (
          left.pricePerMInput + left.pricePerMOutput - (right.pricePerMInput + right.pricePerMOutput)
        )
      }
      return right.trustScore - left.trustScore
    })
  }, [query, sortBy, taskFilter])

  return (
    <Stack spacing={2.25}>
      <SectionCard
        title='Model search and results'
        subtitle='Search by use case, filter by task category, and compare shortlisted models'
      >
        <SearchBar value={query} onChange={setQuery} placeholder='Search models by use case or capability' />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <TextField
            select
            fullWidth
            label='Task/category filter'
            value={taskFilter}
            onChange={(event) => setTaskFilter(event.target.value)}
          >
            {taskFilters.map((filter) => (
              <MenuItem key={filter} value={filter}>
                {filter}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label='Sort options'
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          {taskFilters.slice(1).map((task) => (
            <Chip
              key={task}
              label={task}
              clickable
              color={task === taskFilter ? 'primary' : 'default'}
              onClick={() => setTaskFilter(task)}
            />
          ))}
          <Chip label='Clear filters' variant='outlined' onClick={() => setTaskFilter('All')} clickable />
        </Stack>
      </SectionCard>

      <SectionCard
        title='Model cards'
        subtitle={`${results.length} matching models${compareIds.length > 0 ? ` • ${compareIds.length} selected for comparison` : ''}`}
        action={
          <Button component={NavLink} to='/developer/compare' variant='contained' disabled={compareIds.length < 2}>
            Compare Selected
          </Button>
        }
      >
        {results.length === 0 && (
          <Typography sx={{ color: '#5f6f88' }}>No models found. Try a different use case or category.</Typography>
        )}
        <Stack spacing={1.5}>
          {results.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              selectedForCompare={compareIds.includes(model.id)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </Stack>
      </SectionCard>
    </Stack>
  )
}
