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
    <Stack spacing={1.25}>
      <TextField
        type='number'
        label='Price per request'
        value={pricePerRequest}
        onChange={(event) => setPricePerRequest(Number(event.target.value))}
      />
      <TextField
        type='number'
        label='Price per 1K tokens'
        value={pricePer1kTokens}
        onChange={(event) => setPricePer1kTokens(Number(event.target.value))}
      />
      <TextField
        type='number'
        label='Optional monthly pricing'
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
        <MenuItem value='USD'>USD</MenuItem>
        <MenuItem value='EUR'>EUR</MenuItem>
        <MenuItem value='INR'>INR</MenuItem>
      </TextField>

      <Stack spacing={0.5} sx={{ p: 1.25, borderRadius: 2, bgcolor: '#f4f8fd' }}>
        <Typography variant='subtitle2' sx={{ color: '#1d3a58', fontWeight: 800 }}>
          Pricing preview
        </Typography>
        <Typography variant='body2' sx={{ color: '#577191' }}>
          {preview.request}
        </Typography>
        <Typography variant='body2' sx={{ color: '#577191' }}>
          {preview.token}
        </Typography>
        <Typography variant='body2' sx={{ color: '#577191' }}>
          Monthly: {preview.monthly}
        </Typography>
      </Stack>

      <Button
        variant='contained'
        startIcon={<SaveIcon />}
        sx={{ alignSelf: 'flex-start' }}
        onClick={() =>
          onSave(model.id, {
            pricePerRequest,
            pricePer1kTokens,
            monthlyPrice: monthlyPrice === '' ? undefined : Number(monthlyPrice),
            currency,
          })
        }
      >
        Save pricing
      </Button>
    </Stack>
  )
}
