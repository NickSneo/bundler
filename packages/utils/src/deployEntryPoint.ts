import { JsonRpcProvider } from '@ethersproject/providers'
import { bytecode as entryPointByteCode } from '@account-abstraction/contracts/artifacts/EntryPoint.json'
import { IEntryPoint, IEntryPoint__factory } from './soltypes'
import { DeterministicDeployer } from './DeterministicDeployer'
import { Wallet } from 'ethers'

export const entryPointSalt = '0x90d8084deab30c2a37c45e8d47f49f2f7965183cb6990a98943ef94940681de3'

export async function deployEntryPoint (provider: JsonRpcProvider, signer = new Wallet(`0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63`, provider).connect(provider)): Promise<IEntryPoint> {
  const addr = await new DeterministicDeployer(provider, signer).deterministicDeploy(entryPointByteCode, entryPointSalt)
  return IEntryPoint__factory.connect(addr, signer)
}

export function getEntryPointAddress (): string {
  return DeterministicDeployer.getAddress(entryPointByteCode, entryPointSalt)
}
