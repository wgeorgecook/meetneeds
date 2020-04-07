import React, { useState, useEffect } from 'react';
import Need from './Need'
import { Grid } from '@material-ui/core';

const useFetch = (url) => {
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
};


const Needs = () => {
    // TODO: this needs to re-render when a user accepts a need to fulfil
    const { data, loading } = useFetch("https://meetneeds.herokuapp.com/getall?pagenumber=1");

    return (
        <div>
            <h3>Needs Available to Meet</h3>
            {
                loading
                ?  <div>loading...</div>
                :  <Grid container spacing={4}>
                        {[...data].map(n => (
                                <Grid item key={n._id}>
                                    {(n.isMet) ? null : <Need {...n}/>}
                                </Grid>
                        ))}
                    </Grid>
            }
        </div>
    )
};

export default Needs;