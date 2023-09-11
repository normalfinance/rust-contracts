import { useState, useEffect, useCallback } from 'react';
import { Asset, UserData, VaultData } from 'types';
import useProgram from './useProgram';
import { getUserPda, getVaultPda } from 'libs/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { getMint } from '@solana/spl-token';

const useFetchVault = (reload: {}, name: string) => {
  const [vault, setVault] = useState<VaultData>();
  const [user, setUser] = useState<UserData>();
  const program = useProgram();
  const { publicKey } = useWallet();

  const fetchVault = useCallback(async () => {
    if (!program || !publicKey) return;
    try {
      const [vault] = getVaultPda(name);
      const vaultData = await program.account.vault.fetchNullable(vault);

      if (vaultData) {
        
      }
      setVault(vaultData as VaultData);
      const [user] = getUserPda(publicKey, vault);
      const userData = await program.account.user.fetchNullable(user);
      if (userData) {
        await Promise.all(userData.assets.map(async (asset: Asset) => {
          const { decimals } = await getMint(program.provider.connection, asset.mint);
          asset.decimals = Math.pow(10, decimals);
        }));
      }
      setUser(userData as UserData);
    } catch (error) {
      console.log(error);
    }
  }, [program, publicKey, name]);

  useEffect(() => {
    fetchVault();
  }, [program, fetchVault, reload, name]);

  return { vault, user };
};

export default useFetchVault;