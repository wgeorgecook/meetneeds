package main

import (
	"context"
	"encoding/json"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"net/http"
	"strconv"
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

// TODO: paginate this
func getAll(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	collection := mongoClient.Database(cfg.Database).Collection(cfg.Collection)

	// find and unmarshal the document to a struct we can return
	var needs []need
	cursor, err := collection.Find(ctx, bson.D{})
	if err != nil {
		log.Errorf("error in getRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var result need
		err := cursor.Decode(&result)
		if err != nil {
			w.Write([]byte(err.Error()))
			return
		}
		needs = append(needs, result)
	}
	if err := cursor.Err(); err != nil {
		log.Fatal(err)
	}

	// marshal the struct to send over the wire
	jsonData, err := json.Marshal(needs)
	if err != nil {
		log.Errorf("error in getRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	// I'm just going to ignore this error and int
	log.Infof("Found record: %+v", needs)
	_, _ = w.Write(jsonData)
}

func updateDocument(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	collection := mongoClient.Database(cfg.Database).Collection(cfg.Collection)

	id := r.URL.Query()["id"][0]
	isMetString := r.URL.Query()["isMet"][0]

	isMet, err := strconv.ParseBool(isMetString)
	if err != nil {
		log.Errorf("error in updateRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}
	// create an OID bson primitive based on the ID that comes in on the request
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Errorf("error in updateRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	// find and unmarshal the document to a struct we can return
	var n need
	filter := bson.M{"_id": oid}
	update := bson.M{"$set": bson.M{"isMet": isMet}}

	log.Info(fmt.Sprintf("Updating record %v with isMet %v", n.ID, n.IsMet))
	err = collection.FindOneAndUpdate(context.Background(), filter, update).Decode(&n)
	if err != nil {
		log.Errorf("error in updateRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	// marshal the struct to send over the wire
	jsonData, err := json.Marshal(n)
	if err != nil {
		log.Errorf("error in getRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	// I'm just going to ignore this error and int
	log.Infof("Found record: %+v", n)
	_, _ = w.Write(jsonData)
}