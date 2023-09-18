import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

export type VaultData = {
  name: string,
  authority: PublicKey,
  lastFeeCollection: BN,
  fee: BN,
  feeAssets: Asset[],
  bump: number,
}

export type UserData = {
  key: PublicKey;
  vault: PublicKey;
  assets: Asset[];
  bump: number;
}

export type Asset = {
  mint: PublicKey;
  amount: BN;
}

export type Mint = {
  mint: PublicKey;
  decimals: number;
}