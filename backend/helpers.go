// TODO: Better error handling

package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

//"issued_to": "307796009112-hai5ta64pmiuoq7471hb07bk7olc2h7r.apps.googleusercontent.com",
//"audience": "307796009112-hai5ta64pmiuoq7471hb07bk7olc2h7r.apps.googleusercontent.com",
//"user_id": "100933464384153105736",
//"scope": "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
//"expires_in": 2387,
//"email": "heatherc@baysideplacerville.com",
//"verified_email": true,
//"access_type": "online"

type googleResponse struct {
	IssuedTo string `json:"issued_to"`
	Audience string `json:"audience"`
	UserID string `json:"user_id"`
	Scope string `json:"scope"`
	ExpiresIn int `json:"expires_in"`
	Email string `json:"email"`
	VerifiedEmail bool `json:"verified_email"`
	AccessType string `json:"access_type"`
}

func verifyToken(tokenString string) bool {
	log.Infof("Parsing token: %v", tokenString)
	checkURL := fmt.Sprintf("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%v", tokenString)

	// make a request to the Google endpoint to check that this is valid
	resp, err := http.Get(checkURL)
	if err != nil {
		log.Errorf("error making get request to Google: %v", err)
		return false
	}
	defer resp.Body.Close()

	// unmarshal the response to our googleResponse struct
	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Errorf("error reading response from Google: %v", err)
	}

	var gr googleResponse
	if err := json.Unmarshal(bodyBytes, &gr); err != nil {
		log.Errorf("error unmarshaling response from Google: %v", err)
	}

	// if our token data has an email attribute with our domain in it, we're golden
	if strings.Contains(gr.Email, "baysideplacerville.com") && gr.VerifiedEmail {
		log.Infof("Successfully validated: %v", gr.Email)
		return true
	}

	log.Infof("Did not validate user's access token")
	return false

}

