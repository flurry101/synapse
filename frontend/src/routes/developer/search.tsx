import CloudQueueIcon from '@mui/icons-material/CloudQueue'
import StorageIcon from '@mui/icons-material/Storage'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router'
import ModelCard from '../../components/developer/ModelCard'
import SearchBar from '../../components/developer/SearchBar'
import SectionCard from '../../components/workspace/SectionCard'
import { DeveloperModel, sortOptions, taskFilters } from '../../mocks/developerData'
import modelService, { HFModelRecord } from '../../services/model.service'

const compareStorageKey = 'synapse_developer_compare'

export default function DeveloperSearch() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [taskFilter, setTaskFilter] = useState('All')
  const [sortBy, setSortBy] = useState(sortOptions[0].value)
  const [searchSource, setSearchSource] = useState<'catalog' | 'hf'>('catalog')
  const [loading, setLoading] = useState(true)
  const [models, setModels] = useState<DeveloperModel[]>([])
  const [hfModels, setHfModels] = useState<HFModelRecord[]>([])

  const [compareIds, setCompareIds] = useState<string[]>(() => {
    const stored = localStorage.getItem(compareStorageKey)
    if (!stored) return []
    try {
      return JSON.parse(stored) as string[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    let active = true
    async function executeSearch() {
      setLoading(true)
      try {
        if (searchSource === 'catalog') {
          const res = await modelService.getDeveloperModels({
            q: query,
            task: taskFilter,
            sort: sortBy,
          })
          if (active) setModels(res)
        } else {
          const hfRes = await modelService.searchHfModels(query, taskFilter, 20)
          if (active) setHfModels(hfRes)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    const timer = setTimeout(executeSearch, 150)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, taskFilter, sortBy, searchSource])

  const toggleCompare = (modelId: string) => {
    setCompareIds((current) => {
      const next = current.includes(modelId)
        ? current.filter((id) => id !== modelId)
        : [...current, modelId].slice(0, 4)
      localStorage.setItem(compareStorageKey, JSON.stringify(next))
      return next
    })
  }

  const sortedCatalogModels = useMemo(() => {
    return [...models].sort((left, right) => {
      if (sortBy === 'accuracy-desc') return right.accuracy - left.accuracy
      if (sortBy === 'latency-asc') return left.latencyMs - right.latencyMs
      if (sortBy === 'price-asc')
        return (
          left.pricePerMInput +
          left.pricePerMOutput -
          (right.pricePerMInput + right.pricePerMOutput)
        )
      return right.trustScore - left.trustScore
    })
  }, [models, sortBy])

  return (
    <Stack spacing={2.25}>
      <SectionCard
        title='Model Search & Discovery'
        subtitle='Browse the verified Synapse Catalog or query millions of open-weight models on Hugging Face'
      >
        <Tabs
          value={searchSource}
          onChange={(_, val) => setSearchSource(val)}
          sx={{ mb: 1, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            value='catalog'
            label='Synapse Catalog'
            icon={<StorageIcon />}
            iconPosition='start'
          />
          <Tab value='hf' label='Hugging Face Hub' icon={<CloudQueueIcon />} iconPosition='start' />
        </Tabs>

        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={
            searchSource === 'catalog'
              ? 'Search models by use case, task, or capability'
              : 'Search Hugging Face models by name or repo ID (e.g. llama-3, mistral, qwen)'
          }
        />

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
          {searchSource === 'catalog' && (
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
          )}
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
          <Chip
            label='Clear filters'
            variant='outlined'
            onClick={() => setTaskFilter('All')}
            clickable
          />
        </Stack>
      </SectionCard>

      <SectionCard
        title={searchSource === 'catalog' ? 'Catalog Models' : 'Hugging Face Hub Models'}
        subtitle={
          searchSource === 'catalog'
            ? `${sortedCatalogModels.length} models available ${
                compareIds.length > 0 ? ` • ${compareIds.length} selected for comparison` : ''
              }`
            : `${hfModels.length} Hugging Face models found`
        }
        action={
          searchSource === 'catalog' ? (
            <Button
              component={NavLink}
              to='/developer/compare'
              variant='contained'
              disabled={compareIds.length < 2}
            >
              Compare Selected ({compareIds.length})
            </Button>
          ) : undefined
        }
      >
        {loading ? (
          <Stack alignItems='center' sx={{ py: 4 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : searchSource === 'catalog' ? (
          sortedCatalogModels.length === 0 ? (
            <Typography sx={{ color: '#5f6f88' }}>
              No models found matching your filters. Try switching to the Hugging Face tab or
              clearing filters.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {sortedCatalogModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  selectedForCompare={compareIds.includes(model.id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </Stack>
          )
        ) : hfModels.length === 0 ? (
          <Typography sx={{ color: '#5f6f88' }}>
            No Hugging Face models found for &quot;{query}&quot;.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {hfModels.map((hf) => (
              <Box
                key={hf.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #dce5f2',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#0f3a5e' }}>
                      {hf.name}
                    </Typography>
                    <Chip
                      label={hf.task || 'text-generation'}
                      size='small'
                      color='primary'
                      variant='outlined'
                    />
                    {hf.parameters !== 'Unknown' && <Chip label={hf.parameters} size='small' />}
                  </Stack>
                  <Typography
                    variant='caption'
                    sx={{ color: '#5f6f88', display: 'block', mt: 0.5 }}
                  >
                    Repo: <strong>{hf.id}</strong> • Author: {hf.author} • Downloads:{' '}
                    {hf.downloads.toLocaleString()} • Likes: {hf.likes.toLocaleString()}
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#334e68', mt: 0.75 }}>
                    {hf.description}
                  </Typography>
                </Box>
                <Button
                  component={NavLink}
                  to={`/developer/playground?model=${encodeURIComponent(hf.id)}`}
                  variant='outlined'
                  size='small'
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Test in Playground
                </Button>
              </Box>
            ))}
          </Stack>
        )}
      </SectionCard>
    </Stack>
  )
}
