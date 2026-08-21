import SaveIcon from '@mui/icons-material/Save'
import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material'
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

  const preview = useMemo(() => {
    const monthly = monthlyPrice === '' ? 'None' : `${currency} ${Number(monthlyPrice).toFixed(2)}`
    return {
      request: `${currency} ${pricePerRequest.toFixed(4)} / request`,
      token: `${currency} ${pricePer1kTokens.toFixed(4)} / 1K tokens`,
      monthly,
    }
  }, [currency, monthlyPrice, pricePer1kTokens, pricePerRequest])

  return (
    <Stack spacing={2}>
      <TextField
        type='number'
        label='Price Per Request'
        value={pricePerRequest}
        onChange={(event) => setPricePerRequest(Number(event.target.value))}
      />
      <TextField
        type='number'
        label='Price Per 1K Tokens'
        value={pricePer1kTokens}
        onChange={(event) => setPricePer1kTokens(Number(event.target.value))}
      />
      <TextField
        type='number'
        label='Optional Monthly Retainer'
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
