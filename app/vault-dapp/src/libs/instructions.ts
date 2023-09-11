import { BN, Program } from '@project-serum/anchor';
import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js';
import { SplVault } from 'idl/spl_vault';
import { getUserPda, getVaultPda } from './utils';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';

export const getInitializeVaultInstruction = async (
  program: Program<SplVault>,
  authority: PublicKey,
  name: string,
) => {
  const [vault] = getVaultPda(name);
  
  return await program.methods
    .initializeVault(
      name,
    )
    .accounts({
      authority,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};


export const getCreateUserInstruction = async (
  program: Program<SplVault>,
  name: string,
  authority: PublicKey,
) => {
  const [vault] = getVaultPda(name);
  const [user] = getUserPda(authority, vault);

  return await program.methods
    .createUser()
    .accounts({
      authority,
      vault,
      user,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

export const getFundInstruction = async (
  program: Program<SplVault>,
  funder: PublicKey,
  name: string,
  mint: PublicKey,
  amount: BN,
) => {
  const [vault] = getVaultPda(name);
  const [user] = getUserPda(funder, vault);
  const vaultAta = getAssociatedTokenAddressSync(mint, vault, true);
  const funderAta = getAssociatedTokenAddressSync(mint, funder);
  return await program.methods
    .fund(amount)
    .accounts({
      funder,
      vault,
      user,
      mint,
      vaultAta,
      funderAta,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .instruction();
}

export const getDrainInstruction = async (
  program: Program<SplVault>,
  drainer: PublicKey,
  name: string,
  mint: PublicKey,
  amount: BN,
) => {
  const [vault] = getVaultPda(name);
  const [user] = getUserPda(drainer, vault);
  const vaultAta = getAssociatedTokenAddressSync(mint, vault, true);
  const drainerAta = getAssociatedTokenAddressSync(mint, drainer);
  return await program.methods
    .drain(amount)
    .accounts({
      drainer,
      vault,
      user,
      mint,
      vaultAta,
      drainerAta,
      tokenProgram: TOKEN_PROGRAM_ID,      
    })
    .instruction();
}

// export const getClosePdaInstruction = async (
//   program: Program<SplVault>,
//   authority: PublicKey,
//   pda: PublicKey,
// ) => {
//   return await program.methods
//     .closePda()
//     .accounts({
//       signer: authority,
//       pda,
//       systemProgram: SystemProgram.programId
//     })
//     .instruction();
// }
