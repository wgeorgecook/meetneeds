package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
	"net/http"
	"time"
)

// startServer spins up an http listener for this service on the
// port and path specified
func startServer() {
	// define the new router, define paths, and handlers on the router
	router := mux.NewRouter().StrictSlash(true)
	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	origins := handlers.AllowedOrigins([]string{"https://wix.com", "https://baysideplacerville.com", "http://localhost:3000"})
	methods := handlers.AllowedMethods([]string{"POST", "DELETE", "GET", "PATCH", "UPDATE", "PUT"})
	buildHandler := http.FileServer(http.Dir("./frontend/build"))
	staticHandler := http.StripPrefix("/static/", http.FileServer(http.Dir("./frontend/build/static")))

	router.Handle("/", buildHandler)
	router.PathPrefix("/static/").Handler(staticHandler)
	router.HandleFunc("/api/create", createDocument)
	router.HandleFunc("/api/get", getDocument)
	router.HandleFunc("/api/getall", getAll)
	router.HandleFunc("/api/update", updateDocument)
	// create a new http server with a default timeout for incoming requests
	timeout := 15 * time.Second
	srv = &http.Server{
		Addr:              fmt.Sprintf(":%v", cfg.Port),
		Handler:           router,
		ReadTimeout:       timeout,
		ReadHeaderTimeout: timeout,
		WriteTimeout:      timeout,
		IdleTimeout:       timeout,
	}

	// start the server
	log.Info("New server started")
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%v", cfg.Port), handlers.CORS(headers, origins, methods)(router)))
}
