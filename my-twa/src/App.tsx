import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react'
import { useTonConnect } from './hooks/useTonConnect'
import { Box, Button, Container } from '@mui/material'
import WalletAddressInput from './wallet-address-input.tsx'
import { useState } from 'react'
import axios from 'axios'

interface ErrorLike {
  message?: string
  stack?: string
  reason?: string
}

function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {  sender: _sender, connected } = useTonConnect()
  const [walletAddress, setWalletAddress] = useState('')

  const print = (message: string) => {
    // eslint-disable-next-line no-console
    console.log(message)
  }

  const errorLike = (err: unknown, fallbackMessage?: string): ErrorLike => {
    const { message, stack, reason } = err as ErrorLike
    return {
      message: typeof message === 'string' ? message : fallbackMessage,
      stack: typeof stack === 'string' ? stack : undefined,
      reason: typeof reason === 'string' ? reason : undefined,
    }
  }

  print(`App started with connected? ${connected} and walletAddress=${walletAddress}`)

  const notifyBot = async () => {
    try {
      const response = await axios.post('https://c86e-31-187-78-43.ngrok-free.app/bot7035379281:AAF4_DtybdfGF_kR1TSg004XbfpTjbtr1g0', {
        message: `New wallet address: ${walletAddress}`
      })
      print(`Notification sent for wallet address: ${walletAddress}`)
      print(response.data)
    } catch (error) {
      print(`Error sending notification to bot for wallet address: ${walletAddress} - ${JSON.stringify(errorLike(error))}`)
    }
  }

  const handleChange = (address: string) => {
    print(`Address changed to ${address}`)
// await sender.send({
//       to: walletAddress,
//       value: BigInt(1000000000),
//       body: Buffer.from('Hello, TON!', 'utf-8'),
    setWalletAddress(address)
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, darkgreen, black)',
        minHeight: '100vh',
        display: 'flex',
        width: window.innerWidth,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
          <TonConnectButton />
        </Box>
        <Box sx={{ marginBottom: 2 }}>
          <WalletAddressInput
            value={walletAddress}
            onChange={(address) => handleChange(address)}
          />
        </Box>
        <Button
          variant="contained"
          onClick={async () => {
            await notifyBot(walletAddress)
          }}
          disabled={!connected}
          fullWidth
        >
          Collect
        </Button>
      </Container>
    </Box>
  )
}

export default App