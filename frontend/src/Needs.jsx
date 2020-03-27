import React, { useState, useEffect } from 'react';

const useFetch = url => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        const resp = await fetch(url);
        const data = await resp.json();
        setData(data);
        setLoading(false);
    }

    useEffect(() => {fetchData()}, [url]);

    return {data, loading};
}
const Needs = () => {
    const {data, loading} = useFetch("https://meetneeds.herokuapp.com/getall");
    console.log(data);
    if(loading) {
        return(
            <div>loading...</div>
        )
    }

    return (
        <div>
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