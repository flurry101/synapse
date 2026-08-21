import SearchIcon from '@mui/icons-material/Search'
import { Button, InputAdornment, Stack, TextField } from '@mui/material'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  buttonLabel?: string
  onSubmit?: () => void
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Describe your use case...',
  buttonLabel,
  onSubmit,
}: SearchBarProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
      <TextField
        fullWidth
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      {buttonLabel && (
        <Button variant='contained' onClick={onSubmit} sx={{ minWidth: 160 }}>
          {buttonLabel}
        </Button>
      )}
    </Stack>
  )
}
