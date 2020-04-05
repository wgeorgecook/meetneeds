import React, { useState, useEffect } from 'react';
import Need from './Need'
import { Grid } from '@material-ui/core';

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
            <Grid container spacing={4}>
                {[...data].map(n => (
                        <Grid item>
                            {(n.isMet) ? null : <Need key={n.id} {...n}/>}
                        </Grid>
                ))}
            </Grid>
        </div>
    )
};
export default Needs;