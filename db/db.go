package db

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func getSupabaseURL() string {
	return os.Getenv("SUPABASE_URL")
}

func getSupabaseKey() string {
	return os.Getenv("SUPABASE_KEY")
}

// INSERT
func Insert(table string, data interface{}) ([]byte, error) {

  url := fmt.Sprintf("%s/rest/v1/%s", getSupabaseURL(), table)

  body, _ := json.Marshal(data)

  req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
  if err != nil {
    return nil, err
  }

  req.Header.Set("Content-Type", "application/json")
  req.Header.Set("apikey", getSupabaseKey())
  req.Header.Set("Authorization", "Bearer "+getSupabaseKey())
  req.Header.Set("Prefer", "return=representation")

  client := &http.Client{}
  res, err := client.Do(req)
  if err != nil {
    return nil, err
  }
  defer res.Body.Close()

  if res.StatusCode < 200 || res.StatusCode >= 300 {
    return nil, fmt.Errorf("supabase insert failed with status: %d", res.StatusCode)
  }

  return io.ReadAll(res.Body)
}

// SELECT
func Select(table string, filter string) ([]byte, error) {

  url := fmt.Sprintf("%s/rest/v1/%s", getSupabaseURL(), table)

  if filter != "" {
    url += "?" + filter
  }

  req, err := http.NewRequest("GET", url, nil)
  if err != nil {
    return nil, err
  }

  req.Header.Set("apikey", getSupabaseKey())
  req.Header.Set("Authorization", "Bearer "+getSupabaseKey())

  client := &http.Client{}
  res, err := client.Do(req)
  if err != nil {
    return nil, err
  }
  defer res.Body.Close()

  if res.StatusCode < 200 || res.StatusCode >= 300 {
    return nil, fmt.Errorf("supabase select failed with status: %d", res.StatusCode)
  }

  return io.ReadAll(res.Body)
}
