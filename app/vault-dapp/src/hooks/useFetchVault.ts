import { useState, useEffect, useCallback } from 'react';
import { UserData, VaultData, Mint } from 'types';
import useProgram from './useProgram';
import { getUserPda, getVaultPda } from 'libs/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { getMint } from '@solana/spl-token';

const useFetchVault = (reload: {}, name: string, admin: boolean) => {
  const [vault, setVault] = useState<VaultData>();
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [user, setUser] = useState<UserData>();
  const [users, setUsers] = useState<UserData[]>([]);
  const [mints, setMints] = useState<Mint[]>([]);
  const program = useProgram();
  const { publicKey } = useWallet();

  const fetchVault = useCallback(async () => {
    if (!program || !publicKey) return;
    try {
      const [vault] = getVaultPda(name);
      const vaultData = await program.account.vault.fetchNullable(vault);
      if (vaultData) {
        setVault(vaultData);
        console.log(vaultData);
        const mints: Mint[] = [];
        if (admin) {
          const users = (await program.account.user.all()).filter(user => user.account.vault.toString() === vault.toString());
          setUsers(users.map(user => user.account));
          users.forEach(user => {
            user.account.assets.forEach(asset => {
              if (!mints.map(mint => mint.toString()).includes(asset.mint.toString())) {
                mints.push({
                  mint: asset.mint,
                  decimals: 1,
                });
              }
            });
          });
        } else {
          const [user] = getUserPda(publicKey, vault);
          const userData = await program.account.user.fetchNullable(user);
          if (userData) {
            setUser(userData);
            userData.assets.forEach(asset => {
              mints.push({
                mint: asset.mint,
                decimals: 1,
              });
            });
          }
        }
        setMints(
          await Promise.all(mints.map(async mint => {
            const { decimals } = await getMint(program.provider.connection, mint.mint);
            mint.decimals = Math.pow(10, decimals);
            return mint;
          }))
        );
      } else {
        setVault(undefined);
      }
      if (!admin) {
        const vaults = await program.account.vault.all();
        setVaults(vaults.map(vault => vault.account));
      }
    } catch (error) {
      console.log(error);
    }
  }, [program, publicKey, name, admin]);

  useEffect(() => {
    fetchVault();
  }, [program, fetchVault, reload, name]);

  return { vault, user, users, mints, vaults };
};

export default useFetchVault;