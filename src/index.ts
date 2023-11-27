import * as StellarPlus from "./stellar-plus";
import { AccountHandler } from "./stellar-plus/account/account-handler/types";
import {
  FeeBumpHeader,
  TransactionInvocation,
} from "./stellar-plus/core/types";
import * as stellarSdk from "stellar-sdk";
// ========================================
// SETUP
// ========================================

const opex = new StellarPlus.Account.DefaultAccountHandler({
  secretKey: "SAVEZGZT5KOQFFPSCMY7P5PBA6CGJIL4PUWUVZRKYN2Q72VLRSKURDAA",
});

const assetIssuer = new StellarPlus.Account.DefaultAccountHandler({
  secretKey: "SC7QP27MA524VRVSBOWQ3TKWAWR27WADFMKPIT4IFSXSKAYCTCBNCECZ",
});

const asset = new StellarPlus.Asset.ClassicAssetHandler(
  "CAKE",
  assetIssuer.publicKey,
  StellarPlus.Constants.testnet,
  assetIssuer
);

const invocationDetails: TransactionInvocation = {
  header: {
    source: opex.getPublicKey(),
    fee: "100",
    timeout: 30,
  },
  signers: [opex],
  // feeBump: {
  //   header: {
  //     source: opex.getPublicKey(),
  //     fee: "100",
  //     timeout: 30,
  //   },
  //   signers: [opex],
  // },
};

const rpc = new StellarPlus.RPC.ValidationCloudRpcHandler(
  StellarPlus.Constants.testnet,
  "Knct5k6sgFn2w2gPvBTOdOc3u5sNnLW9dt6kSLSPrs8"
);

const codClient = new StellarPlus.Contracts.CertificateOfDeposit(
  "CCZUQBT62C3E7NRKQKMVKMS6SY5UNLGJINOLRGXMOU35WXC6RRBSMZGM",
  StellarPlus.Constants.testnet,
  rpc
);

// ========================================
// Account Creation and setup
// ========================================

console.log("Creating users!");
const users: AccountHandler[] = [];
const network = StellarPlus.Constants.testnet;
users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
// users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
// users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
// users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
// users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
// users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));

users.forEach(async (user) => {
  console.log("Creating user: ", user.getPublicKey());
  await user.friendbot?.initialize();

  const feeBump: FeeBumpHeader = {
    ...invocationDetails,
    header: {
      ...invocationDetails.header,
      fee: Math.floor(
        Math.random() * (10000000000 - 100000000 + 1) + 100000000
      ).toString(),
    },
  };

  const userInvocationDetails = {
    header: {
      ...invocationDetails.header,
      source: user.getPublicKey(),
    },
    signers: [user],
    feeBump,
  };

  console.log("Adding Trustline to user: ", user.getPublicKey());
  await asset.addTrustlineAndMint({
    to: user.getPublicKey(),
    amount: 100000,
    ...userInvocationDetails,
  });

  console.log("balance: ", await asset.balance({ id: user.getPublicKey() }));

  const pos = await codClient.getPosition({
    address: user.getPublicKey(),
    ...userInvocationDetails,
  });

  console.log("cod position: ", pos);

  // await asset.transfer({
  //   from: user.getPublicKey(),
  //   to: "GBUBEUHZKWHCHLBXEQ5SUDPYGSGEDF5PLXFNR7SC6VSD7GQJORAZI3WZ",
  //   amount: BigInt(123),
  //   ...userInvocationDetails,
  // });
  // console.log(
  //   "balance after transfer: ",
  //   await asset.balance({ id: user.getPublicKey() })
  // );
  // console.log("Depositing to user: ", user.getPublicKey());

  // await codClient.deposit({
  //   amount: BigInt(3000),
  //   address: user.getPublicKey(),
  //   ...userInvocationDetails,
  // });

  // console.log("balance: ", await asset.balance({ id: user.getPublicKey() }));

  // console.log("position: ");
  // await codClient.getPosition({
  //   address: user.getPublicKey(),
  //   ...userInvocationDetails,
  // });
});

// const codClient = new StellarPlus.contracts.CertificateOfDeposit(
//   "CCZUQBT62C3E7NRKQKMVKMS6SY5UNLGJINOLRGXMOU35WXC6RRBSMZGM",
//   StellarPlus.constants.testnet,
//   rpc
// );

// // asset
// //   .addTrustlineAndMint({
// //     to: user.publicKey,
// //     amount: 1000000,
// //     ...invocationDetails,
// //   })
// //   .then((result) => {
// //     console.log("MINT RESULT", result);
// //   });

// codClient
//   .deposit({
//     amount: BigInt(1000),
//     address: user.publicKey,
//     ...invocationDetails,
//   })
//   .then((result) => {
//     console.log("DEPOSIT RESULT", result);

//     codClient
//       .getPosition({ address: user.publicKey, ...invocationDetails })
//       .then((result) => {
//         console.log("POS RESULT", result);
//       });
//   });

// // codClient
// //   .withdraw({
// //     address: user.publicKey,
// //     acceptPrematureWithdraw: true,
// //     ...invocationDetails,
// //   })
// //   .then((result) => {
// //     console.log("WITHDRAW RESULT", result);
// //   });

// // codClient
// //   .getPosition({ address: user.publicKey, ...invocationDetails })
// //   .then((result) => {
// //     console.log("POS RESULT", result);
// //   });
