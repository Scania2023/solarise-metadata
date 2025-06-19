// package.json (at root of your GitHub repo)
{
  "name": "solarise-metadata",
  "version": "1.0.0",
  "type": "commonjs",
  "main": "register-metadata.js",
  "scripts": {
    "start": "node register-metadata.js"
  },
  "dependencies": {
    "@solana/web3.js": "^1.98.2",
    "@metaplex-foundation/mpl-token-metadata": "^3.4.0"
  }
}

// register-metadata.js (CommonJS)
const { Connection, clusterApiUrl, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
const { createCreateMetadataAccountV2Instruction } = require('@metaplex-foundation/mpl-token-metadata');
const fs = require('fs');
const os = require('os');
const path = require('path');

// 🔑 Load your wallet keypair from ~/.config/solana/id.json
const keypairPath = path.join(os.homedir(), '.config', 'solana', 'id.json');
const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath)))
);

// 🌐 Connect to Solana Mainnet-Beta
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

// 🪙 Your token mint address
const mint = new PublicKey('CU68aFbnwep54ZgixM8Ffs6SjCyqsPGoTeoeJhPrt9vM');

// 📑 Metaplex Token Metadata program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

// 📦 Public URI for your metadata JSON
const metadataUri = 'https://raw.githubusercontent.com/Scania2023/solarise-metadata/main/solarise.json';

// 📌 Derive metadata PDA
const [metadataPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from('metadata'),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    mint.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID
);

// 📝 Create metadata instruction (V2)
const instruction = createCreateMetadataAccountV2Instruction(
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
      uri: metadataUri,
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
  }
);

// 🚀 Send transaction
(async () => {
  try {
    const tx = new Transaction().add(instruction);
    const txid = await sendAndConfirmTransaction(connection, tx, [wallet]);
    console.log('✅ Metadata registrado com sucesso!');
    console.log('🔗 Solscan:', `https://solscan.io/tx/${txid}`);
  } catch (error) {
    console.error('❌ Falha ao registrar metadata:', error);
  }
})();
