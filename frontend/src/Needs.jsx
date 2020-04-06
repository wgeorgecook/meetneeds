import React, { useReducer, useState, useEffect } from 'react';
import Need from './Need'
import NewNeed from './NewNeed'
import { Button, Grid } from '@material-ui/core';

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
};

const newNeedReducer = (state, action) => {
    switch (action.type) {
        case "open":
            return {newNeedOpen: true};
        case "close":
            return {newNeedOpen: false};
        default:
            return state.newNeedOpen;
    }
};


const Needs = () => {
    const {data, loading} = useFetch("https://meetneeds.herokuapp.com/getall");
    const [ state, dispatch ] = useReducer(newNeedReducer, {newNeedOpen: false})

    const closeNeed = () => {
        dispatch({newNeedOpen: false})
    };

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
                        <Grid item key={n._id}>
                            {(n.isMet) ? null : <Need {...n}/>}
                        </Grid>
                ))}
            </Grid>
            {(!state.newNeedOpen)
                ? <Button onClick={() => dispatch({type:"open"})} > Submit a new need </Button>
                : <NewNeed closeNeed={closeNeed}/> // TODO: This should be a modal
            }
        </div>
    )
};

export default Needs;