const urls = {
    UPDATE_URL: (process.env.NODE_ENV==='development') ? "http://localhost:8080/update" : "https://cors-anywhere.herokuapp.com/https://meetneeds.herokuapp.com/update",
    CREATE_URL: (process.env.NODE_ENV==='development') ? "http://localhost:8080/create" : "https://cors-anywhere.herokuapp.com/https://meetneeds.herokuapp.com/create",
    GET_URL: (process.env.NODE_ENV==='development') ? "http://localhost:8080/getall" : "https://cors-anywhere.herokuapp.com/https://meetneeds.herokuapp.com/getall",
};

export default urls;