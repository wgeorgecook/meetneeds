package main

import (
	"context"
	"encoding/json"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"io/ioutil"
	"net/http"
	"time"
)

func initMongo(connectionURI string) *mongo.Client {
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(connectionURI))

	if err != nil {
		log.Fatal("Could not connect to Mongo")
	}

	return client
}

func getDocument(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	collection := mongoClient.Database(cfg.Database).Collection(cfg.Collection)

	id := r.URL.Query()["id"][0]
	// create an OID bson primitive based on the ID that comes in on the request
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Errorf("error in getRecord: %v", err)
	}

	// find and unmarshal the document to a struct we can return
	var data need
	filter := bson.M{"_id": oid}
	err = collection.FindOne(context.Background(), filter).Decode(&data)
	if err != nil {
		log.Errorf("error in getRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	// marshal the struct to send over the wire
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Errorf("error in getRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	// I'm just going to ignore this error and int
	log.Infof("Found record: %+v", data)
	_, _ = w.Write(jsonData)
}

func updateDocument(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	collection := mongoClient.Database(cfg.Database).Collection(cfg.Collection)

	id := r.URL.Query()["id"][0]
	// create an OID bson primitive based on the ID that comes in on the request
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Errorf("error in updateRecord: %v", err)
	}

	// make a request to the local getRecord endpoint to get the document we need to update
	resp, err := http.Get(fmt.Sprintf("http://127.0.0.1:%v?id=%v", cfg.Port, id))
	if err != nil {
		log.Errorf("error in updateRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	// unmarshal the response into our need struct
	respBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Errorf("error in updateRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	var n need
	err = json.Unmarshal(respBytes, &n)
	if err != nil {
		log.Errorf("error in updateRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	// find and unmarshal the document to a struct we can return
	var updateData need
	filter := bson.M{"_id": oid}
	update := bson.M{"$set": bson.M{"isMet": n.IsMet}}

	log.Info(fmt.Sprintf("Updating record %v with isMet %v", n.ID, n.IsMet))
	err = collection.FindOneAndUpdate(context.Background(), filter, update).Decode(&updateData)
	if err != nil {
		log.Errorf("error in updateRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	// marshal the struct to send over the wire
	jsonData, err := json.Marshal(updateData)
	if err != nil {
		log.Errorf("error in getRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	// I'm just going to ignore this error and int
	log.Infof("Found record: %+v", updateData)
	_, _ = w.Write(jsonData)
}