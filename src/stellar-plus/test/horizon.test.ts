import Stellar from "@stellar/stellar-sdk";
import { Constants } from "..";
import { HorizonHandlerClient } from "../horizon";
import { MockAccountResponse } from "./mocks/account-response-mock";
import { MockSubmitTransaction } from "./mocks/transaction-mock";

jest.mock('@stellar/stellar-sdk')

describe('Horizon handler client test', () => {

    beforeEach(() => {
        const userKey = "GBDMM7FQBVQPZFQPXVS3ZKK4UMELIWPBLG2BZQSWERD2KZR44WI6PTBQ"
        const issuerKey = "GD3MJLWE54WOGKAT4SOSMDCPJA6ZTHZ4TW73XFIOCVIHFIDYWDUKAYZT"
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
        Stellar.Horizon.Server = mockServer
    });



    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should load an account successfully', async () => {
        const accountId = "GBDMM7FQBVQPZFQPXVS3ZKK4UMELIWPBLG2BZQSWERD2KZR44WI6PTBQ"
        const issuerKey = "GD3MJLWE54WOGKAT4SOSMDCPJA6ZTHZ4TW73XFIOCVIHFIDYWDUKAYZT"
        const mockAccountResponse = new MockAccountResponse(accountId, issuerKey)
        const horizonHandlerClient = new HorizonHandlerClient(Constants.testnet);

        const account = await horizonHandlerClient.loadAccount(accountId);

        expect(account).toEqual(mockAccountResponse);
        expect(horizonHandlerClient.server.loadAccount).toHaveBeenCalledWith(accountId);
    });

    test('should throw an error when loading an account fails', async () => {
        const errorMessage = 'Failed to load account';
        const accountId = "GBDMM7FQBVQPZFQPXVS3ZKK4UMELIWPBLG2BZQSWERD2KZR44WI6PTBQ"
        const mockServer = jest.fn().mockImplementation(() => ({
            loadAccount: jest.fn().mockRejectedValue(new Error(errorMessage)),
        }));
        Stellar.Horizon.Server = mockServer
        const horizonHandlerClient = new HorizonHandlerClient(Constants.testnet);

        expect(horizonHandlerClient.loadAccount(accountId))
            .rejects.toThrow('Could not load account from horizon');
    });
});
