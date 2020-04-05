import React, { useState, useEffect } from 'react';

const useFetch = url => {
    const [{ data, loading }, setState] = useState({
        data: null,
        loading: true,
    })


    useEffect(() => {
        fetch(url)
        .then(response => response.json())
        .then(data => setState({data: data, loading: false}))
    }, [url]);

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
                    <p>Name: {n.needingUser.name}</p>
                    <p>Need: {n.need}</p>
                </div>
            ))}
        </div>
    )
};
export default Needs;