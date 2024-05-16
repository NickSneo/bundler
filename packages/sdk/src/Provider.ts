import { JsonRpcProvider } from '@ethersproject/providers'

import { ClientConfig } from './ClientConfig'
import { SimpleAccountAPI } from './SimpleAccountAPI'
import { ERC4337EthersProvider } from './ERC4337EthersProvider'
import { HttpRpcClient } from './HttpRpcClient'
import { Signer } from '@ethersproject/abstract-signer'
import { DeterministicDeployer, IEntryPoint__factory, SimpleAccountFactory__factory } from '@account-abstraction/utils'
import { Wallet } from 'ethers'

/**
 * wrap an existing provider to tunnel requests through Account Abstraction.
 * @param originalProvider the normal provider
 * @param config see ClientConfig for more info
 * @param originalSigner use this signer as the owner. of this wallet. By default, use the provider's signer
 */
export async function wrapProvider (
  originalProvider: JsonRpcProvider,
  config: ClientConfig,
  originalSigner: Signer = new Wallet(`0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63`).connect(originalProvider)
): Promise<ERC4337EthersProvider> {
  const entryPoint = IEntryPoint__factory.connect(config.entryPointAddress, originalProvider)
  // Initial SimpleAccount instance is not deployed and exists just for the interface
  const detDeployer = new DeterministicDeployer(originalProvider)
  const SimpleAccountFactory = await detDeployer.deterministicDeploy(new SimpleAccountFactory__factory(), 0, [entryPoint.address])
  const smartAccountAPI = new SimpleAccountAPI({
    provider: originalProvider,
    entryPointAddress: entryPoint.address,
    owner: originalSigner,
    factoryAddress: SimpleAccountFactory,
    paymasterAPI: config.paymasterAPI
  })
  const chainId = await originalProvider.getNetwork().then(net => net.chainId)
  const httpRpcClient = new HttpRpcClient(config.bundlerUrl, config.entryPointAddress, chainId)
  return await new ERC4337EthersProvider(
    chainId,
    config,
    originalSigner,
    originalProvider,
    httpRpcClient,
    entryPoint,
    smartAccountAPI
  ).init()
}
