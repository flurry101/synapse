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
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <TextField
        fullWidth
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon sx={{ color: '#38bdf8' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: '#0a0e17',
            borderRadius: 2.5,
          },
        }}
      />
      {buttonLabel && (
        <Button
          variant='contained'
          onClick={onSubmit}
          sx={{
            minWidth: 160,
            bgcolor: '#38bdf8',
            color: '#090d16',
            fontWeight: 800,
            borderRadius: 2.5,
            '&:hover': { bgcolor: '#7dd3fc' },
          }}
        >
          {buttonLabel}
        </Button>
      )}
    </Stack>
  )
}
