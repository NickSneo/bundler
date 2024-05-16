import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { parseEther } from 'ethers/lib/utils'
import { Wallet } from 'ethers'

const fundsigner: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // on geth, fund the default "hardhat node" account.

  const provider = hre.ethers.provider
  const signer = new Wallet(`0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63`, provider).connect(provider);
  const signerBalance = await provider.getBalance(signer.getAddress())
  const account = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
  const bal = await provider.getBalance(account)
  if (bal.lt(parseEther('1')) && signerBalance.gte(parseEther('10000'))) {
    console.log('funding hardhat account', account)
    await signer.sendTransaction({
      to: account,
      value: parseEther('1').sub(bal)
    })
  }
}

export default fundsigner
