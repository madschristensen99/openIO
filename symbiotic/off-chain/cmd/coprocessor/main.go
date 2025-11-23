package main

import (
	"bytes"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/big"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type Coprocessor struct {
	privateKey  *rsa.PrivateKey
	address     string
	isLeader    bool
	endpoint    string
	validators  map[string]bool
	results     map[string]string
	tasks       map[string]string
	attestations map[string]map[string]string
	mu          sync.RWMutex
	currentRound uint64
	wg          sync.WaitGroup
}

type TaskRequest struct {
	EncryptedData string `json:"encryptedData"`
	TaskID       string `json:"taskId"`
	Caller       string `json:"caller"`
}

type TaskResponse struct {
	Result   string `json:"result"`
	Status   string `json:"status"`
	TaskID   string `json:"taskId"`
}

type AttestationData struct {
	TaskID    string `json:"taskId"`
	Validator string `json:"validator"`
	Attestation string `json:"attestation"`
	Timestamp int64  `json:"timestamp"`
	Signature string `json:"signature"`
}

func NewCoprocessor() *Coprocessor {
	privateKey, _ := rsa.GenerateKey(rand.Reader, 2048)
	return &Coprocessor{
		privateKey: privateKey,
		address:    fmt.Sprintf("0x%x", sha256.Sum256(privateKey.PublicKey.N.Bytes())),
		endpoint:   "http://34.46.119.33:3000/run/dummy",
		validators: make(map[string]bool),
		results:    make(map[string]string),
		tasks:      make(map[string]string),
		attestations: make(map[string]map[string]string),
		currentRound: uint64(time.Now().Unix() / 1000),
	}
}

func (c *Coprocessor) electLeader() string {
	c.mu.Lock()
	defer c.mu.Unlock()
	
	newRound := uint64(time.Now().Unix() / 100)
	if newRound > c.currentRound {
		c.currentRound = newRound
		
		seed := new(big.Int).SetBytes(sha256.Sum256([]byte(fmt.Sprintf("%d", newRound))).Bytes())
		
		validatorList := make([]string, 0, len(c.validators))
		for addr := range c.validators {
			validatorList = append(validatorList, addr)
		}
		
		if len(validatorList) > 0 {
			leaderIndex := seed.Int64() % int64(len(validatorList))
			leader := validatorList[leaderIndex]
			c.isLeader = leader == c.address
			
			fmt.Printf("Elected new leader for round %d: %s (me: %v)\n", newRound, leader, c.isLeader)
			return leader
		}
	}
	return c.address
}

func (c *Coprocessor) fetchFromExternal(encryptedData string) (*TaskResponse, error) {
	payload := map[string]interface{}{
		"encryptedData": encryptedData,
		"leader":        c.address,
		"timestamp":     time.Now().Unix(),
		"type":          "encrypted_execution",
	}
	
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payload: %w", err)
	}
	
	req, err := http.NewRequest("POST", c.endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 30 * time.Second}
	
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("external endpoint returned status %d: %s", resp.StatusCode, string(body))
	}
	
	var response TaskResponse
	if err := json.Unmarshal(body, &response); err != nil {
		// Fallback: create response from raw body
		response = TaskResponse{
			Result:   string(body),
			Status:   "success",
			TaskID:   generateTaskID(encryptedData),
		}
	}
	
	return &response, nil
}

func generateTaskID(encryptedData string) string {
	return hex.EncodeToString(sha256.Sum256([]byte(encryptedData + strconv.FormatInt(time.Now().Unix(), 10))).Bytes())
}

func (c *Coprocessor) signAttestation(taskID string, attestation string) string {
	hash := sha256.Sum256([]byte(taskID + attestation + c.address))
	return hex.EncodeToString(hash[:]) // Simplified signature
}

func (c *Coprocessor) verifyAttestation(taskID string, attestation string, signature string) bool {
	expected := c.signAttestation(taskID, attestation)
	return expected == signature
}

func (c *Coprocessor) StartHTTPHandlers() {
	http.HandleFunc("/tasks/process", c.handleProcessTask)
	http.HandleFunc("/attestations/submit", c.handleSubmitAttestation)
	http.HandleFunc("/results/get", c.handleGetResult)
	http.HandleFunc("/leader/current", c.handleGetLeader)
	http.HandleFunc("/status", c.handleStatus)
	
	fmt.Println("Coprocessor HTTP API starting on :8080")
	
	go func() {
		if err := http.ListenAndServe(":8080", nil); err != nil {
			log.Fatal(err)
		}
	}()
}

func (c *Coprocessor) handleProcessTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var req TaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Leader election check
	leader := c.electLeader()
	
	if c.isLeader {
		c.wg.Add(1)
		go func() {
			defer c.wg.Done()
			result, err := c.fetchFromExternal(req.EncryptedData)
			if err != nil {
				log.Printf("Error fetching external result: %v", err)
				return
			}
			
			c.mu.Lock()
			c.results[req.TaskID] = result.Result
			c.mu.Unlock()
			
			c.broadcastResult(req.TaskID, result.Result)
		}()
	}
	
	response := map[string]interface{}{
		"taskId": req.TaskID,
		"leader": leader,
		"isLeader": c.isLeader,
		"status": "submitted",
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (c *Coprocessor) handleSubmitAttestation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var att AttestationData
	if err := json.NewDecoder(r.Body).Decode(&att); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	if !c.validators[att.Validator] {
		http.Error(w, "Invalid validator", http.StatusUnauthorized)
		return
	}
	
	c.mu.Lock()
	if c.attestations[att.TaskID] == nil {
		c.attestations[att.TaskID] = make(map[string]string)
	}
	c.attestations[att.TaskID][att.Validator] = att.Attestation
	c.mu.Unlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "attestation submitted"})
}

func (c *Coprocessor) handleGetResult(w http.ResponseWriter, r *http.Request) {
	taskID := r.URL.Query().Get("taskId")
	if taskID == "" {
		http.Error(w, "taskId parameter required", http.StatusBadRequest)
		return
	}
	
	c.mu.RLock()
	result, exists := c.results[taskID]
	c.mu.RUnlock()
	
	response := map[string]string{
		"taskId": taskID,
		"result": result,
		"status": "pending",
	}
	
	if exists {
		response["status"] = "completed"
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (c *Coprocessor) handleGetLeader(w http.ResponseWriter, r *http.Request) {
	leader := c.electLeader()
	
	response := map[string]interface{}{
		"currentRound": c.currentRound,
		"leader":      leader,
		"me":          c.address,
		"isLeader":    c.isLeader,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (c *Coprocessor) handleStatus(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"address":      c.address,
		"isLeader":     c.isLeader,
		"currentRound": c.currentRound,
		"totalTasks":   len(c.results),
		"totalAttestations": len(c.attestations),
		"endpoint":     EXTERNAL_ENDPOINT,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (c *Coprocessor) broadcastResult(taskID, result string) {
	// In production, this would broadcast to other validators
	fmt.Printf("Broadcasting result for task %s: %s\n", taskID, result)
	
	// For demo, print validation info
	fmt.Printf("Leader %s computed result via external endpoint %s\n", c.address, c.endpoint)
	fmt.Printf("Validators can now attest to this result\n")
}

func (c *Coprocessor) startSync() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			c.electLeader()
			c.wg.Wait() // Ensure leader tasks are processed
		}
	}
}

func (c *Coprocessor) SetupValidators() {
	// Add some mock validators
	c.validators["0x3333"] = true
	c.validators["0x4444"] = true
	c.validators["0x5555"] = true
	
	// Simulate validators from the coprocessor itself
	c.validators[c.address] = true
}

const (
	EXTERNAL_ENDPOINT = "http://34.46.119.33:3000/run/dummy"
)

func main() {
	fmt.Println("Starting Symbiotic Coprocessor...")
	
	coprocessor := NewCoprocessor()
	coprocessor.SetupValidators()
	
	fmt.Printf("Coprocessor initialized with address: %s\n", coprocessor.address)
	fmt.Printf("External endpoint: %s\n", EXTERNAL_ENDPOINT)
	
	// Start HTTP API
	coprocessor.StartHTTPHandlers()
	
	// Start leader election cycle
	go coprocessor.startSync()
	
	// Keep running
	fmt.Println("HTTP API running on http://localhost:8080")
	fmt.Println("Endpoints:")
	fmt.Println("  POST /tasks/process")
	fmt.Println("  POST /attestations/submit")
	fmt.Println("  GET  /results/get?taskId=<id>")
	fmt.Println("  GET  /leader/current")
	fmt.Println("  GET  /status")
	
	go func() {
		// Test the external endpoint
		testResult, err := coprocessor.fetchFromExternal("test_encrypted_data")
		if err != nil {
			fmt.Printf("External endpoint test failed: %v\n", err)
		} else {
			fmt.Printf("External endpoint test successful: %s\n", testResult.Result)
		}
	}()
	
	select {}
}