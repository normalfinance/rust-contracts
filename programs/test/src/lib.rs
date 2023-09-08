mod instructions;
mod states;
use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Transfer};

use crate::instructions::*;

declare_id!("Biw2CakNyp53dXgUMZBY9d3Fsd49pvP2KUc4wP817PBE");
//pubkey BaHDFfpobGo2bJbJNzwLcVDRYaLTTL3XtM8kRe4savAu

#[program]
pub mod test {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        name: String,
        token_mint: Pubkey,
        daily_payout_amount: u64,
        reward_bump: u8,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        vault.name = name;
        vault.bump = *ctx.bumps.get("vault").unwrap();
        vault.token_mint = token_mint;
        vault.daily_payout_amount = daily_payout_amount;
        vault.authority = ctx.accounts.authority.key();
        vault.total_reward_amount = 0;
        vault.total_staked_amount = 0;
        vault.reward_bump = reward_bump;

        Ok(())
    }

    pub fn update_vault(
        ctx: Context<UpdateVault>,
        token_mint: Pubkey,
        daily_payout_amount: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        vault.token_mint = token_mint;
        vault.daily_payout_amount = daily_payout_amount;

        Ok(())
    }

    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        let user = &mut ctx.accounts.user;

        user.key = ctx.accounts.authority.key();
        user.bump = *ctx.bumps.get("user").unwrap();
        user.staked_amount = 0;
        user.earned_amount = 0;

        Ok(())
    }
}

