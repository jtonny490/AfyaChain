package utils

import (
	"context"
	"crypto/ecdsa"
	"log"
	"math/big"
	"os"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	// "afyachain/backend/contracts" // Uncomment once abigen output is ready
)

var (
	Client *ethclient.Client
	// AfyaContract *contracts.Contracts // Uncomment once contracts package exists
	Auth *bind.TransactOpts
)

// InitBlockchain connects to Celo Alfajores testnet.
// All sensitive values are read from environment variables — never hardcode keys.
func InitBlockchain() {
	var err error

	rpcURL := os.Getenv("BLOCKCHAIN_RPC_URL")
	if rpcURL == "" {
		rpcURL = "https://alfajores-forno.celo-testnet.org" // fallback for dev
	}

	Client, err = ethclient.Dial(rpcURL)
	if err != nil {
		log.Fatalf("Failed to connect to blockchain node: %v", err)
	}

	privateKeyHex := os.Getenv("BLOCKCHAIN_PRIVATE_KEY")
	if privateKeyHex == "" {
		log.Fatal("BLOCKCHAIN_PRIVATE_KEY environment variable not set")
	}

	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		log.Fatalf("Invalid private key: %v", err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("Failed to cast public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	nonce, err := Client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		log.Fatalf("Failed to get nonce: %v", err)
	}

	chainID, err := Client.ChainID(context.Background())
	if err != nil {
		log.Fatalf("Failed to get chain ID: %v", err)
	}

	Auth, err = bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatalf("Failed to create transactor: %v", err)
	}

	Auth.Nonce = big.NewInt(int64(nonce))
	Auth.Value = big.NewInt(0)
	Auth.GasLimit = uint64(3000000)
	Auth.GasPrice, _ = Client.SuggestGasPrice(context.Background())

	contractAddress := common.HexToAddress(os.Getenv("CONTRACT_ADDRESS"))
	if contractAddress == (common.Address{}) {
		log.Fatal("CONTRACT_ADDRESS environment variable not set")
	}

	// AfyaContract, err = contracts.NewContracts(contractAddress, Client)
	// if err != nil {
	// 	log.Fatalf("Failed to instantiate contract: %v", err)
	// }
	_ = contractAddress // remove this line once contracts package is ready

	log.Println("Blockchain connection established")
}

// LogRecordToChain writes a record hash and storage URI to the smart contract.
// tokenId: the patient's NFT token ID
// dataHash: SHA-256 hash of the medical record (from HashData)
// storageURI: IPFS CID or Supabase storage path
func LogRecordToChain(tokenId int64, dataHash string, storageURI string) (string, error) {
	// tx, err := AfyaContract.LogRecord(Auth, big.NewInt(tokenId), dataHash, storageURI)
	// if err != nil {
	// 	return "", err
	// }
	// return tx.Hash().Hex(), nil

	// Placeholder until contracts package is wired in by Dev 1
	log.Printf("LogRecordToChain called: tokenId=%d hash=%s uri=%s", tokenId, dataHash, storageURI)
	return "0x_placeholder_tx_hash", nil
}