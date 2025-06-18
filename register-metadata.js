const {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

const {
  createCreateMetadataAccountV3Instruction,
  MPL_TOKEN_METADATA_PROGRAM_ID,
} = require('@metaplex-foundation/mpl-token-metadata');

const fs = require('fs');

// 🔗 Conexão com a Solana
const connection = new Connection(clusterApiUrl('mainnet-beta'));

// 🔑 Sua carteira
const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync('/root/.config/solana/id.json')))
);

// 🎯 Mint do Token (O endereço do seu token SPL)
const mint = new PublicKey('SEU_MINT_ADDRESS_AQUI');

// 🧠 PDA do Metadata
const [metadataPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from('metadata'),
    MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    mint.toBuffer(),
  ],
  MPL_TOKEN_METADATA_PROGRAM_ID
);

// 🚀 Cria e envia a transação
(async () => {
  const tx = new Transaction().add(
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint,
        mintAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: 'Solarise',
            symbol: 'SLRS',
            uri: 'https://raw.githubusercontent.com/Scania2023/solarise-metadata/main/solarise.json',
            sellerFeeBasisPoints: 0,
            creators: [
              {
                address: "46Kk42EDRCJFPC4kygRiA62QSyrR8zmDp6UfEzFqsKEB",
                verified: true,
                share: 100,
              },
            ],
            collection: null,
            uses: null,
          },
          isMutable: true,
        },
      }
    )
  );

  const txid = await sendAndConfirmTransaction(connection, tx, [wallet]);
  console.log('✅ Metadata registrado com sucesso!');
  console.log('🧾 TxID:', txid);
})();
