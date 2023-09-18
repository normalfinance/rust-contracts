use anchor_lang::{prelude::*, solana_program::clock};

pub const ONE_YAER: u64 = 31556952;
pub const TEN_THOUSAND: u64 = 10000;

pub fn now() -> u64 {
    clock::Clock::get()
        .unwrap()
        .unix_timestamp
        .try_into()
        .unwrap()
}

pub fn get_prorated_fee(fee: u64, last_fee_collection: u64, amount: u64) -> u64 {
    let time_delta = now().checked_sub(last_fee_collection).unwrap();
    let prorated_fee = amount * fee * time_delta / ONE_YAER / TEN_THOUSAND;
    prorated_fee
}