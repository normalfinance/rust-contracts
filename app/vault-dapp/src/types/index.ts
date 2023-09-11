import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

export type VaultData = {
  name: string,
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
  decimals?: number;
}