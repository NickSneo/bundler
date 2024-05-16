import ow from 'ow'
import fs from 'fs'

import { BundlerConfig, bundlerConfigDefault, BundlerConfigShape } from './BundlerConfig'
import { Wallet, Signer } from 'ethers'
import { BaseProvider, JsonRpcProvider } from '@ethersproject/providers'

function getCommandLineParams (programOpts: any): Partial<BundlerConfig> {
  const params: any = {}
  for (const bundlerConfigShapeKey in BundlerConfigShape) {
    const optionValue = programOpts[bundlerConfigShapeKey]
    if (optionValue != null) {
      params[bundlerConfigShapeKey] = optionValue
    }
  }
  return params as BundlerConfig
}

function mergeConfigs (...sources: Array<Partial<BundlerConfig>>): BundlerConfig {
  const mergedConfig = Object.assign({}, ...sources)
  ow(mergedConfig, ow.object.exactShape(BundlerConfigShape))
  return mergedConfig
}

const DEFAULT_INFURA_ID = 'd442d82a1ab34327a7126a578428dfc4'

export function getNetworkProvider (url: string): JsonRpcProvider {
  if (url.match(/^[\w-]+$/) != null) {
    const infuraId = process.env.INFURA_ID1 ?? DEFAULT_INFURA_ID
    url = `https://${url}.infura.io/v3/${infuraId}`
  }
  console.log('url=', url)
  return new JsonRpcProvider(url)
}

export async function resolveConfiguration (programOpts: any): Promise<{ config: BundlerConfig, provider: BaseProvider, wallet: Signer }> {
  const commandLineParams = getCommandLineParams(programOpts)
  let fileConfig: Partial<BundlerConfig> = {}
  const configFileName = programOpts.config
  if (fs.existsSync(configFileName)) {
    fileConfig = JSON.parse(fs.readFileSync(configFileName, 'ascii'))
  }
  const config = mergeConfigs(bundlerConfigDefault, fileConfig, commandLineParams)
  console.log('Merged configuration:', JSON.stringify(config))

  if (config.network === 'hardhat') {
    // eslint-disable-next-line
    const provider: JsonRpcProvider = require('hardhat').ethers.provider
    return { config, provider, wallet: new Wallet(`0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63`, provider) }
  }

  const provider: BaseProvider = getNetworkProvider(config.network)
  let wallet: Wallet
  wallet = new Wallet(`0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63`, provider)
  
  return { config, provider, wallet }
}
