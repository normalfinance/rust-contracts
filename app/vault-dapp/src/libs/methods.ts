import { BN, Program } from '@project-serum/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { SplVault } from 'idl/spl_vault';
import { getCreateUserInstruction, getDrainInstruction, getFundInstruction, getInitializeVaultInstruction } from './instructions';
// import { getUserPda } from './utils';
import { VAULT_NAME } from 'config';
import { ACCOUNT_SIZE, NATIVE_MINT, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createCloseAccountInstruction, createInitializeAccountInstruction, createTransferInstruction, getAssociatedTokenAddressSync, getMinimumBalanceForRentExemptAccount } from '@solana/spl-token';

export async function callCreateUser(
  wallet: WalletContextState,
  program: Program<SplVault>,
) {
  if (!wallet.publicKey) return;
  try {
    const transaction = new Transaction();

    transaction.add(
      await getCreateUserInstruction(program, VAULT_NAME, wallet.publicKey)
    );

    const txSignature = await wallet.sendTransaction(transaction, program.provider.connection, { skipPreflight: true });
    await program.provider.connection.confirmTransaction(txSignature, "confirmed");
    return txSignature;
  } catch (error) {
    console.log(error);
    return;
  }
}

export async function initializeVault(
  wallet: WalletContextState,
  program: Program<SplVault>,
  name: string,
) {
  if (!wallet.publicKey) return;
  try {
    const transaction = new Transaction();

    transaction.add(
      await getInitializeVaultInstruction(program, wallet.publicKey, name)
    );

    const txSignature = await wallet.sendTransaction(transaction, program.provider.connection, { skipPreflight: true });
    await program.provider.connection.confirmTransaction(txSignature, "confirmed");
    return txSignature;
  } catch (error) {
    console.log(error);
    return;
  }
}

export async function fund(
  wallet: WalletContextState,
  program: Program<SplVault>,
  name: string,
  tokenMint: PublicKey,
  amount: BN,
) {
  if (!wallet.publicKey) return;
  try {
    const transaction = new Transaction();
    const newAccount = Keypair.generate();
    if (tokenMint.toString() === NATIVE_MINT.toString()) {
      const ata = getAssociatedTokenAddressSync(NATIVE_MINT, wallet.publicKey);
      const ataData = await program.provider.connection.getAccountInfo(ata);
      if (!ataData) {
        transaction.add(createAssociatedTokenAccountInstruction(wallet.publicKey, ata, wallet.publicKey, NATIVE_MINT));
      }
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: newAccount.publicKey,
          space: ACCOUNT_SIZE,
          lamports: (await getMinimumBalanceForRentExemptAccount(program.provider.connection)) + amount.toNumber(),
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeAccountInstruction(
          newAccount.publicKey,
          NATIVE_MINT,
          wallet.publicKey,
        ),
        createTransferInstruction(newAccount.publicKey, ata, wallet.publicKey, amount.toNumber()),
        createCloseAccountInstruction(newAccount.publicKey, wallet.publicKey, wallet.publicKey),
      );
    }
    transaction.add(
      await getFundInstruction(program, wallet.publicKey, name, tokenMint, amount)
    );

    const txSignature = await wallet.sendTransaction(transaction, program.provider.connection, { skipPreflight: true, signers: tokenMint.toString() === NATIVE_MINT.toString() ? [newAccount] : [] });
    await program.provider.connection.confirmTransaction(txSignature, "confirmed");
    return txSignature;
  } catch (error) {
    console.log(error);
    return;
  }
}

export async function drain(
  wallet: WalletContextState,
  program: Program<SplVault>,
  name: string,
  tokenMint: PublicKey,
  amount: BN,
) {
  if (!wallet.publicKey) return;
  try {
    const transaction = new Transaction();
    const ata = getAssociatedTokenAddressSync(tokenMint, wallet.publicKey);

    if (tokenMint.toString() === NATIVE_MINT.toString()) {
      const ataData = await program.provider.connection.getAccountInfo(ata);
      if (!ataData) {
        transaction.add(
          createAssociatedTokenAccountInstruction(wallet.publicKey, ata, wallet.publicKey, NATIVE_MINT)
        );
      }
    }

    transaction.add(
      await getDrainInstruction(program, wallet.publicKey, name, tokenMint, amount)
    );

    if (tokenMint.toString() === NATIVE_MINT.toString()) {
      transaction.add(
        createCloseAccountInstruction(
          ata,
          wallet.publicKey,
          wallet.publicKey,
        )
      )
    }

    const txSignature = await wallet.sendTransaction(transaction, program.provider.connection, { skipPreflight: true });
    await program.provider.connection.confirmTransaction(txSignature, "confirmed");
    return txSignature;
  } catch (error) {
    console.log(error);
    return;
  }
}

// export async function callClosePdas(
//   wallet: WalletContextState,
//   program: Program<SplVault>,
//   pdas: Array<PublicKey>,
// ) {
//   if (!wallet.publicKey || !wallet.signAllTransactions) return;
//   try {
//     const txns = [];
//     let transaction = new Transaction();
//     let cnt = 0;
//     for (const pda of pdas) {
//       transaction.add(
//         await getClosePdaInstruction(program, wallet.publicKey, pda)
//       );
//       cnt++;
//       if (cnt % 10 === 0) {
//         txns.push(transaction);
//         transaction = new Transaction();
//       }
//     }
//     if (cnt % 10 && transaction.instructions.length) txns.push(transaction);
//     const recentBlockhash = await (await program.provider.connection.getLatestBlockhash('finalized')).blockhash;
//     for (const transaction of txns) {
//       transaction.feePayer = wallet.publicKey;
//       transaction.recentBlockhash = recentBlockhash;
//     }
//     const signedTxns = await wallet.signAllTransactions(txns);
//     const txSignatures = [];
//     for (const signedTxn of signedTxns) {
//       const txSignature = await program.provider.connection.sendRawTransaction(signedTxn.serialize(), { skipPreflight: true });
//       txSignatures.push(txSignature);
//     }
//     for (const txSignature of txSignatures) {
//       await program.provider.connection.confirmTransaction(txSignature, "confirmed");
//     }
//     return txSignatures;
//   } catch (error) {
//     console.log(error);
//     return;
//   }
// }