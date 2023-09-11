use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, TokenAccount, Token},
    associated_token::AssociatedToken,
};

use crate::state::*;

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
pub struct CreateUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [
            b"vault".as_ref(),
            vault.name.as_ref(),
        ],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        init,
        payer = authority,
        space = User::LEN + 8,
        seeds = [
            b"user".as_ref(),
            vault.key().as_ref(),
            authority.key().as_ref(),
        ],
        bump,
    )]
    pub user: Account<'info, User>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Fund<'info> {
    #[account(mut, address = user.key)]
    pub funder: Signer<'info>,

    #[account(
        seeds = [
            b"vault".as_ref(),
            vault.name.as_ref(),
        ],
        bump = vault.bump,
        address = user.vault,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [
            b"user".as_ref(),
            vault.key().as_ref(),
            funder.key().as_ref(),
        ],
        bump = user.bump,
    )]
    pub user: Account<'info, User>,

    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = funder,
        associated_token::authority = vault,
        associated_token::mint = mint,
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::authority = funder,
        associated_token::mint = mint,
    )]
    pub funder_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Drain<'info> {
    #[account(mut, address = user.key)]
    pub drainer: Signer<'info>,

    #[account(
        seeds = [
            b"vault".as_ref(),
            vault.name.as_ref(),
        ],
        bump = vault.bump,
        address = user.vault,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [
            b"user".as_ref(),
            vault.key().as_ref(),
            drainer.key().as_ref(),
        ],
        bump = user.bump,
    )]
    pub user: Account<'info, User>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::authority = vault,
        associated_token::mint = mint,
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::authority = drainer,
        associated_token::mint = mint,
    )]
    pub drainer_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}