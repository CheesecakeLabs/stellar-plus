import Stellar from "@stellar/stellar-sdk";
import { Constants, Contracts, RPC } from "..";
import { DefaultAccountHandler } from "../account";
import { MockAccountResponse } from "./mocks/account-response-mock";
import { MockSubmitTransaction } from "./mocks/transaction-mock";


jest.mock('@stellar/stellar-sdk')

describe('Test contracts handler', () => {

    beforeEach(() => {
        initMockStellar()
    });

    function mockKeypair(publicKey: any, secret: any) {
        const mockKeypair = {
            publicKey: jest.fn().mockReturnValue(publicKey),
            secret: jest.fn().mockReturnValue(secret)
        }
        Stellar.Keypair.fromSecret = jest.fn().mockReturnValue(mockKeypair);
    }

    function mockServer(userKey: string, issuerKey: string) {
        const mockAccountResponse = new MockAccountResponse(userKey, issuerKey)
        const mockLoadAccount = jest.fn().mockReturnValue(mockAccountResponse)
        const mockSubmitTransaction = jest.fn().mockResolvedValue(MockSubmitTransaction)
        const mockServer = jest.fn().mockImplementation(() => ({
            loadAccount: mockLoadAccount,
            submitTransaction: mockSubmitTransaction,
            server: {
                submitTransaction: mockSubmitTransaction
            },
            getTransaction: jest.fn().mockResolvedValue("Success"),
            prepareTransaction: jest.fn().mockResolvedValue("Success"),
            simulateTransaction: jest.fn().mockResolvedValue("Success"),
        }));
        Stellar.Server = mockServer
        Stellar.Horizon.Server = mockServer
        Stellar.SorobanRpc.Server = mockServer
    }

    function mockAsset(issuerKey: string) {
        Stellar.Asset = jest.fn().mockImplementation(() => ({
            getIssuer: jest.fn().mockReturnValue(issuerKey),
        }));
    }

    function initMockStellar() {
        const userKey = "GBDMM7FQBVQPZFQPXVS3ZKK4UMELIWPBLG2BZQSWERD2KZR44WI6PTBQ"
        const userSecret = "SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV"
        const issuerKey = "GD3MJLWE54WOGKAT4SOSMDCPJA6ZTHZ4TW73XFIOCVIHFIDYWDUKAYZT"
        mockKeypair(userKey, userSecret)
        mockServer(userKey, issuerKey)
        mockAsset(issuerKey)
        Stellar.Address = jest.fn().mockReturnValue("address")
    }

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Get transaction of default RPC', async () => {
        const network = Constants.testnet
        const rpcHandler = new RPC.DefaultRpcHandler(network);

        const transaction = await rpcHandler.getTransaction("HASH")
        expect(transaction).toBe("Success")
    });

    test('Prepare transaction of default RPC handler', async () => {

        const network = Constants.testnet
        const rpcHandler = new RPC.DefaultRpcHandler(network);
        const transaction = await rpcHandler.prepareTransaction(<any>"Transaction")
        expect(transaction).toBe("Success")
    });

    test('Simulate transaction of default RPC handler', async () => {

        const network = Constants.testnet
        const rpcHandler = new RPC.DefaultRpcHandler(network);
        const transaction = await rpcHandler.simulateTransaction(<any>"Transaction")
        expect(transaction).toBe("Success")
    });

    test('should return the position of soroban contract', async () => {

        const contractId = "CCZUQBT62C3E7NRKQKMVKMS6SY5UNLGJINOLRGXMOU35WXC6RRBSMZGM"
        const userSecret = "SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV"
        const network = Constants.testnet

        const rpcHandler = new RPC.DefaultRpcHandler(network);
        const codContract = new Contracts.CertificateOfDeposit({
            network: network,
            contractId: contractId,
            rpcHandler: rpcHandler
        });
        const user = new DefaultAccountHandler({
            secretKey: userSecret,
            network: Constants.testnet
        });

        const userAInvocationHeader = {
            header: {
                source: user.publicKey,
                fee: "500000",
                timeout: 30,
            },
            signers: [user],
        };

        jest.spyOn(codContract as any, "invokeContract").mockResolvedValue("Success")
        await codContract.deposit({
            address: user.publicKey,
            amount: BigInt(1000000),
            ...userAInvocationHeader,
        });

        jest.spyOn(codContract as any, "readFromContract").mockResolvedValue("1000000")
        const position = await codContract.getPosition({
            address: user.publicKey,
            ...userAInvocationHeader,
        })

        const mockAddressObject = jest.fn().mockReturnValue("address")
        const mockAddress = new mockAddressObject()
        expect(position).toBe(1000000)
        expect((codContract as any).invokeContract).toHaveBeenCalledWith({
            method: "deposit",
            methodArgs: { amount: BigInt(1000000), address: mockAddress },
            signers: [user],
            header: userAInvocationHeader.header,
            feeBump: undefined,
        })

    });

    test('withdraw of soroban contract', async () => {

        const contractId = "CCZUQBT62C3E7NRKQKMVKMS6SY5UNLGJINOLRGXMOU35WXC6RRBSMZGM"
        const userSecret = "SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV"
        const network = Constants.testnet

        const rpcHandler = new RPC.DefaultRpcHandler(network);
        const codContract = new Contracts.CertificateOfDeposit(
            {
                network: network,
                contractId: contractId,
                rpcHandler: rpcHandler
            });
        const user = new DefaultAccountHandler({
            secretKey: userSecret,
            network: Constants.testnet
        });

        const userInvocationHeader = {
            header: {
                source: user.publicKey,
                fee: "500000",
                timeout: 30,
            },
            signers: [user],
        };

        jest.spyOn(codContract as any, "invokeContract").mockResolvedValue("Success")
        await codContract.withdraw({
            address: user.publicKey,
            acceptPrematureWithdraw: true,
            ...userInvocationHeader,
        });

        const mockAddressObject = jest.fn().mockReturnValue("address")
        const mockAddress = new mockAddressObject()
        expect((codContract as any).invokeContract).toHaveBeenCalledWith({
            method: "withdraw",
            methodArgs: { address: mockAddress, accept_premature_withdraw: true },
            signers: [user],
            header: userInvocationHeader.header,
            feeBump: undefined,
        })

    });

    test('Get estimated yield of soroban contract', async () => {

        const contractId = "CCZUQBT62C3E7NRKQKMVKMS6SY5UNLGJINOLRGXMOU35WXC6RRBSMZGM"
        const userSecret = "SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV"
        const network = Constants.testnet

        const rpcHandler = new RPC.DefaultRpcHandler(network);
        const codContract = new Contracts.CertificateOfDeposit({
            network: network,
            contractId: contractId,
            rpcHandler: rpcHandler
        });
        const user = new DefaultAccountHandler({
            secretKey: userSecret,
            network: Constants.testnet
        });

        const userInvocationHeader = {
            header: {
                source: user.publicKey,
                fee: "500000",
                timeout: 30,
            },
            signers: [user],
        };

        jest.spyOn(codContract as any, "readFromContract").mockResolvedValue("1000")
        const estimatedYield = await codContract.getEstimatedYield({
            address: user.publicKey,
            ...userInvocationHeader,
        });

        const mockAddressObject = jest.fn().mockReturnValue("address")
        const mockAddress = new mockAddressObject()
        expect((codContract as any).readFromContract).toHaveBeenCalledWith({
            method: "get_estimated_yield",
            methodArgs: { address: mockAddress },
            header: userInvocationHeader.header,
        })
        expect(estimatedYield).toBe(1000)

    });

    test('Get time left of soroban contract', async () => {

        const contractId = "CCZUQBT62C3E7NRKQKMVKMS6SY5UNLGJINOLRGXMOU35WXC6RRBSMZGM"
        const userSecret = "SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV"
        const network = Constants.testnet

        const rpcHandler = new RPC.DefaultRpcHandler(network);
        const codContract = new Contracts.CertificateOfDeposit({
            network: network,
            contractId: contractId,
            rpcHandler: rpcHandler
        });
        const user = new DefaultAccountHandler({
            secretKey: userSecret,
            network: Constants.testnet
        });

        const userInvocationHeader = {
            header: {
                source: user.publicKey,
                fee: "500000",
                timeout: 30,
            },
            signers: [user],
        };

        jest.spyOn(codContract as any, "readFromContract").mockResolvedValue("10011234")
        const getTimeLeft = await codContract.getTimeLeft({
            address: user.publicKey,
            ...userInvocationHeader,
        });

        const mockAddressObject = jest.fn().mockReturnValue("address")
        const mockAddress = new mockAddressObject()
        expect((codContract as any).readFromContract).toHaveBeenCalledWith({
            method: "get_time_left",
            methodArgs: { address: mockAddress },
            header: userInvocationHeader.header,
        })
        expect(getTimeLeft).toBe(10011234)
    });

});
