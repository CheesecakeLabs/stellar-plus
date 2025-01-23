use crate::{error::Error, storage, token};
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct SimpleDepositTokenContract;

#[contractimpl]
impl SimpleDepositTokenContract {
  pub fn initialize(env: Env, admin: Address, token: Address) -> Result<(), Error> {
    admin.require_auth();

    let mut ownership_record = env
      .storage()
      .persistent()
      .get(&storage::OWNERSHIP)
      .unwrap_or(storage::StorageClient::get_default_ownership(env.clone()));

    if ownership_record.initialized {
      return Err(Error::AlreadyInitialized);
    }

    ownership_record.token = token.clone();
    ownership_record.owner = admin.clone();
    ownership_record.initialized = true;

    env
      .storage()
      .persistent()
      .set(&storage::OWNERSHIP, &ownership_record);

    return Ok(());
  }

  pub fn get_contract_globals(env: Env) -> storage::Ownership {
    let ownership_record = env
      .storage()
      .persistent()
      .get(&storage::OWNERSHIP)
      .unwrap_or(storage::StorageClient::get_default_ownership(env.clone()));

    return ownership_record;
  }

  pub fn set_owner(env: Env, to: Address, new_owner: Address) -> Result<(), Error> {
    to.require_auth();

    let mut ownership_record = env
      .storage()
      .persistent()
      .get(&storage::OWNERSHIP)
      .unwrap_or(storage::StorageClient::get_default_ownership(env.clone()));

    if !ownership_record.initialized {
      return Err(Error::NotInitialized);
    }

    if to != ownership_record.owner {
      return Err(Error::NotOwner);
    }

    ownership_record.owner = new_owner.clone();

    env
      .storage()
      .persistent()
      .set(&storage::OWNERSHIP, &ownership_record);

    Ok(())
  }

  pub fn deposit(env: Env, from: Address, amount: i128, asset: Address) -> Result<(), Error> {
    from.require_auth();

    let ownership_record = env
      .storage()
      .persistent()
      .get(&storage::OWNERSHIP)
      .unwrap_or(storage::StorageClient::get_default_ownership(env.clone()));

    if !ownership_record.initialized {
      return Err(Error::NotInitialized);
    }

    if !ownership_record.token.eq(&asset) {
      return Err(Error::MismatchingAsset);
    }

    let token_client = token::Client::new(&env, &ownership_record.token);

    let key = storage::UserInfoRegistry::UserInfos(from.clone());

    let mut user_record =
      env
        .storage()
        .instance()
        .get(&key)
        .unwrap_or(storage::StorageClient::get_default_user_info(
          env.clone(),
          from.clone(),
        ));

    user_record.balance += amount;

    token_client.transfer(&from, &env.current_contract_address(), &amount);

    env.storage().instance().set(&key, &user_record);

    Ok(())
  }

  pub fn get_user_info(env: Env, from: Address) -> storage::UserInfo {
    from.require_auth();

    let key = storage::UserInfoRegistry::UserInfos(from.clone());

    let user_record =
      env
        .storage()
        .instance()
        .get(&key)
        .unwrap_or(storage::StorageClient::get_default_user_info(
          env.clone(),
          from.clone(),
        ));

    return user_record;
  }
}
