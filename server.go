package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"time"
)

// startServer spins up an http listener for this service on the
// port and path specified
func startServer() {
	// define the new router, define paths, and handlers on the router
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/get", getDocument)
	router.HandleFunc("/getall", getAll)
	router.HandleFunc("/update", updateDocument)

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
	log.Fatal(srv.ListenAndServe())
}
