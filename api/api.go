package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
)

// Types
type Employee struct {
	Name         string `json:"name"`
	Phone        string `json:"phone"`
	Contact      string `json:"contact"`
	ContactPhone string `json:"contactPhone"`
}

// Globals
var (
	List = []Employee{}
)

// Utils
func failGracefully(err error, msg string) {
	if err != nil {
		fmt.Printf("%s: %s", msg, err)
	}
}

func failWithStatusCode(err error, msg string, w http.ResponseWriter, statusCode int) {
	failGracefully(err, msg)
	w.WriteHeader(statusCode)
	fmt.Fprintf(w, msg)
}

func isInList(target Employee) (int, bool) {
	for index, element := range List {
		if element.Name == target.Name && element.Phone == target.Phone {
			return index, true
		}
	}

	return -1, false
}

// Handlers
func rootHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "API connection success!")
}

func addHandler(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	req := Employee{"", "", "", ""}

	err := decoder.Decode(&req)

	fmt.Println("adding")

	if err != nil {
		failWithStatusCode(err, http.StatusText(http.StatusBadRequest), w, http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.Phone == "" || req.Contact == "" || req.ContactPhone == "" {
		failWithStatusCode(errors.New("Must provide all fields"), http.StatusText(http.StatusBadRequest), w, http.StatusBadRequest)
		return
	}

	if _, err := strconv.Atoi(req.Phone); err != nil {
		failWithStatusCode(errors.New("Non numeric phone number"), http.StatusText(http.StatusBadRequest), w, http.StatusBadRequest)
		return
	}

	if _, err := strconv.Atoi(req.ContactPhone); err != nil {
		failWithStatusCode(errors.New("Non numeric phone number"), http.StatusText(http.StatusBadRequest), w, http.StatusBadRequest)
		return
	}

	if _, inList := isInList(req); inList {
		failWithStatusCode(errors.New("Employee already has entry"), http.StatusText(http.StatusBadRequest), w, http.StatusBadRequest)
		return
	}

	List = append(List, req)

	// DEBUG
	fmt.Println(List)

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
}

func editHandler(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	req := Employee{"", "", "", ""}

	err := decoder.Decode(&req)

	if err != nil {
		failWithStatusCode(err, http.StatusText(http.StatusBadRequest), w, http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.Phone == "" {
		failWithStatusCode(errors.New("Invalid Name/Phone combination"), http.StatusText(http.StatusBadRequest), w, http.StatusBadRequest)
		return
	}

	index, inList := isInList(req)
	if !inList {
		failWithStatusCode(errors.New("No entry for Name/Phone combination"), http.StatusText(http.StatusBadRequest), w, http.StatusBadRequest)
		return
	}

	if req.Contact == "" && req.ContactPhone == "" {
		// Delete it
		List = append(List[:index], List[index+1:]...)
		w.WriteHeader(http.StatusOK)
		return
	}

	// Else, update it
	if req.Contact != "" {
		List[index].Contact = req.Contact
	}

	if req.ContactPhone != "" {
		List[index].ContactPhone = req.ContactPhone
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
}

func listHandler(w http.ResponseWriter, r *http.Request) {
	listJSON, err := json.Marshal(List)

	if err != nil {
		failWithStatusCode(err, http.StatusText(http.StatusInternalServerError), w, http.StatusInternalServerError)
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Fprintf(w, string(listJSON))
}

func main() {
	fmt.Printf("Listening on port :8080\n")

	fs := http.FileServer(http.Dir("../build"))
	http.Handle("/", fs)
	http.HandleFunc("/api", rootHandler)
	http.HandleFunc("/api/add", addHandler)
	http.HandleFunc("/api/edit", editHandler)
	http.HandleFunc("/api/list", listHandler)
	http.ListenAndServe(":8080", nil)
}
