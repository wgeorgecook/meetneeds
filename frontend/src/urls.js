const urls = {
    UPDATE_URL: (process.env.NODE_ENV==='development') ? "http://localhost:8080/update" : "https://meetneeds.herokuapp.com/update",
    CREATE_URL: (process.env.NODE_ENV==='development') ? "http://localhost:8080/create" : "https://meetneeds.herokuapp.com/create",
    GET_URL: (process.env.NODE_ENV==='development') ? "http://localhost:8080/getall" : "https://meetneeds.herokuapp.com/getall",
};

export default urls;