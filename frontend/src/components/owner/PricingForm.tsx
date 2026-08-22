import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import SaveIcon from '@mui/icons-material/Save'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, Button, Chip, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import type { OwnerModel } from '../../mocks/ownerData'

type PricingFormProps = {
  model: OwnerModel
  onSave: (modelId: string, pricing: OwnerModel['pricing']) => void
}

export default function PricingForm({ model, onSave }: PricingFormProps) {
  const [pricePerRequest, setPricePerRequest] = useState(model.pricing.pricePerRequest)
  const [pricePer1kTokens, setPricePer1kTokens] = useState(model.pricing.pricePer1kTokens)
  const [monthlyPrice, setMonthlyPrice] = useState<number | ''>(model.pricing.monthlyPrice ?? '')
  const [currency, setCurrency] = useState<OwnerModel['pricing']['currency']>(
    model.pricing.currency,
  )

  // Compute fair market price based on model parameters and actual developer usage
  const fairMarketRecommendation = useMemo(() => {
    const nameLower = (model.name || '').toLowerCase()
    let recommended1k = 0.00045
    let recommendedReq = 0.0002

    if (nameLower.includes('70b') || nameLower.includes('671b') || nameLower.includes('deepseek')) {
      recommended1k = 0.0015
      recommendedReq = 0.0005
    } else if (nameLower.includes('27b') || nameLower.includes('14b') || nameLower.includes('32b')) {
      recommended1k = 0.0008
      recommendedReq = 0.0003
    } else if (nameLower.includes('8b') || nameLower.includes('7b')) {
      recommended1k = 0.00035
      recommendedReq = 0.00015
    }

    // Adjust for popularity discount if high request volume (>10k)
    const requestCount = model.requests || 0
    if (requestCount > 50000) {
      recommended1k = Number((recommended1k * 0.85).toFixed(5))
    }

    return {
      pricePerRequest: recommendedReq,
      pricePer1kTokens: recommended1k,
      reason:
        requestCount > 50000
          ? `High developer usage (${requestCount.toLocaleString()} calls) unlocks 15% volume competitiveness.`
          : `Standard fair pricing based on parameter complexity and market benchmarks.`,
    }
  }, [model.name, model.requests])

  const applyFairPricing = () => {
    setPricePerRequest(fairMarketRecommendation.pricePerRequest)
    setPricePer1kTokens(fairMarketRecommendation.pricePer1kTokens)
  }

  const preview = useMemo(() => {
    const monthly = monthlyPrice === '' ? 'None' : `${currency} ${Number(monthlyPrice).toFixed(2)}`
    return {
      request: `${currency} ${pricePerRequest.toFixed(4)} / request`,
      token: `${currency} ${pricePer1kTokens.toFixed(4)} / 1K tokens (${currency} ${(pricePer1kTokens * 1000).toFixed(2)} / 1M tokens)`,
      monthly,
    }
  }, [currency, monthlyPrice, pricePer1kTokens, pricePerRequest])

  return (
    <Stack spacing={2.5}>
      {/* Fair Pricing Recommendation Widget */}
      <Box
        sx={{
          p: 2.5,
          bgcolor: 'rgba(56, 189, 248, 0.05)',
          borderRadius: 3,
          border: '1px solid rgba(56, 189, 248, 0.3)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
        >
          <Stack direction='row' spacing={1} alignItems='center'>
            <TrendingUpIcon sx={{ color: '#38bdf8' }} />
            <Typography variant='subtitle2' fontWeight={800} color='#f8fafc'>
              Fair Market Pricing Intelligence
            </Typography>
          </Stack>
          <Chip
            size='small'
            label={`Popularity Index: ${model.requests > 1000 ? 'High Adoption' : 'Emerging'}`}
            sx={{ bgcolor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 800 }}
          />
        </Stack>

        <Typography variant='body2' sx={{ color: '#94a3b8', mt: 1, mb: 1.5 }}>
          {fairMarketRecommendation.reason} Recommended: <strong>${(fairMarketRecommendation.pricePer1kTokens * 1000).toFixed(2)} / 1M tokens</strong> (${fairMarketRecommendation.pricePerRequest} / request).
        </Typography>

        <Button
          variant='outlined'
          size='small'
          startIcon={<AutoFixHighIcon />}
          onClick={applyFairPricing}
          sx={{
            color: '#38bdf8',
            borderColor: '#38bdf8',
            fontWeight: 800,
            borderRadius: 2,
            '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' },
          }}
        >
          Apply Fair Market Price
        </Button>
      </Box>

      <Divider sx={{ borderColor: '#1e293b' }} />

      <TextField
        type='number'
        label='Price Per Request ($)'
        value={pricePerRequest}
        onChange={(event) => setPricePerRequest(Number(event.target.value))}
      />
      <TextField
        type='number'
        label='Price Per 1K Tokens ($)'
        value={pricePer1kTokens}
        onChange={(event) => setPricePer1kTokens(Number(event.target.value))}
        helperText={`Equates to $${(pricePer1kTokens * 1000).toFixed(2)} per 1 Million tokens`}
      />
      <TextField
        type='number'
        label='Optional Monthly Retainer ($)'
        value={monthlyPrice}
        onChange={(event) => {
          const nextValue = event.target.value
          setMonthlyPrice(nextValue === '' ? '' : Number(nextValue))
        }}
      />
      <TextField
        select
        label='Currency'
        value={currency}
        onChange={(event) => setCurrency(event.target.value as OwnerModel['pricing']['currency'])}
      >
        <MenuItem value='USD'>USD ($)</MenuItem>
        <MenuItem value='EUR'>EUR (€)</MenuItem>
        <MenuItem value='INR'>INR (₹)</MenuItem>
      </TextField>

      <Stack
        spacing={0.75}
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: '#0a0e17',
          border: '1px solid #1e293b',
        }}
      >
        <Typography variant='caption' sx={{ color: '#fb7185', fontWeight: 800, letterSpacing: 1 }}>
          LIVE PRICING PREVIEW
        </Typography>
        <Typography variant='body2' sx={{ color: '#f8fafc', fontWeight: 600 }}>
          {preview.request}
        </Typography>
        <Typography variant='body2' sx={{ color: '#f8fafc', fontWeight: 600 }}>
          {preview.token}
        </Typography>
        <Typography variant='body2' sx={{ color: '#94a3b8' }}>
          Monthly Subscription: {preview.monthly}
        </Typography>
      </Stack>

      <Button
        variant='contained'
        startIcon={<SaveIcon />}
        sx={{
          alignSelf: 'flex-start',
          bgcolor: '#fb7185',
          color: '#0f172a',
          fontWeight: 800,
          px: 3,
          py: 1,
          borderRadius: 2.5,
          '&:hover': { bgcolor: '#f43f5e' },
        }}
        onClick={() =>
          onSave(model.id, {
            pricePerRequest,
            pricePer1kTokens,
            monthlyPrice: monthlyPrice === '' ? undefined : Number(monthlyPrice),
            currency,
          })
        }
      >
        Save Pricing Tiers
      </Button>
    </Stack>
  )
}
