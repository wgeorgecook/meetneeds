package main

import (
	"fmt"
	"github.com/caarlos0/env/v6"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
	"net/http"
)


// type to hold environment variables
type config struct {
	Port           string `env:"PORT" envDefault:":8080"`
	ConnectionURI  string `env:"MONGO_URI"`
	Database       string `env:"DATABASE"`
	Collection     string `env:"COLLECTION"`
}

type need struct {
	ID   string `json:"_id,omitempty" bson:"_id,omitempty"`
	NeedingUser user `json:"needingUser" bson:"needingUser"`
	MeetingUser user `json:"meetingUser,omitempty" bson:"meetingUser,omitempty"`
	Need string `json:"need" bson:"need"`
	IsMet bool  `json:"isMet" bson:"isMet"`
}

type user struct {
	Name string `json:"name,omitempty" bson:"name,omitempty"`
	Phone string `json:"phone,omitempty" bson:"phone,omitempty"`
	Email string `json:"email,omitempty" bson:"email,omitempty"`
	Rationale string `json:"rationale,omitempty" bson:"rationale,omitempty"`
	Anonymous bool `json:"anon,omitempty" bson:"anon,omitempty"`
}

var srv *http.Server
var log *zap.SugaredLogger
var cfg config
var mongoClient *mongo.Client

func init() {
	// Configure logging
	logger, _ := zap.NewDevelopment()
	defer logger.Sync() // flushes buffer, if any
	log = logger.Sugar()

	// Load environment variables from .env file
	log.Infow("Loading env variables")
	err := godotenv.Load()
	if err != nil {
		log.Errorf("Error loading .env file: %v", err)
	}

	// Set environmental variables otherwise
	cfg = config{}
	if err := env.Parse(&cfg); err != nil {
		log.Errorf("%+v\n", err)
	}

	// configure Mongo
	log.Infow("Connecting to Mongo")
	mongoClient = initMongo(cfg.ConnectionURI)

}

func main() {
	log.Info(fmt.Sprintf("Starting backend..."))

	startServer()
}
