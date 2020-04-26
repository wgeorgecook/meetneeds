package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// initMongo accepts a connectionURI string and returns a Mongo client for use in the global program.
func initMongo(connectionURI string) *mongo.Client {
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(connectionURI))

	if err != nil {
		log.Fatal("Could not connect to Mongo")
	}

	return client
}

// createDocument inserts a new need into our database once a needing user fills out the new need form and submits it
func createDocument(w http.ResponseWriter, r *http.Request) {
	log.Info("Incoming create request")
	defer r.Body.Close()

	// unmarshal the incoming request body into our needs struct
	bodyBytes, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Infof("error in createDocument: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	var n need
	err = json.Unmarshal(bodyBytes, &n)
	if err != nil {
		log.Infof("error in createDocument: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	// add our need to the database
	collection := mongoClient.Database(cfg.Database).Collection(cfg.Collection)
	document, err := collection.InsertOne(context.Background(), n)
	if err != nil {
		log.Infof("error in createDocument: %v")
		w.Write([]byte(err.Error()))
		return
	}

	w.Write([]byte(fmt.Sprintf("document created: %+v", document)))
}

// getDocument expects an id as a query param on an incoming request. It will search the DB for that _id and return
// the document that it finds (if any).
func getDocument(w http.ResponseWriter, r *http.Request) {
	// CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
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
// getAll returns literally every record in the database, after filtering out any contact information and making sure
// users who wish to be anonymous are respected with regard to the front end. This way, the front end never actually
// receives any sensitive information. Nonetheless, it needs to be paginated.
func getAll(w http.ResponseWriter, r *http.Request) {
	// CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	defer r.Body.Close()
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	collection := mongoClient.Database(cfg.Database).Collection(cfg.Collection)

	// Get the Page Number
	var pageNumber int
	var err error
	if len(r.URL.Query()["pagenumber"]) > 0 {
		pageNumber, err = strconv.Atoi(r.URL.Query()["pagenumber"][0])

		if err != nil || pageNumber < 1 {
			pageNumber = 1
		}
	} else {
		pageNumber = 1
	}

	log.Infof("PageNumber: %v", pageNumber)
	// Page number has been accepted - still need to return proper data: https://stackoverflow.com/questions/5525304/how-to-do-pagination-using-range-queries-in-mongodb

	// find and unmarshal the document to a struct we can return
	var needs []need
	cursor, err := collection.Find(ctx, bson.M{"isMet": false, "approved": true})
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
		// filter out senstive info on network request
		result.NeedingUser.Phone = ""
		result.NeedingUser.Email = ""
		if result.NeedingUser.Anonymous {
			result.NeedingUser.Name = "Anonymous"
		}
		result.MeetingUser = user{}
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

// updateDocument is called when a meeting user completes the meet a need form and submits it. It expects an id as a
// query param on the request and looks up the corresponding document in Mongo. It builds an update filter and will
// apply that update with the meeting user's details and sets the isMet field on this need to true.
func updateDocument(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	collection := mongoClient.Database(cfg.Database).Collection(cfg.Collection)

	id := r.URL.Query()["id"][0]

	// create an OID bson primitive based on the ID that comes in on the request
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Errorf("error in updateRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}


	// unmarshal the incoming body into our user struct
	var n need
	filter := bson.M{"_id": oid}

	bodyBytes, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Errorf("error in updateRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	if err = json.Unmarshal(bodyBytes, &n); err != nil {
		log.Errorf("error in updateRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	log.Infof("Will update with this: %+v", n)
	update := bson.M{"$set": bson.M{"isMet": true, "meetingUser": n.MeetingUser}}

	log.Info(fmt.Sprintf("Updating record %v with %+v", n.ID, update))
	// find and update the document in Mongo, ignore the return (for now)
	_ = collection.FindOneAndUpdate(context.Background(), filter, update)

	// send the returned document to the email channel
	metNeedChannel <- id

	// I'm just going to ignore this error and int
	w.WriteHeader(200)
	_, _ = w.Write([]byte("ok"))
}
