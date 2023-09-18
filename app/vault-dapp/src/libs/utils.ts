import { PublicKey } from '@solana/web3.js';
import idl from 'idl/spl_vault.json';
import { Mint } from 'types';

export const getVaultPda = (
  name: string,
  programId: PublicKey = new PublicKey(idl.metadata.address),
) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("vault"),
      Buffer.from(name),
    ],
    programId
  );
};


export const getUserPda = (
  user: PublicKey,
  vault: PublicKey,
  programId: PublicKey = new PublicKey(idl.metadata.address)
) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("user"),
      vault.toBuffer(),
      user.toBuffer()
    ],
    programId
  );
};

export const getDecimals = (mints: Array<Mint>, mint: PublicKey) => {
  const index = mints.map(mint => mint.mint.toString()).indexOf(mint.toString());
  if (!mints[index]) return 1;
  return mints[index].decimals;
}