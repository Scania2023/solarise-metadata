const {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} = require('@solana/web3.js');

const {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID
} = require('@metaplex-foundation/mpl-token-metadata');

const fs = require('fs');

// 🚀 Conexão com a Solana Mainnet
const connection = new Connection(clusterApiUrl('mainnet-beta'));

// 🔑 Sua wallet (carregar do arquivo id.json)
const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync('/root/.config/solana/id.json')))
);

// 🪙 Mint Address do seu token
const mint = new PublicKey('CU68aFbnwep54ZgixM8Ffs6SjCyqsPGoTeoeJhPrt9vM');

// 🔗 Gerar PDA dos Metadados
const [metadataPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from('metadata'),
    PROGRAM_ID.toBuffer(),
    mint.toBuffer(),
  ],
  PROGRAM_ID
);

// 🎯 Criar e enviar a transação
(async () => {
  const tx = new Transaction().add(
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: mint,
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
                address: 46Kk42EDRCJFPC4kygRiA62QSyrR8zmDp6UfEzFqsKEB,
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
  console.log('✅ Metadados registrados com sucesso!');
  console.log('🔗 TxID:', txid);
})();
