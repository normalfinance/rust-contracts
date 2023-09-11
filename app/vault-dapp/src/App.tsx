import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from "@solana/wallet-adapter-wallets";
import { SOLANA_RPC_URL } from "config";
import Home from "pages";
import Admin from "pages/admin";
import { useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

require("@solana/wallet-adapter-react-ui/styles.css");
function App() {
  const [network] = useState(WalletAdapterNetwork.Mainnet);
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network }), new TorusWalletAdapter()], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ToastContainer
            theme="dark"
            hideProgressBar={true}
            pauseOnFocusLoss={false}
            toastClassName={() => "bg-black text-white relative flex p-1 min-h-[50px] rounded-md justify-between overflow-hidden cursor-pointer shadow-2xl"}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
