import {
    Connection,
    clusterApiUrl,
    PublicKey,
    Keypair,
    Transaction,
    sendAndConfirmTransaction
} from '@solana/web3.js';

import {
    createCreateMetadataAccountV3Instruction,
    PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';

import * as fs from 'fs';

// ✅ Dados do Token
const mint = new PublicKey('2Ejd2eBp46PmYWLA5CpmHXFrsDEiWkvoNzf2Fadj9689');
const wallet = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync('/root/.config/solana/id.json')))
);

// ✅ Conexão
const connection = new Connection(clusterApiUrl('mainnet-beta'));

// ✅ Pega PDA do Metadata
const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
);

// ✅ Dados do Metadata
const metadataData = {
    name: "Solarise",
    symbol: "SLRS",
    uri: "https://arweave.net/coloque-seu-link-do-json-aqui",
    sellerFeeBasisPoints: 0,
    creators: [
        {
            address: wallet.publicKey,
            verified: true,
            share: 100,
        },
    ],
    collection: null,
    uses: null,
};

// ✅ Instrução de criação
const instruction = createCreateMetadataAccountV3Instruction(
    {
        metadata: metadataPDA,
        mint: mint,
        mintAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        updateAuthority: wallet.publicKey,
    },
    {
        createMetadataAccountArgsV3: {
            data: metadataData,
            isMutable: true,
            collectionDetails: null,
        },
    }
);

// ✅ Transação
const transaction = new Transaction().add(instruction);

(async () => {
    const tx = await sendAndConfirmTransaction(
        connection,
        transaction,
        [wallet]
    );

    console.log(`✅ Metadata criado com sucesso! Tx: https://explorer.solana.com/tx/${tx}?cluster=mainnet-beta`);
})();
