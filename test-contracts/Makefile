# Run cargo build on all contracts
build:
	$(MAKE) -C contracts/token build
	$(MAKE) -C contracts/hello-world build

# Run cargo test on all contracts
test: build
	$(MAKE) -C contracts/token test
	$(MAKE) -C contracts/hello-world test

# Update the wasm files to be used in the integration tests
update-wasm: build
	cp target/wasm32-unknown-unknown/release/soroban_token_contract.wasm ../src/tests/contracts/hello-world/soroban_token_contract.wasm
	cp target/wasm32-unknown-unknown/release/hello_world.wasm ../src/tests/contracts/hello-world/hello_world.wasm

# Run cargo fmt on all files
fmt:
	cargo fmt --all

# Clean cargo cache
clean:
	cargo clean

# Generate bindings
generate-bindings:
	stellar contract bindings json --wasm target/wasm32-unknown-unknown/release/hello_world.wasm

# Inspect the contract
inspect:
	soroban contract info interface --wasm target/wasm32-unknown-unknown/release/hello_world.wasm

# Create testnet accounts
setup-accounts:
	stellar keys generate testkey --fund \
    --rpc-url "https://soroban-testnet.stellar.org" \
    --network-passphrase "Standalone Network ; February 2015" -v

# Deploy the Liquid Staking Contract
deploy-contract:
	soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/hello_world.wasm \
		--network testnet \
		--source testkey

# Add testnet network
add-testnet-network:
	stellar network add testnet \
    --rpc-url "https://soroban-testnet.stellar.org" \
    --network-passphrase "Test SDF Network ; September 2015" -v