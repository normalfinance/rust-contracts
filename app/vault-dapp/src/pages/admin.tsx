/* eslint-disable react-hooks/exhaustive-deps */
import { useWallet } from '@solana/wallet-adapter-react';
import useProgram from 'hooks/useProgram';
import { initializeVault } from 'libs/methods';
import { useState } from 'react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useFetchVault from 'hooks/useFetchVault';

export default function Admin() {
  const wallet = useWallet();
  const program = useProgram();
  const [reload, setReload] = useState({});
  const [name, setName] = useState("");
  const { vault } = useFetchVault(reload, name);

  const handleInitializeVault = async () => {
    if (!program) return;
    await initializeVault(wallet, program, name);
    setReload({});
  }

  // const handleFund = async () => {
  //   if (!program || !vault) return;

  //   await fund(wallet, program, name, vault.tokenMint, new BN(amount * decimals));
  //   setReload({});
  // }

  // const handleDrain = async () => {
  //   if (!program || !vault) return;

  //   await drain(wallet, program, name, vault.tokenMint, new BN(amount * decimals));
  //   setReload({});
  // }

  // const handleCloseAll = async () => {
  //   if (!program) return;

  //   const vaults = await program.account.vault.all();
  //   const users = await program.account.user.all();
  //   await callClosePdas(wallet, program, [
  //     ...vaults.map(vault => vault.publicKey),
  //     ...users.map(user => user.publicKey),
  //   ]);
  //   setReload({});
  // }


  return (
    <div className='flex flex-col gap-2'>
      <WalletMultiButton />
      Vault Name: <input value={name} onChange={(e) => setName(e.target.value)} type="text" />
      {!vault && <button onClick={handleInitializeVault}>Initialize</button>}
    </div>
  )
}