import { PublicKey } from '@solana/web3.js';
import idl from 'idl/spl_vault.json';

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