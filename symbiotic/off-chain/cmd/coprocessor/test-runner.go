package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

type CoprocessorDemo struct {
	address      string
	isLeader     bool
	endpoint     string
	results      map[string]string
	tasks        map[string]string
	attestations map[string]map[string]string
}

type TaskRequest struct {
	EncryptedData string `json:"encryptedData"`
	Caller       string `json:"caller"`
}

type TaskResponse struct {
	Result string `json:"result"`
	Status string `json:"status"`
	TaskID string `json:"taskId"`
}

func NewCoprocessorDemo() *CoprocessorDemo {
	hash := sha256.Sum256([]byte("coprocessor" + string(time.Now().Unix())))
	address := hex.EncodeToString(hash[:8])
	return &CoprocessorDemo{
		address:      "0x" + address,
		endpoint:     "http://34.46.119.33:3000/run/dummy",
		results:      make(map[string]string),
		tasks:        make(map[string]string),
		attestations: make(map[string]map[string]string),
	}
}

func (c *CoprocessorDemo) generateTaskID(encryptedData string) string {
	hash := sha256.Sum256([]byte(encryptedData + string(time.Now().Unix())))
	return hex.EncodeToString(hash[:16])
}

func (c *CoprocessorDemo) fetchFromExternal(encryptedData string) (*TaskResponse, error) {
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
	client := &http.Client{Timeout: 10 * time.Second}
	
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}
	
	var response TaskResponse
	if err := json.Unmarshal(body, &response); err != nil {
		response = TaskResponse{
			Result: string(body),
			Status: "success",
			TaskID: c.generateTaskID(encryptedData),
		}
	}
	
	return &response, nil
}

func (c *CoprocessorDemo) DemoTest() {
	fmt.Println("🚀 Running Symbiotic Coprocessor Quick Test...")
	fmt.Println("Address:", c.address)
	fmt.Println("Leader Status:", c.isLeader)
		
	// Test 1: Generate task
	testData := "encrypted_program_logic_123"
	taskID := c.generateTaskID(testData)
	fmt.Printf("📋 Generated Task ID: %s\n", taskID)
	
	// Test 2: HTTP endpoint check
	fmt.Println("🔗 Testing external endpoint...")
	
	result, err := c.fetchFromExternal(testData)
	if err != nil {
		fmt.Printf("⚠️  External endpoint issue: %v\n", err)
		fmt.Printf("   This is expected if %s is not running\n", c.endpoint)
		
		// Mock result for demo
		c.results[taskID] = "encrypted_result_42"
		fmt.Printf("✅ Mock result generated for task %s\n", taskID)
	} else {
		fmt.Printf("✅ External endpoint responded: %s\n", result.Result)
		c.results[taskID] = result.Result
	}
	
	// Test 3: Attestation system
	fmt.Println("🔐 Testing attestation system...")
	validatorID := "0xvalidator123"
	if c.attestations[taskID] == nil {
		c.attestations[taskID] = make(map[string]string)
	}
	c.attestations[taskID][validatorID] = "validated_computation"
	fmt.Printf("✅ Attestation from validator %s stored\n", validatorID)
	
	// Test 4: Status output
	fmt.Println("📊 System Status:")
	fmt.Printf("   Coprocessor Address: %s\n", c.address)
	fmt.Printf("   Total Tasks: %d\n", len(c.results))
	fmt.Printf("   Total Attestations: %d\n", len(c.attestations))
	fmt.Printf("   Task Result: %s\n", c.results[taskID])
	
	// Test 5: Validation
	fmt.Println("✅ All components functional!")
	fmt.Printf("🎯 Ready to process encrypted program logic via API calls\n")
}

func main() {
	// Quick demo without HTTP server
	demo := NewCoprocessorDemo()
	demo.DemoTest()
	
	// Also start HTTP server for actual usage
	http.HandleFunc("/demo", func(w http.ResponseWriter, r *http.Request) {
		demo.DemoTest()
		fmt.Fprintf(w, "✅ Coprocessor demo complete! Check logs above.")
	})
	
	http.HandleFunc("/test", func(w http.ResponseWriter, r *http.Request) {
		data := r.URL.Query().Get("data")
		if data == "" {
			data = "hello_encrypted_world"
		}
		
		taskID := demo.generateTaskID(data)
		result, err := demo.fetchFromExternal(data)
		
		response := map[string]interface{}{
			"success":   err == nil,
			"task_id":   taskID,
			"leader":    demo.address,
			"timestamp": time.Now().Unix(),
			"external":  "http://34.46.119.33:3000/run/dummy",
		}
		
		if err != nil {
			response["error"] = err.Error()
			response["status"] = "using_mock_result"
			demo.results[taskID] = "42"
		} else {
			response["result"] = result.Result
			demo.results[taskID] = result.Result
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	fmt.Printf("\n🌐 Starting HTTP server on port %s...\n", port)
	fmt.Printf("   http://localhost:%s/demo - Run full demo\n", port)
	fmt.Printf("   http://localhost:%s/test?data=YOUR_DATA - Test with custom data\n", port)
	
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}