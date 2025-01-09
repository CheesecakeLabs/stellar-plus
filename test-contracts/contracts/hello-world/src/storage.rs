#![allow(unused)]
use soroban_sdk::{contracttype, symbol_short, Address, Env, IntoVal, String, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct Ownership {
  pub owner: Address,
  pub token: Address,
  pub initialized: bool,
}

pub const OWNERSHIP: Symbol = symbol_short!("OWNERSHIP");

#[contracttype]
pub enum UserInfoRegistry {
  UserInfos(Address),
}

#[contracttype]
#[derive(Clone)]
pub struct UserInfo {
  pub address: Address,
  pub name: String,
  pub balance: i128,
}

pub struct StorageClient;

impl StorageClient {
  pub fn get_default_user_info(env: Env, user: Address) -> UserInfo {
    let name: String = user.to_string().into_val(&env);

    UserInfo {
      address: user.clone(),
      name,
      balance: 0,
    }
  }

  pub fn get_default_ownership(env: Env) -> Ownership {
    Ownership {
      token: env.current_contract_address(),
      owner: env.current_contract_address(),
      initialized: false,
    }
  }
}
