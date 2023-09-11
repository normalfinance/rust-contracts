import { AnchorProvider, Program } from '@project-serum/anchor';
import { useState, useEffect } from 'react';
import { IDL, SplVault } from 'idl/spl_vault';
import idl from 'idl/spl_vault.json';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';

const useProgram = () => {
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();
    const [program, setProgram] = useState<Program<SplVault>>();

    useEffect(() => {
        if (!connection || !anchorWallet) return;
        const provider = new AnchorProvider(connection, anchorWallet, { preflightCommitment: "processed" });
        const program = new Program(IDL, idl.metadata.address, provider);
        setProgram(program);
    }, [anchorWallet, connection]);
    
    return program;
};

export default useProgram;