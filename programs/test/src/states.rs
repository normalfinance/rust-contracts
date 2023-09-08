use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

#[account]
pub struct Vault {
    pub name: String,

    pub authority: Pubkey,

    pub token_mint: Pubkey,

    pub total_reward_amount: u64,

    pub total_staked_amount: u64,

    pub daily_payout_amount: u64,

    pub bump: u8,

    pub reward_bump: u8,
}

impl Vault {
    pub const LEN: usize = std::mem::size_of::<Vault>();
}

#[account]
pub struct User {
    pub key: Pubkey,

    pub staked_amount: u64,

    pub last_update_time: u64,

    pub earned_amount: u64,

    pub bump: u8,
}

impl User {
    pub const LEN: usize = std::mem::size_of::<User>();

    pub fn update(&mut self, vault: &mut Account<Vault>) {
        let now: u64 = Clock::get().unwrap().unix_timestamp.try_into().unwrap();
        let staked_seconds = now.checked_sub(self.last_update_time).unwrap();
        self.last_update_time = now;

        let daily_payout_amount = vault.daily_payout_amount;
        let reward_earned: f64 = (daily_payout_amount as f64) * (staked_seconds as f64)
            / 86400f64
            / (vault.total_staked_amount as f64)
            * (self.staked_amount as f64);
        self.earned_amount = self
            .earned_amount
            .checked_add(reward_earned as u64)
            .unwrap();
    }
}
