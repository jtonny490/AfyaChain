package utils

import (
	"context"
	"crypto/ecdsa"
	"crypto/sha256"
	"encoding/hex"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"

	"afyachain/backend/contracts" // The generated abigen package
)

var (
	Client       *ethclient.Client
	AfyaContract *contracts.Contracts
	Auth         *bind.TransactOpts
)

// InitBlockchain connects to Celo Alfajores Testnet
func InitBlockchain() {
	var err error
	// Celo Alfajores RPC (You can swap this with Polygon Amoy: https://rpc-amoy.polygon.technology)
	rpcURL := "https://alfajores-forno.celo-testnet.org"
	Client, err = ethclient.Dial(rpcURL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}

	// WARNING: Use environment variables (.env) for private keys in production!
	privateKeyHex := "YOUR_PRIVATE_KEY_HERE" 
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		log.Fatalf("Error loading private key: %v", err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("Error casting public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err := Client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		log.Fatal(err)
	}

	chainID, err := Client.ChainID(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	Auth, err = bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatal(err)
	}
	Auth.Nonce = big.NewInt(int64(nonce))
	Auth.Value = big.NewInt(0)      // in wei
	Auth.GasLimit = uint64(3000000) // in units
	Auth.GasPrice, _ = Client.SuggestGasPrice(context.Background())

	// Address of the deployed AfyaChain.sol contract
	contractAddress := common.HexToAddress("YOUR_DEPLOYED_CONTRACT_ADDRESS")
	AfyaContract, err = contracts.NewContracts(contractAddress, Client)
	if err != nil {
		log.Fatalf("Failed to instantiate contract: %v", err)
	}

	log.Println("Successfully connected to EVM Network!")
}

// GenerateLocalHash creates a SHA-256 hash of the medical data (Off-chain)
func HashPassword(data string) string {
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

// LogRecordToChain writes the metadata hash to the Smart Contract (On-chain Immutability)
func LogRecordToChain(tokenId int64, dataHash string, storageURI string) (string, error) {
	tx, err := AfyaContract.LogRecord(Auth, big.NewInt(tokenId), dataHash, storageURI)
	if err != nil {
		return "", err
	}
	return tx.Hash().Hex(), nil // Returns the Blockchain Transaction Hash
}