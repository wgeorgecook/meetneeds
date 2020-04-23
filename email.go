package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/mailgun/mailgun-go/v3"
	"html/template"
	"io/ioutil"
	"net/http"
	"time"
)

// initMailgun configures the global Mailgun client.
func initMailgun() {
	log.Infof("Configuring mailgun client")
	mg = mailgun.NewMailgun(cfg.MailgunDomain, cfg.MailgunAPIKey)
}

// listenForMetNeed loops forever waiting for jobs to be sent on the metNeedChannel. Once it receives a job on that
// channel, it will retrieve the Mongo document associated with the ID and send an email to the admin with the needing
// and meeting users for further contact.
func listenForMetNeed() {
	for {
		select {
		case needID := <-metNeedChannel:
			log.Infof("A need was met!")
			log.Infof("Looking for document with _id %v", needID)

			// make a request to the get endpoint for this document
			getEndpoint := fmt.Sprintf("http://localhost:8080/get?id=%v", needID)
			resp, err := http.Get(getEndpoint)
			defer resp.Body.Close()
			if err != nil {
				log.Error(err)
				break
			}

			// unmarshal the document response into a need
			bodyBytes, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				log.Error(err)
				break
			}

			var n need
			if err := json.Unmarshal(bodyBytes, &n); err != nil {
				log.Error(err)
				break
			}

			log.Info("Sending an email to connect for this need")
			sendEmail(n)
		}
	}
}

// sendEmail uses the Mailgun library (https://github.com/mailgun/mailgun-go) to send an email to our admin. Mailgun has
// a very generous free plan and their in house library is fantastic.
func sendEmail(n need) {
	// configure the email parameters
	recipient := cfg.AdminEmail
	sender := cfg.FromEmail
	subject := fmt.Sprintf("%v volunteered to meet %v's need!", n.MeetingUser.Name, n.NeedingUser.Name)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	// create the email body from the html template and execute it into a bytes buffer
	var bodyBuffer bytes.Buffer
	body, err := template.ParseFiles("met_need.html")
	if err != nil {
		log.Errorf("error in sendEmail: %v", err)
		return
	}
	if err := body.Execute(&bodyBuffer, n); err != nil {
		log.Errorf("error in sendEmail: %v", err)
		return
	}

	// create a mailgun message object
	// note that the text argument here is an empty string because we set the body via the html template
	message := mg.NewMessage(sender, subject, "", recipient)
	message.SetHtml(bodyBuffer.String())

	// Send the message	with a 10 second timeout
	resp, id, err := mg.Send(ctx, message)

	if err != nil {
		log.Errorf("error sending the email: %v", err)
		return
	}

	fmt.Printf("ID: %s Resp: %s\n", id, resp)

}
