const {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} = require('@solana/web3.js');

const {
  createCreateMetadataAccountV3Instruction
} = require('@metaplex-foundation/mpl-token-metadata');

const fs = require('fs');

// ✅ Conexão
const connection = new Connection(clusterApiUrl('mainnet-beta'));

// ✅ Sua Wallet
const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync('/root/.config/solana/id.json')))
);

// ✅ Mint Address do Token
const mint = new PublicKey('CU68aFbnwep54ZgixM8Ffs6SjCyqsPGoTeoeJhPrt9vM');

// ✅ Programa de Metadados da Metaplex
const metadataProgramId = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// ✅ PDA do Metadados
const [metadataPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from('metadata'),
    metadataProgramId.toBuffer(),
    mint.toBuffer()
  ],
  metadataProgramId
);

// ✅ Criar e enviar a transação
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
                address: wallet.publicKey.toBase58(),
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
  console.log('🚀 TxID:', txid);
})();
