package main

import (
	"fmt"
	"net/http"
)

func main() {
	// 1. Tell Go to serve files inside the "static" folder for any route starting with /static/
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// 2. Serve your global app.js file directly from the root folder
	http.HandleFunc("/app.js", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "app.js")
	})

	// 3. Serve the HTML views
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})
	http.HandleFunc("/login.html", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "login.html")
	})
	http.HandleFunc("/home.html", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "home.html")
	})

	fmt.Println("Server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
