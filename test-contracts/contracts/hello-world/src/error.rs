use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
  AlreadyInitialized = 1,
  NotInitialized = 2,
  NotOwner = 3,
  MismatchingAsset = 4,
}
