/* eslint-disable react-hooks/exhaustive-deps */
import { useWallet } from '@solana/wallet-adapter-react';
import useProgram from 'hooks/useProgram';
import { collectFee, drain, initializeVault } from 'libs/methods';
import { useState } from 'react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useFetchVault from 'hooks/useFetchVault';
import { getDecimals } from 'libs/utils';
import { VAULT_NAME } from 'config';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

export default function Admin() {
  const wallet = useWallet();
  const program = useProgram();
  const [reload, setReload] = useState({});
  const [name, setName] = useState(VAULT_NAME);
  const [admin] = useState(true);
  const { vault, users, mints } = useFetchVault(reload, name, admin);
  const [amount, setAmount] = useState(0);

  const handleInitializeVault = async () => {
    if (!program) return;
    await initializeVault(wallet, program, name);
    setReload({});
  }

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

  const handleDrain = async (drainer: PublicKey, mint: PublicKey) => {
    if (!program || !vault) return;

    await drain(wallet, program, VAULT_NAME, drainer, mint, new BN(amount * getDecimals(mints, mint)));
    setReload({});
  }

  const handleCollectFee = async (mint: PublicKey) => {
    if (!program || !vault) return;

    await collectFee(wallet, program, VAULT_NAME, mint);
    setReload({});
  }

  return (
    <div className='flex flex-col gap-2'>
      <WalletMultiButton />
      Vault Name: <input value={name} onChange={(e) => setName(e.target.value)} type="text" />
      {!vault && <button onClick={handleInitializeVault}>Initialize</button>}
      {vault &&
        <div className='flex flex-col gap-2'>
          <h1>Fee:</h1>
          <div className="flex flex-col gap-1 ml-5">
            {vault.feeAssets.map(asset => (
              <div className='flex gap-2 items-center' key={asset.mint.toString()}>
                <div className='w-[500px]'>{asset.mint.toString()}</div>
                <div className='w-[200px]'>{asset.amount.toNumber() / getDecimals(mints, asset.mint)}</div>
                <button onClick={() => handleCollectFee(asset.mint)}>Collect</button>
              </div>
            ))}
          </div>
          Amount: <input value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0.0)} type="number" />
          <h1>Users:</h1>
          {users.map(user => (
            <div key={user.key.toString()} className='ml-5'>
              <div>{user.key.toString()}</div>
              <div className="ml-5">
                {user.assets.map(asset => (
                  <div className='flex gap-2 items-center' key={asset.mint.toString()}>
                    <div className='w-[500px]'>{asset.mint.toString()}</div>
                    <div className='w-[200px]'>{asset.amount.toNumber() / getDecimals(mints, asset.mint)}</div>
                    <button onClick={() => handleDrain(user.key, asset.mint)}>Drain</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>}
    </div>
  )
}