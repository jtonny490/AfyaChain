package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"afyachain/routes"
	"github.com/gin-gonic/gin"

)

var router *gin.Engine
var authToken string

// setup testing the server
func(){
	gin.SetMode(gin.TestMode)
	router = gin.Default()
	routes.SetupRouters(router)
}

//Helper: make request
func performRequest(method, path string, body []byte, token string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest(method, path, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	if token != ""{
		req.Header.Set("Authorization", token)
	}

	w:= httptest.NewRecorder()
	router.ServerHTTP(w, req)
	return w
}
