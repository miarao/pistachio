import React from 'react'
import TextField from '@mui/material/TextField'

interface WalletAddressInputProps {
  onChange: (address: string) => void
  value: string
}

const WalletAddressInput: React.FC<WalletAddressInputProps> = ({ onChange, value }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <TextField
      label="Wallet Address"
      variant="outlined"
      fullWidth
      value={value}
      onChange={handleChange}
      inputProps={{ pattern: '^0x[a-fA-F0-9]{40}$' }}
      helperText="Enter a valid wallet address"
    />
  )
}

export default WalletAddressInput