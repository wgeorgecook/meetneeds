const urls = {
    UPDATE_URL: (process.env.NODE_ENV==='development') ? "http://localhost:8080/api/update" : "https://meetneeds.herokuapp.com/api/update",
    CREATE_URL: (process.env.NODE_ENV==='development') ? "http://localhost:8080/api/create" : "https://meetneeds.herokuapp.com/api/create",
    GET_URL: (process.env.NODE_ENV==='development') ? "http://localhost:8080/api/getall" : "https://meetneeds.herokuapp.com/api/getall",
    ADMIN: {
        GET_URL: (process.env.NODE_ENV==='development') ? "http://localhost:8080/api/admin/getall" : "https://meetneeds.herokuapp.com/api/admin/getall",
    }
};

export default urls;