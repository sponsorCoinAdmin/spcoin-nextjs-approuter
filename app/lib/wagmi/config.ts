import { createConfig, http } from 'wagmi'
import { mainnet, polygon, sepolia } from 'wagmi/chains'

  export const config = createConfig({
    chains: [mainnet, polygon, sepolia], 
    transports: { 
      [mainnet.id]: http(), 
      [polygon.id]: http(), 
      [sepolia.id]: http(), 
    }, 
  })
  
  function setWagmiConfig() {
    return config
  }
  
  export { setWagmiConfig }