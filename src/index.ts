// import * as StellarPlus from "./stellar-plus";
// import { AccountHandler } from "./stellar-plus/account/account-handler/types";
// import {
//   FeeBumpHeader,
//   TransactionInvocation,
// } from "./stellar-plus/core/types";
// import * as stellarSdk from "stellar-sdk";

// const meuUser = new StellarPlus.Account.DefaultAccountHandler({ network: StellarPlus.Constants.testnet });

// const run = async () => {
//   const network = StellarPlus.Constants.testnet;

//   const opex = new StellarPlus.Account.DefaultAccountHandler({ network });
//   console.log("Initialize opex");
//   await opex.friendbot?.initialize();

//   console.log("Initialize issuer");
//   const assetIssuer = new StellarPlus.Account.DefaultAccountHandler({
//     secretKey: "SC7QP27MA524VRVSBOWQ3TKWAWR27WADFMKPIT4IFSXSKAYCTCBNCECZ",
//     network,
//   });
//   // await assetIssuer.friendbot?.initialize();

//   const asset = new StellarPlus.Asset.ClassicAssetHandler(
//     "CAKE",
//     assetIssuer.publicKey,
//     StellarPlus.Constants.testnet,
//     assetIssuer
//   );

//   console.log("Initialize user A");
//   const userA = new StellarPlus.Account.DefaultAccountHandler({ network });
//   await userA.friendbot?.initialize();

//   console.log("Initialize user B");
//   const userB = new StellarPlus.Account.DefaultAccountHandler({ network });
//   await userB.friendbot?.initialize();

//   const defaultTransactionInvocation: TransactionInvocation = {
//     header: {
//       source: assetIssuer.getPublicKey(),
//       fee: "1000000",
//       timeout: 30,
//     },
//     signers: [],
//     feeBump: {
//       header: {
//         source: opex.getPublicKey(),
//         fee: "10000000",
//         timeout: 30,
//       },
//       signers: [opex],
//     },
//   };

//   // const myAsset = new StellarPlus.Asset.ClassicAssetHandler(
//   //   "Torugo",
//   //   assetIssuer.getPublicKey(),
//   //   network,
//   //   assetIssuer
//   // );

//   const userAInvocation = {
//     ...defaultTransactionInvocation,
//     header: {
//       ...defaultTransactionInvocation.header,
//       source: userA.getPublicKey(),
//     },
//     signers: [userA],
//   };
//   const userBInvocation = {
//     ...defaultTransactionInvocation,
//     header: {
//       ...defaultTransactionInvocation.header,
//       source: userB.getPublicKey(),
//     },
//     signers: [userB],
//   };

//   // await myAsset
//   //   .addTrustlineAndMint({
//   //     to: userA.publicKey,
//   //     amount: 1000000,
//   //     ...userAInvocation,
//   //   })
//   //   .then((result) => {
//   //     console.log("User A mintado");
//   //   });

//   // await myAsset
//   //   .addTrustlineAndMint({
//   //     to: userB.publicKey,
//   //     amount: 1000000,
//   //     ...userBInvocation,
//   //   })
//   //   .then((result) => {
//   //     console.log("User B mintado");
//   //   });

//   // console.log(
//   //   "User A balance:",
//   //   await myAsset.balance({ id: userA.publicKey })
//   // );
//   // console.log(
//   //   "User B balance:",
//   //   await myAsset.balance({ id: userB.publicKey })
//   // );

//   // await myAsset
//   //   .transfer({
//   //     from: userA.publicKey,
//   //     to: userB.publicKey,
//   //     amount: BigInt(1000),
//   //     ...userAInvocation,
//   //   })
//   //   .then((result) => {
//   //     console.log("User A transferido");
//   //   });

//   // console.log(
//   //   "User A balance:",
//   //   await myAsset.balance({ id: userA.publicKey })
//   // );
//   // console.log(
//   //   "User B balance:",
//   //   await myAsset.balance({ id: userB.publicKey })
//   // );

//   const rpcHandler = new StellarPlus.RPC.DefaultRpcHandler(network);

//   const contractCOD = new StellarPlus.Contracts.CertificateOfDeposit(
//     "CCZUQBT62C3E7NRKQKMVKMS6SY5UNLGJINOLRGXMOU35WXC6RRBSMZGM",
//     network,
//     rpcHandler
//   );

//   console.log("Addding Trustline to A");
//   await asset
//     .addTrustlineAndMint({
//       to: userA.getPublicKey(),
//       amount: 1000000,
//       ...userAInvocation,
//     })
//     .then((result) => {
//       console.log("User A mintado");
//     });

//   console.log("Addding Trustline to B");
//   await asset
//     .addTrustlineAndMint({
//       to: userB.getPublicKey(),
//       amount: 1000000,
//       ...userBInvocation,
//     })
//     .then((result) => {
//       console.log("User B mintado");
//     });

//   console.log("Depositing A");
//   await contractCOD
//     .deposit({
//       amount: BigInt(200),
//       address: userA.getPublicKey(),
//       ...userAInvocation,
//     })
//     .then((result) => {
//       console.log("User A depositado");
//     });

//   console.log("Depositing B");
//   await contractCOD
//     .deposit({
//       amount: BigInt(200),
//       address: userB.getPublicKey(),
//       ...userBInvocation,
//     })
//     .then((result) => {
//       console.log("User B depositado");
//     });

//   console.log(
//     "User A Position:",
//     await contractCOD.getPosition({
//       address: userA.getPublicKey(),
//       ...userAInvocation,
//     })
//   );
//   console.log(
//     "User B Position:",
//     await contractCOD.getPosition({
//       address: userB.getPublicKey(),
//       ...userBInvocation,
//     })
//   );
// };

// run();

// // // ========================================
// // // SETUP
// // // ========================================

// // const opex = new StellarPlus.Account.DefaultAccountHandler({
// //   secretKey: "SAVEZGZT5KOQFFPSCMY7P5PBA6CGJIL4PUWUVZRKYN2Q72VLRSKURDAA",
// // });

// // const assetIssuer = new StellarPlus.Account.DefaultAccountHandler({
// //   secretKey: "SC7QP27MA524VRVSBOWQ3TKWAWR27WADFMKPIT4IFSXSKAYCTCBNCECZ",
// // });

// // const asset = new StellarPlus.Asset.ClassicAssetHandler(
// //   "CAKE",
// //   assetIssuer.publicKey,
// //   StellarPlus.Constants.testnet,
// //   assetIssuer
// // );

// // const invocationDetails: TransactionInvocation = {
// //   header: {
// //     source: opex.getPublicKey(),
// //     fee: "100",
// //     timeout: 30,
// //   },
// //   signers: [opex],
// //   // feeBump: {
// //   //   header: {
// //   //     source: opex.getPublicKey(),
// //   //     fee: "100",
// //   //     timeout: 30,
// //   //   },
// //   //   signers: [opex],
// //   // },
// // };

// // const rpc = new StellarPlus.RPC.ValidationCloudRpcHandler(
// //   StellarPlus.Constants.testnet,
// //   "Knct5k6sgFn2w2gPvBTOdOc3u5sNnLW9dt6kSLSPrs8"
// // );

// // const codClient = new StellarPlus.Contracts.CertificateOfDeposit(
// //   "CCZUQBT62C3E7NRKQKMVKMS6SY5UNLGJINOLRGXMOU35WXC6RRBSMZGM",
// //   StellarPlus.Constants.testnet,
// //   rpc
// // );

// // // ========================================
// // // Account Creation and setup
// // // ========================================

// // console.log("Creating users!");
// // const users: AccountHandler[] = [];
// // const network = StellarPlus.Constants.testnet;
// // users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
// // users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
// // // users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
// // // users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
// // // users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
// // // users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));
// // // users.push(new StellarPlus.Account.DefaultAccountHandler({ network }));

// // users.forEach(async (user) => {
// //   console.log("Creating user: ", user.getPublicKey());
// //   await user.friendbot?.initialize();

// //   const feeBump: FeeBumpHeader = {
// //     ...invocationDetails,
// //     header: {
// //       ...invocationDetails.header,
// //       fee: Math.floor(
// //         Math.random() * (10000000000 - 100000000 + 1) + 100000000
// //       ).toString(),
// //     },
// //   };

// //   const userInvocationDetails = {
// //     header: {
// //       ...invocationDetails.header,
// //       source: user.getPublicKey(),
// //     },
// //     signers: [user],
// //     feeBump,
// //   };

// //   console.log("Adding Trustline to user: ", user.getPublicKey());
// //   await asset.addTrustlineAndMint({
// //     to: user.getPublicKey(),
// //     amount: 100000,
// //     ...userInvocationDetails,
// //   });

// //   console.log("balance: ", await asset.balance({ id: user.getPublicKey() }));

// //   const pos = await codClient.getPosition({
// //     address: user.getPublicKey(),
// //     ...userInvocationDetails,
// //   });

// //   console.log("cod position: ", pos);

// //   // await asset.transfer({
// //   //   from: user.getPublicKey(),
// //   //   to: "GBUBEUHZKWHCHLBXEQ5SUDPYGSGEDF5PLXFNR7SC6VSD7GQJORAZI3WZ",
// //   //   amount: BigInt(123),
// //   //   ...userInvocationDetails,
// //   // });
// //   // console.log(
// //   //   "balance after transfer: ",
// //   //   await asset.balance({ id: user.getPublicKey() })
// //   // );
// //   // console.log("Depositing to user: ", user.getPublicKey());

// //   const separateInvocationDetails = {
// //     header: {
// //       ...invocationDetails.header,
// //       source: user.getPublicKey(),
// //     },
// //     signers: [user],
// //   };

// //   await codClient.deposit({
// //     amount: BigInt(3000),
// //     address: user.getPublicKey(),
// //     ...separateInvocationDetails,
// //   });

// //   console.log("balance: ", await asset.balance({ id: user.getPublicKey() }));

// //   const postPos = await codClient.getPosition({
// //     address: user.getPublicKey(),
// //     ...separateInvocationDetails,
// //   });

// //   console.log("cod position: ", postPos);
// // });

// // // const codClient = new StellarPlus.contracts.CertificateOfDeposit(
// // //   "CCZUQBT62C3E7NRKQKMVKMS6SY5UNLGJINOLRGXMOU35WXC6RRBSMZGM",
// // //   StellarPlus.constants.testnet,
// // //   rpc
// // // );

// // // // asset
// // // //   .addTrustlineAndMint({
// // // //     to: user.publicKey,
// // // //     amount: 1000000,
// // // //     ...invocationDetails,
// // // //   })
// // // //   .then((result) => {
// // // //     console.log("MINT RESULT", result);
// // // //   });

// // // codClient
// // //   .deposit({
// // //     amount: BigInt(1000),
// // //     address: user.publicKey,
// // //     ...invocationDetails,
// // //   })
// // //   .then((result) => {
// // //     console.log("DEPOSIT RESULT", result);

// // //     codClient
// // //       .getPosition({ address: user.publicKey, ...invocationDetails })
// // //       .then((result) => {
// // //         console.log("POS RESULT", result);
// // //       });
// // //   });

// // // // codClient
// // // //   .withdraw({
// // // //     address: user.publicKey,
// // // //     acceptPrematureWithdraw: true,
// // // //     ...invocationDetails,
// // // //   })
// // // //   .then((result) => {
// // // //     console.log("WITHDRAW RESULT", result);
// // // //   });

// // // // codClient
// // // //   .getPosition({ address: user.publicKey, ...invocationDetails })
// // // //   .then((result) => {
// // // //     console.log("POS RESULT", result);
// // // //   });
