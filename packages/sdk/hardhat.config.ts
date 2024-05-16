import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-toolbox'

import { HardhatUserConfig } from 'hardhat/config'

const config: HardhatUserConfig = {
  networks: {
    besu: {
      url: "http://127.0.0.1:8545",
      accounts: ["0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"],
      chainId: 1337
    }
  },
  solidity: {
    version: '0.8.23',
    settings: {
      optimizer: { enabled: true }
    }
  }
}

export default config
