build:
	$(MAKE) -C test-contracts/ build

test:
	$(MAKE) -C test-contracts/ test

fmt:
	$(MAKE) -C test-contracts/ fmt

clean:
	$(MAKE) -C test-contracts/ clean

generate-bindings:
	$(MAKE) -C test-contracts/ generate-bindings

deploy:
	$(MAKE) -C test-contracts/ deploy

inspect:
	$(MAKE) -C test-contracts/ inspect

update-wasm:
	$(MAKE) -C test-contracts/ update-wasm

setup-accounts:
	$(MAKE) -C test-contracts/ setup-accounts

deploy-accounts:
	$(MAKE) -C test-contracts/ deploy-accounts

add-testnet-network:
	$(MAKE) -C test-contracts/ add-testnet-network