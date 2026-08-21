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
    <Stack spacing={3}>
      <SectionCard
        title='Model Search & Discovery'
        subtitle='Browse the verified Synapse Catalog or query millions of open-weight models on Hugging Face'
      >
        <Tabs
          value={searchSource}
          onChange={(_, val) => setSearchSource(val)}
          sx={{
            mb: 1.5,
            borderBottom: '1px solid #1e293b',
            '& .MuiTab-root': {
              color: '#94a3b8',
              fontWeight: 700,
              textTransform: 'none',
              '&.Mui-selected': { color: '#38bdf8' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#38bdf8' },
          }}
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
              ? 'Search models by use case, task, or capability...'
              : 'Search Hugging Face models by repo name or author (e.g. meta-llama, mistralai, deepseek)...'
          }
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            fullWidth
            label='Task Filter'
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
              label='Sort Options'
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

        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap' sx={{ mt: 0.5 }}>
          {taskFilters.slice(1).map((task) => {
            const isSelected = task === taskFilter
            return (
              <Chip
                key={task}
                label={task}
                clickable
                onClick={() => setTaskFilter(task)}
                sx={{
                  bgcolor: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0a0e17',
                  color: isSelected ? '#38bdf8' : '#cbd5e1',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  fontWeight: 700,
                  '&:hover': {
                    borderColor: '#38bdf8',
                    bgcolor: 'rgba(56, 189, 248, 0.1)',
                  },
                }}
              />
            )
          })}
          <Chip
            label='Clear Filters'
            onClick={() => setTaskFilter('All')}
            clickable
            sx={{
              bgcolor: '#0a0e17',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              '&:hover': { color: '#f8fafc', borderColor: '#64748b' },
            }}
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
              sx={{
                bgcolor: '#38bdf8',
                color: '#090d16',
                fontWeight: 800,
                borderRadius: 2.5,
                '&:hover': { bgcolor: '#7dd3fc' },
                '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#64748b' },
              }}
            >
              Compare Selected ({compareIds.length})
            </Button>
          ) : undefined
        }
      >
        {loading ? (
          <Stack alignItems='center' sx={{ py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#38bdf8' }} />
          </Stack>
        ) : searchSource === 'catalog' ? (
          sortedCatalogModels.length === 0 ? (
            <Typography sx={{ color: '#94a3b8' }}>
              No models found matching your filters. Try switching to the Hugging Face tab or
              clearing filters.
            </Typography>
          ) : (
            <Stack spacing={2}>
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
          <Typography sx={{ color: '#94a3b8' }}>
            No Hugging Face models found for &quot;{query}&quot;.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {hfModels.map((hf) => (
              <Box
                key={hf.id}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid #1e293b',
                  bgcolor: '#0a0e17',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  transition: 'border-color 0.2s ease',
                  '&:hover': { borderColor: '#38bdf8' },
                }}
              >
                <Box>
                  <Stack direction='row' spacing={1} alignItems='center' useFlexGap flexWrap='wrap'>
                    <Typography variant='subtitle1' sx={{ fontWeight: 800, color: '#f8fafc' }}>
                      {hf.name}
                    </Typography>
                    <Chip
                      label={hf.task || 'text-generation'}
                      size='small'
                      sx={{
                        bgcolor: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        fontWeight: 700,
                      }}
                    />
                    {hf.parameters !== 'Unknown' && (
                      <Chip
                        label={hf.parameters}
                        size='small'
                        sx={{ bgcolor: '#111622', color: '#cbd5e1' }}
                      />
                    )}
                  </Stack>
                  <Typography
                    variant='caption'
                    sx={{ color: '#94a3b8', display: 'block', mt: 0.75 }}
                  >
                    Repo: <strong style={{ color: '#f8fafc' }}>{hf.id}</strong> • Author:{' '}
                    {hf.author} • Downloads: {hf.downloads.toLocaleString()} • Likes:{' '}
                    {hf.likes.toLocaleString()}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ color: '#cbd5e1', mt: 1, fontSize: 13.5, lineHeight: 1.5 }}
                  >
                    {hf.description}
                  </Typography>
                </Box>
                <Button
                  component={NavLink}
                  to={`/developer/playground?model=${encodeURIComponent(hf.id)}`}
                  variant='outlined'
                  size='small'
                  sx={{
                    color: '#38bdf8',
                    borderColor: '#38bdf8',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', borderColor: '#7dd3fc' },
                  }}
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
