package contracts

import (
	"crypto/ecdsa"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
	"os"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// AfyaChain represents the NFT contract for patient records
type AfyaChain struct {
	client          *ethclient.Client
	contractAddress common.Address
	privateKey      *ecdsa.PrivateKey
	chainID         *big.Int
}

// NFT metadata structure for patient records
type RecordMetadata struct {
	PatientID   int    `json:"patient_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	RecordType  string `json:"record_type"`
	DateOfEvent string `json:"date_of_event"`
	Hash        string `json:"hash"`
}

// NewContracts initializes the Ethereum client and contract connection
func NewContracts() (*AfyaChain, error) {
	rpcURL := os.Getenv("ETHEREUM_RPC_URL")
	privateKeyHex := os.Getenv("ETHEREUM_PRIVATE_KEY")
	contractAddr := os.Getenv("ETHEREUM_CONTRACT_ADDRESS")
	chainIDStr := os.Getenv("ETHEREUM_CHAIN_ID")

	if rpcURL == "" || privateKeyHex == "" || contractAddr == "" || chainIDStr == "" {
		return &AfyaChain{}, fmt.Errorf("missing Ethereum configuration in environment variables")
	}

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return &AfyaChain{}, fmt.Errorf("failed to connect to Ethereum client: %v", err)
	}

	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return &AfyaChain{}, fmt.Errorf("failed to parse private key: %v", err)
	}

	chainID, success := big.NewInt(0).SetString(chainIDStr, 10)
	if !success {
		return &AfyaChain{}, fmt.Errorf("failed to parse chain ID")
	}

	return &AfyaChain{
		client:          client,
		contractAddress: common.HexToAddress(contractAddr),
		privateKey:      privateKey,
		chainID:         chainID,
	}, nil
}

// GenerateTokenID creates a unique token ID based on record data
func (a *AfyaChain) GenerateTokenID(patientID int, title, dateOfEvent string) (string, error) {
	data := fmt.Sprintf("%d:%s:%s", patientID, title, dateOfEvent)
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])[:16], nil
}

// MintNFT mints a new NFT for a patient record on Ethereum blockchain
func (a *AfyaChain) MintNFT(patientID int, title, description, recordType, dateOfEvent string) (string, string, error) {
	// Generate unique token ID
	tokenID, err := a.GenerateTokenID(patientID, title, dateOfEvent)
	if err != nil {
		return "", "", err
	}

	// In a real implementation, this would:
	// 1. Upload metadata to IPFS
	// 2. Get the IPFS URI
	// 3. Call the smart contract's mint function
	// For now, we simulate the process

	// Simulate transaction hash
	txHash := fmt.Sprintf("0x%s", tokenID)

	return tokenID, txHash, nil
}

// GetNFTInfo retrieves NFT information by token ID
func (a *AfyaChain) GetNFTInfo(tokenID string) (RecordMetadata, error) {
	// In a real implementation, this would query the smart contract
	return RecordMetadata{}, nil
}

// ValidateConnection checks if the Ethereum connection is valid
func (a *AfyaChain) ValidateConnection() error {
	if a.client == nil {
		return fmt.Errorf("Ethereum client not initialized")
	}
	_, err := a.client.NetworkID(nil)
	return err
}

// GetAuthTransactor returns an auth transactor for contract calls
func (a *AfyaChain) GetAuthTransactor() (*bind.TransactOpts, error) {
	publicKey := a.privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("failed to cast public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err := a.client.PendingNonceAt(nil, fromAddress)
	if err != nil {
		return nil, err
	}

	gasPrice, err := a.client.SuggestGasPrice(nil)
	if err != nil {
		return nil, err
	}

	auth, err := bind.NewKeyedTransactorWithChainID(a.privateKey, a.chainID)
	if err != nil {
		return nil, err
	}

	auth.Nonce = big.NewInt(0).SetUint64(nonce)
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(300000)
	auth.GasPrice = gasPrice

	return auth, nil
}