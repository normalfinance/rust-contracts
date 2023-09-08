import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Test } from "../target/types/test";

describe("test", () => {
  // Configure the client to use the local cluster.
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Test as Program;

  let myDataAccountSigner = anchor.web3.Keypair.generate();
  let myDataAccountAddress = myDataAccountSigner.publicKey;

  it('Initialize MyData!', async () => {
    // Add your test here.
    const tx = await program.rpc.initializeVault(
      {
          accounts : {
            data : myDataAccountAddress,
            owner : provider.wallet.publicKey,
            systemProgram : anchor.web3.SystemProgram.programId,
          },
          signers : [myDataAccountSigner],
      }
    );
    console.log("Your transaction signature", tx);
    printMyData(myDataAccountAddress, program);
  });

  // it('Update MyData!', async () => {
  //   // generate a random number <= 255
  //   const rnd = Math.floor(Math.random() * 255);
  //   const message = "Updated number is :" +rnd; 
  //   const tx = await program.rpc.updateData(rnd, message, 
  //     {
  //         accounts : {
  //           data : myDataAccountAddress,
  //           owner : provider.wallet.publicKey,
  //         }
  //     }
  //   );
  //   console.log("Your transaction signature", tx);
  //   printMyData(myDataAccountAddress, program);
  // });
});

async function printMyData (myDataAccAddress : anchor.web3.PublicKey , program : Program){

  const myDataAcc = await program.account.myData.fetch(myDataAccAddress);
  console.log("Data of account:", myDataAccAddress.toBase58());
  console.log("Number :", myDataAcc.number.toString() );
  console.log("Message :", myDataAcc.message);
  console.log("Owner :", myDataAcc.owner.toBase58());
}