import type { Config } from "@jest/types"
import { pathsToModuleNameMapper } from 'ts-jest'

const config: Config.InitialOptions = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: false,
    automock: false,
    moduleDirectories: ["node_modules", 'src'],
    moduleNameMapper: pathsToModuleNameMapper({
        "@account/*": [
            "<rootDir>/stellar-plus/account/*"
        ],
        "@asset/*": [
            "<rootDir>/stellar-plus/asset/*"
        ],
        "@channel-accounts/*": [
            "<rootDir>/stellar-plus/channel-accounts/*"
        ],
        "@core/*": [
            "<rootDir>/stellar-plus/core/*"
        ],
        "@horizon/*": [
            "<rootDir>/stellar-plus/horizon/*"
        ],
        "@rpc/*": [
            "<rootDir>/stellar-plus/rpc/*"
        ],
        "@soroban/*": [
            "<rootDir>/stellar-plus/soroban/*"
        ],
        "@stellar-plus/*": [
            "<rootDir>/stellar-plus/*"
        ],
        "@tests/*": [
            "<rootDir>/stellar-plus/test/*"
        ],
    }),
}
export default config