/* eslint-disable react-hooks/exhaustive-deps */
import { BN } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import useProgram from 'hooks/useProgram';
import { fund, drain, callCreateUser } from 'libs/methods';
import { useEffect, useState } from 'react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useFetchVault from 'hooks/useFetchVault';
import { VAULT_NAME } from 'config';
import { PublicKey } from '@solana/web3.js';
import { NATIVE_MINT, getMint } from '@solana/spl-token';

export default function Home() {
  const wallet = useWallet();
  const program = useProgram();
  const [reload, setReload] = useState({});
  const [name] = useState(VAULT_NAME);
  const { vault, user } = useFetchVault(reload, name);
  const [isSol, setIsSol] = useState(true);
  const [tokenAddress, setTokenAddress] = useState(NATIVE_MINT.toString());
  const [decimals, setDecimals] = useState(1e9);
  const [amount, setAmount] = useState(0);

  const handleCreateUser = async () => {
    if (!program || !vault || user) return;

    await callCreateUser(wallet, program);
    setReload({});
  }

  const handleFund = async () => {
    if (!program || !vault) return;
    console.log(amount, decimals);
    await fund(wallet, program, VAULT_NAME, new PublicKey(tokenAddress.trim()), new BN(amount * decimals));
    setReload({});
  }

  const handleDrain = async () => {
    if (!program || !vault) return;

    await drain(wallet, program, VAULT_NAME, new PublicKey(tokenAddress.trim()), new BN(amount * decimals));
    setReload({});
  }

  useEffect(() => {
    const getDecimals = async () => {
      if (!program || !tokenAddress.trim()) return;
      try {
        const mint = new PublicKey(tokenAddress.trim());
        if (mint.toString() === NATIVE_MINT.toString()) {
          setDecimals(Math.pow(10, 9));
        } else {
          const { decimals } = await getMint(program.provider.connection, mint);
          setDecimals(Math.pow(10, decimals));
        }
      } catch (error) {

      }
    };

    getDecimals();
  }, [tokenAddress]);
  return (
    <div className='flex flex-col gap-2'>
      <div>
        <WalletMultiButton />
      </div>
      {!user
        ? <button onClick={handleCreateUser}>Create User</button>
        : <>
          Mint Address:
          <div className='flex gap-2'>
            <input id='sol' checked={isSol} type="checkbox" onChange={(e) => {
              e.target.checked && setTokenAddress(NATIVE_MINT.toString());
              setIsSol(e.target.checked);
            }} />
            <label htmlFor='sol'>Sol</label>
          </div>

          <input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} type="text" className={isSol ? 'hidden' : ''} />
          Amount: <input value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0.0)} type="number" />
          <button onClick={handleFund}>Fund</button>

          {user.assets.filter(asset => asset.amount.toNumber()).map(asset => (
            <div className='flex gap-2 items-center' key={asset.mint.toString()}>
              <div className='w-[500px]'>{asset.mint.toString()}</div>
              <div className='w-[50px]'>{asset.amount.toNumber() / (asset.decimals || 1)}</div>
              <button onClick={handleDrain}>Drain</button>
            </div>
          ))}
        </>
      }
    </div>
  )
}
