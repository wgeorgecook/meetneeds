import React, { useState, useEffect } from 'react';

const useFetch = url => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetch("https://meetneeds.herokuapp.com/getall")
        .then(response => response.json())
        .then(data => console.log(data))
    }, []);

    return {data, loading};
}
const Needs = () => {
    const {data, loading} = useFetch("https://meetneeds.herokuapp.com/getall");
    console.log(data);
    if(loading) {
        return(
            <div>
                <h3>Needs Available to Meet</h3>
                <div>loading...</div>
            </div>
        )
    }

    return (
        <div>
            <h3>Needs Available to Meet</h3>
            {[...data].map(n => (
                (n.isMet) ? null :
                <div key={n.id}>
                    <p>Name: {n.name}</p>
                    <p>Need: {n.need}</p>
                </div>
            ))}
        </div>
    )
};
export default Needs;