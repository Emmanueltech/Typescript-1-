import { useAccount, useChainId, useReadContracts } from 'wagmi';
import { Currency, treasuryTokenAbi } from '@lira-dao/web3-utils';
import { getTreasuryCurrencies } from '../utils';
import { formatUnits } from 'viem';
import BigNumber from 'bignumber.js';


const balanceOf = {
  functionName: 'balanceOf',
  abi: treasuryTokenAbi,
} as const;

const mintFeeConfig = {
  functionName: 'mintFee',
  abi: treasuryTokenAbi,
} as const;

const burnFeeConfig = {
  functionName: 'burnFee',
  abi: treasuryTokenAbi,
} as const;

const rateConfig = {
  functionName: 'rate',
  abi: treasuryTokenAbi,
} as const;

export interface Treasury extends Currency {
  balance: bigint;
  formattedBalance: string;
  mintFee: string;
  burnFee: string;
  rate: string;
}

export function useTreasury(): Treasury[] {
  const chainId = useChainId();
  const account = useAccount();
  const tokens = getTreasuryCurrencies(chainId);

  const balancesContracts = tokens.map(token => ({ ...balanceOf, address: token.address, args: [account.address] }));

  const balances = useReadContracts({ contracts: balancesContracts });

  const mintFeeContracts = tokens.map(token => ({ ...mintFeeConfig, address: token.address }));

  const mintFee = useReadContracts({ contracts: mintFeeContracts });

  const burnContracts = tokens.map(token => ({ ...burnFeeConfig, address: token.address }));

  const burnFee = useReadContracts({ contracts: burnContracts });

  const rateContracts = tokens.map(token => ({ ...rateConfig, address: token.address }));

  const rate = useReadContracts({ contracts: rateContracts });

  return tokens.map((token, i) => {
    return {
      ...token,
      balance: balances.data?.[i].result || 0n,
      formattedBalance: new BigNumber(formatUnits(balances.data?.[i].result || 0n, token.decimals)).decimalPlaces(6, 1).toString(),
      mintFee: mintFee.data?.[i].result?.toString() || '0',
      burnFee: burnFee.data?.[i].result?.toString() || '0',
      rate: new BigNumber(rate.data?.[i].result?.toString() || '0').toFormat(0),
    };
  });
}
