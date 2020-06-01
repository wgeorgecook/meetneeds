package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
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

	// set the id on this need to send the email
	oid := document.InsertedID.(primitive.ObjectID)
	n.ID = oid.String()

	w.Write([]byte(fmt.Sprintf("document created: %+v", document)))
	sendEmail(n, "new")
}

// getDocument expects an id as a query param on an incoming request. It will search the DB for that _id and return
// the document that it finds (if any).
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
// getAll returns literally every record in the database, after filtering out any contact information and making sure
// users who wish to be anonymous are respected with regard to the front end. This way, the front end never actually
// receives any sensitive information. Nonetheless, it needs to be paginated.
func getAll(w http.ResponseWriter, r *http.Request) {
	log.Info("Incoming getAll request")
	defer r.Body.Close()
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	collection := mongoClient.Database(cfg.Database).Collection(cfg.Collection)

	// check if an admin is authenticated on this request
	// grab the token on the incoming request
	log.Infof("All headers: %+v", r.Header)
	authHeader := r.Header.Get("Authorization")
	var admin bool
	if authHeader != "" {
		// there's an authorization header on this request in the form "Bearer idtoken" so we strip everything away
		// but the token
		log.Info("Auth header found on this request")
		log.Infof("Authorization header: %s", authHeader)

		// this is a little tricky. We strip out "Bearer", but are left with " tokenString", so we get an array
		// ["Bearer", " tokenString"], so we take the [1] element, " tokenString", and then take everything past the
		// 0th element (which is an empty character"
		tokenString := strings.Split(authHeader, "Bearer")[1][1:]

		// now to make sure this person is who they say they are AND belong to our organization, we verify it with
		// Google
		admin = verifyToken(tokenString)
	} else {
		// no attempt to authorize
		log.Info("No auth header found on this request")
		admin = false
	}

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
	var find bson.M
	if admin {
		// return everything if this is an admin
		find = bson.M{}
	} else {
		// otherwise return ONLY unmet needs that are approved
		find = bson.M{"isMet": false, "approved": true}
	}
	cursor, err := collection.Find(ctx, find)
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
		// filter out senstive info on network request for non-admin requests
		if !admin {
			result.NeedingUser.Phone = ""
			result.NeedingUser.Email = ""
			if result.NeedingUser.Anonymous {
				result.NeedingUser.Name = "Anonymous"
			}
			result.MeetingUser = user{}
		}

		needs = append(needs, result)
	}
	if err := cursor.Err(); err != nil {
		log.Error(err)
		return
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

	// make sure this is off for prod
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")

	_, err = w.Write(jsonData)
	if err != nil {
		log.Errorf("error in writing to response: %+v", err)
	}
}

// updateDocument is called when a meeting user completes the meet a need form and submits it. It expects an id as a
// query param on the request and looks up the corresponding document in Mongo. It builds an update filter and will
// apply that update with the meeting user's details and sets the isMet field on this need to true.
func updateDocument(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	collection := mongoClient.Database(cfg.Database).Collection(cfg.Collection)

	id := r.URL.Query()["id"][0]

	// check if an admin is authenticated on this request
	// grab the token on the incoming request
	log.Infof("All headers: %+v", r.Header)
	authHeader := r.Header.Get("Authorization")
	var admin bool
	if authHeader != "" {
		// there's an authorization header on this request in the form "Bearer idtoken" so we strip everything away
		// but the token
		log.Info("Auth header found on this request")
		log.Infof("Authorization header: %s", authHeader)

		// this is a little tricky. We strip out "Bearer", but are left with " tokenString", so we get an array
		// ["Bearer", " tokenString"], so we take the [1] element, " tokenString", and then take everything past the
		// 0th element (which is an empty character"
		tokenString := strings.Split(authHeader, "Bearer")[1][1:]

		// now to make sure this person is who they say they are AND belong to our organization, we verify it with
		// Google
		admin = verifyToken(tokenString)
	} else {
		// no attempt to authorize
		log.Info("No auth header found on this request")
		admin = false
	}

	// check if this is a change in approval status
	approveChange := false
	approval := r.URL.Query()["approveChange"]
	if len(approval) > 0 {
		log.Info("This is an approval change")
		log.Infof("Approval change: %v", approval[0])
		approveChange = true
	}

	// now we check and make sure that if this person is trying to update an approval that they are an admin
	// if they are not an admin and are trying to change approval status, we reject them with an unauthorized
	if approveChange && !admin {
		w.WriteHeader(401)
		w.Write([]byte("You are not authorized to make this request"))
		return
	}


	// create an OID bson primitive based on the ID that comes in on the request
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Errorf("error in updateRecord: %v", err)
		w.Write([]byte(err.Error()))
		return
	}

	log.Infof("Looking for record with this id: %v", oid)


	// unmarshal the incoming body into our need struct
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

	// updated based on either meeting a need or setting approved / not approved
	var update primitive.M
	if approveChange {
		update = bson.M{"$set": bson.M{"approved": n.Approved}}
	} else {
		update = bson.M{"$set": bson.M{"isMet": true, "meetingUser": n.MeetingUser}}
	}

	log.Info(fmt.Sprintf("Updating record %v with %+v", n.ID, update))
	// find and update the document in Mongo, ignore the return (for now)
	_ = collection.FindOneAndUpdate(context.Background(), filter, update)

	// send the returned document to the email channel if this isn't just an approval change
	if !approveChange {
		metNeedChannel <- id
	}

	// I'm just going to ignore this error and int
	w.WriteHeader(200)

	// make sure this is off for prod
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")

	_, _ = w.Write([]byte("ok"))
}
