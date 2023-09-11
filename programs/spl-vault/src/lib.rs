mod ins;
mod state;

use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Transfer};

use crate::ins::*;
use crate::state::*;

declare_id!("46GUjqKJPkWfPeqccSjGBAyP2CWBpTSj29LSPpaxRQvN");

#[program]
pub mod spl_vault {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>, name: String) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        vault.name = name;
        vault.bump = *ctx.bumps.get("vault").unwrap();

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

        let vault = &ctx.accounts.vault;
        let bump = vault.bump;
        let name = vault.name.clone();
        let seeds = [b"vault".as_ref(), name.as_ref(), &[bump]];
        let signer = &[&seeds[..]];

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
            amount,
        )?;

        Ok(())
    }
}
