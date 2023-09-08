use crate::states::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
      init,
      payer = authority,
      space = Vault::LEN + 8,
      seeds = [
        b"vault".as_ref(),
        name.as_ref(),
      ],
      bump,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateVault<'info> {
    #[account(mut, address = vault.authority)]
    pub authority: Signer<'info>,

    #[account(
      mut,
      seeds = [
        b"vault".as_ref(),
        vault.name.as_ref(),
      ],
      bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
}


#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
      init,
      payer = authority,
      space = User::LEN + 8,
      seeds = [
        b"user".as_ref(),
        authority.key.as_ref(),
      ],
      bump,
    )]
    pub user: Account<'info, User>,

    pub system_program: Program<'info, System>,
}