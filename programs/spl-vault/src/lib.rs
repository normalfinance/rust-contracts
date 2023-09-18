mod ins;
mod state;
mod utils;

use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Transfer};

use crate::ins::*;
use crate::state::*;
use crate::utils::*;

declare_id!("3xcvmiofhKuBLp7uJCxLafRkeemhx1EJBpYN7B6ZCR9D");

#[program]
pub mod spl_vault {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>, name: String) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        vault.authority = ctx.accounts.authority.key();
        vault.name = name;
        vault.bump = *ctx.bumps.get("vault").unwrap();
        vault.fee = 5000;
        vault.last_fee_collection = now();

        Ok(())
    }

    pub fn adjust_fee(ctx: Context<UpdateVault>, fee: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        vault.fee = fee;

        Ok(())
    }

    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        let user = &mut ctx.accounts.user;

        user.vault = ctx.accounts.vault.key();
        user.key = ctx.accounts.authority.key();
        user.assets = vec![];
        user.bump = *ctx.bumps.get("user").unwrap();

        Ok(())
    }

    pub fn fund(ctx: Context<Fund>, amount: u64) -> Result<()> {
        let user = &mut ctx.accounts.user;

        let mint = ctx.accounts.mint.key();

        let index = user.assets.iter().position(|asset| asset.mint == mint);
        if let Some(index) = index {
            user.assets[index].amount = user.assets[index].amount.checked_add(amount).unwrap();
        } else {
            user.assets.push(Asset { mint, amount });
        }

        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.funder_ata.to_account_info(),
                    to: ctx.accounts.vault_ata.to_account_info(),
                    authority: ctx.accounts.funder.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn drain(ctx: Context<Drain>, amount: u64) -> Result<()> {
        let user = &mut ctx.accounts.user;

        let mint = ctx.accounts.mint.key();

        let index = user
            .assets
            .iter()
            .position(|asset| asset.mint == mint)
            .unwrap();
        user.assets[index].amount = user.assets[index].amount.checked_sub(amount).unwrap();

        let vault = &mut ctx.accounts.vault;
        let bump = vault.bump;
        let name = vault.name.clone();
        let seeds = [b"vault".as_ref(), name.as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let fee = vault.fee;
        let last_fee_collection = vault.last_fee_collection;
        let fee_amount = get_prorated_fee(fee, last_fee_collection, amount);
        let withdraw_amount = amount.checked_sub(fee_amount).unwrap();
        msg!("fee: {:?}", fee_amount);
        msg!("withdraw amount: {:?}", withdraw_amount);

        let index = vault.fee_assets.iter().position(|asset| asset.mint == mint);
        if let Some(index) = index {
            vault.fee_assets[index].amount = vault.fee_assets[index]
                .amount
                .checked_add(fee_amount)
                .unwrap();
        } else {
            vault.fee_assets.push(Asset {
                mint,
                amount: fee_amount,
            });
        }

        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_ata.to_account_info(),
                    to: ctx.accounts.drainer_ata.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                signer,
            ),
            withdraw_amount,
        )?;

        Ok(())
    }

    pub fn collect_fee(ctx: Context<CollectFee>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let mint = ctx.accounts.mint.key();
        let index = vault.fee_assets.iter().position(|asset| asset.mint == mint).unwrap();

        let amount = vault.fee_assets[index].amount;
        vault.fee_assets[index].amount = 0;

        let bump = vault.bump;
        let name = vault.name.clone();
        let seeds = [b"vault".as_ref(), name.as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_ata.to_account_info(),
                    to: ctx.accounts.authority_ata.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        Ok(())
    }
}
