const {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

const {
  createCreateMetadataAccountV2Instruction,
} = require('@metaplex-foundation/mpl-token-metadata');

const fs = require('fs');

// 🔗 Conectar na Mainnet
const connection = new Connection(clusterApiUrl('mainnet-beta'));

// 🔑 Sua wallet
const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync('/root/.config/solana/id.json')))
);

// 🪙 Mint Address do token
const mint = new PublicKey('CU68aFbnwep54ZgixM8Ffs6SjCyqsPGoTeoeJhPrt9vM');

// 🔗 Endereço do programa de metadata
const PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

// 🔧 Gerar PDA
const [metadataPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from('metadata'),
    PROGRAM_ID.toBuffer(),
    mint.toBuffer(),
  ],
  PROGRAM_ID
);

// 🚀 Transação
(async () => {
  const tx = new Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: mint,
        mintAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      },
      {
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
      }
    )
  );

  const txid = await sendAndConfirmTransaction(connection, tx, [wallet]);
  console.log('✅ Metadata registrado com sucesso!');
  console.log('🔗 TxID:', txid);
})();
