import CloudQueueIcon from '@mui/icons-material/CloudQueue'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import StorageIcon from '@mui/icons-material/Storage'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
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
import {
  categoryFilters,
  DeveloperModel,
  licenseFilters,
  parameterFilters,
  sortOptions,
  taskFilters,
} from '../../mocks/developerData'
import modelService, { HFModelRecord } from '../../services/model.service'

const compareStorageKey = 'synapse_developer_compare'

export default function DeveloperSearch() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [taskFilter, setTaskFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [paramFilter, setParamFilter] = useState('All')
  const [licenseFilter, setLicenseFilter] = useState('All')
  const [sortBy, setSortBy] = useState(sortOptions[0].value)
  const [searchSource, setSearchSource] = useState<'hf' | 'catalog'>('hf')
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
            category: categoryFilter,
            parameters: paramFilter,
            license: licenseFilter,
            sort: sortBy,
          })
          if (active) setModels(res)
        } else {
          const hfRes = await modelService.searchHfModels({
            query,
            task: taskFilter,
            category: categoryFilter,
            parameters: paramFilter,
            license: licenseFilter,
            limit: 30,
            sort: sortBy === 'price-asc' ? 'likes' : 'downloads',
          })
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
  }, [query, taskFilter, categoryFilter, paramFilter, licenseFilter, sortBy, searchSource])

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
        title='Model Search & Taxonomy Discovery'
        subtitle='Browse open-weight models directly from Hugging Face Hub or access verified Synapse Catalog benchmarks'
      >
        <Tabs
          value={searchSource}
          onChange={(_, val) => setSearchSource(val)}
          sx={{
            mb: 2,
            borderBottom: '1px solid #1e293b',
            '& .MuiTab-root': {
              color: '#94a3b8',
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.95rem',
              '&.Mui-selected': { color: '#38bdf8' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#38bdf8', height: 3 },
          }}
        >
          <Tab
            value='hf'
            label='Hugging Face Hub (Live)'
            icon={<CloudQueueIcon />}
            iconPosition='start'
          />
          <Tab
            value='catalog'
            label='Synapse Verified Models'
            icon={<StorageIcon />}
            iconPosition='start'
          />
        </Tabs>

        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={
            searchSource === 'hf'
              ? 'Search Hugging Face Hub (e.g. Qwen, Llama 3.1, DeepSeek, Mistral, BGE)...'
              : 'Search Synapse verified catalog by use case, latency, or tasks...'
          }
        />

        {/* Hugging Face Taxonomy Categories */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant='caption'
            sx={{ color: '#94a3b8', fontWeight: 800, letterSpacing: 0.5, display: 'block', mb: 1 }}
          >
            TAXONOMY CATEGORIES (HUGGING FACE)
          </Typography>
          <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
            {categoryFilters.map((cat) => {
              const isSelected = cat === categoryFilter
              return (
                <Chip
                  key={cat}
                  label={cat}
                  clickable
                  onClick={() => setCategoryFilter(cat)}
                  sx={{
                    bgcolor: isSelected ? 'rgba(56, 189, 248, 0.2)' : '#0d121c',
                    color: isSelected ? '#38bdf8' : '#cbd5e1',
                    border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#38bdf8',
                      bgcolor: 'rgba(56, 189, 248, 0.1)',
                    },
                  }}
                />
              )
            })}
          </Stack>
        </Box>

        {/* Multi-dimensional Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2.5 }}>
          <TextField
            select
            fullWidth
            size='small'
            label='Pipeline Task'
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
            size='small'
            label='Parameters Size'
            value={paramFilter}
            onChange={(event) => setParamFilter(event.target.value)}
          >
            {parameterFilters.map((param) => (
              <MenuItem key={param} value={param}>
                {param}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            size='small'
            label='License'
            value={licenseFilter}
            onChange={(event) => setLicenseFilter(event.target.value)}
          >
            {licenseFilters.map((lic) => (
              <MenuItem key={lic} value={lic}>
                {lic}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            size='small'
            label='Sort By'
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

        <Stack direction='row' justifyContent='flex-end' sx={{ mt: 1.5 }}>
          <Button
            size='small'
            onClick={() => {
              setTaskFilter('All')
              setCategoryFilter('All')
              setParamFilter('All')
              setLicenseFilter('All')
              setQuery('')
            }}
            sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'none' }}
          >
            Reset All Filters
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard
        title={searchSource === 'hf' ? 'Hugging Face Models' : 'Synapse Verified Catalog'}
        subtitle={
          searchSource === 'hf'
            ? `${hfModels.length} models discovered from Hugging Face Hub ${
                compareIds.length > 0 ? ` • ${compareIds.length} selected for comparison` : ''
              }`
            : `${sortedCatalogModels.length} models available ${
                compareIds.length > 0 ? ` • ${compareIds.length} selected for comparison` : ''
              }`
        }
        action={
          <Button
            component={NavLink}
            to={`/developer/compare?models=${encodeURIComponent(compareIds.join(','))}`}
            variant='contained'
            disabled={compareIds.length < 2}
            startIcon={<CompareArrowsIcon />}
            sx={{
              bgcolor: '#38bdf8',
              color: '#090d16',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 2.5,
              '&:hover': { bgcolor: '#7dd3fc' },
              '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#64748b' },
            }}
          >
            Compare Selected ({compareIds.length})
          </Button>
        }
      >
        {loading ? (
          <Stack alignItems='center' sx={{ py: 6 }}>
            <CircularProgress size={36} sx={{ color: '#38bdf8' }} />
            <Typography variant='caption' sx={{ color: '#94a3b8', mt: 1.5, fontWeight: 700 }}>
              Querying live AI catalog & benchmarks...
            </Typography>
          </Stack>
        ) : searchSource === 'catalog' ? (
          sortedCatalogModels.length === 0 ? (
            <Typography sx={{ color: '#94a3b8', py: 3 }}>
              No models found matching your criteria. Try switching to the Hugging Face tab.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {sortedCatalogModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  selectedForCompare={compareIds.includes(model.id) || compareIds.includes(model.huggingFaceId)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </Stack>
          )
        ) : hfModels.length === 0 ? (
          <Typography sx={{ color: '#94a3b8', py: 3 }}>
            No Hugging Face models found matching your search.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {hfModels.map((hf) => {
              const isSelected = compareIds.includes(hf.id)
              return (
                <Box
                  key={hf.id}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                    bgcolor: isSelected ? 'rgba(56, 189, 248, 0.06)' : '#0a0e17',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2.5,
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: '#38bdf8' },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Stack direction='row' spacing={1} alignItems='center' useFlexGap flexWrap='wrap'>
                      <Typography variant='subtitle1' sx={{ fontWeight: 900, color: '#f8fafc' }}>
                        {hf.name}
                      </Typography>
                      <Chip
                        label={hf.task || 'Text Generation'}
                        size='small'
                        sx={{
                          bgcolor: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          fontWeight: 700,
                        }}
                      />
                      {hf.parameters && hf.parameters !== 'Unknown' && (
                        <Chip
                          label={hf.parameters}
                          size='small'
                          sx={{
                            bgcolor: 'rgba(168, 85, 247, 0.15)',
                            color: '#c084fc',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            fontWeight: 800,
                          }}
                        />
                      )}
                      {hf.license && (
                        <Chip
                          label={hf.license}
                          size='small'
                          sx={{ bgcolor: '#111622', color: '#94a3b8', fontSize: 11 }}
                        />
                      )}
                      {hf.context_window && (
                        <Chip
                          label={`Context: ${hf.context_window}`}
                          size='small'
                          sx={{ bgcolor: '#111622', color: '#94a3b8', fontSize: 11 }}
                        />
                      )}
                    </Stack>

                    <Typography
                      variant='caption'
                      sx={{ color: '#94a3b8', display: 'block', mt: 0.75 }}
                    >
                      Repo: <strong style={{ color: '#f8fafc' }}>{hf.id}</strong> • Author:{' '}
                      {hf.author} • Downloads: {hf.downloads.toLocaleString()} • Likes:{' '}
                      {hf.likes.toLocaleString()} • Estimated Input:{' '}
                      <strong style={{ color: '#4ade80' }}>
                        ${hf.price_per_m_input ?? 0.15}/1M
                      </strong>
                    </Typography>

                    <Typography
                      variant='body2'
                      sx={{ color: '#cbd5e1', mt: 1, fontSize: 13.5, lineHeight: 1.5 }}
                    >
                      {hf.description}
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1.5} alignItems='center' useFlexGap flexWrap='wrap'>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleCompare(hf.id)}
                          sx={{
                            color: '#64748b',
                            '&.Mui-checked': { color: '#38bdf8' },
                          }}
                        />
                      }
                      label={
                        <Typography variant='caption' sx={{ color: isSelected ? '#38bdf8' : '#94a3b8', fontWeight: 800 }}>
                          Compare
                        </Typography>
                      }
                      sx={{ mr: 0.5 }}
                    />

                    <Button
                      component={NavLink}
                      to={`/developer/playground?model=${encodeURIComponent(hf.id)}`}
                      variant='outlined'
                      size='small'
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        color: '#38bdf8',
                        borderColor: '#38bdf8',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', borderColor: '#7dd3fc' },
                      }}
                    >
                      Playground
                    </Button>

                    <Button
                      component={NavLink}
                      to={`/developer/deploy?model=${encodeURIComponent(hf.id)}`}
                      variant='contained'
                      size='small'
                      startIcon={<RocketLaunchIcon />}
                      sx={{
                        bgcolor: '#4ade80',
                        color: '#052e16',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#22c55e' },
                      }}
                    >
                      Deploy
                    </Button>
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        )}
      </SectionCard>
    </Stack>
  )
}
