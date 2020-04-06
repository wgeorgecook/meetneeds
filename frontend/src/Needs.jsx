import React, { useReducer, useState, useEffect } from 'react';
import Need from './Need'
import NewNeed from './NewNeed'
import { Grid, IconButton, Dialog, DialogContent, DialogContentText } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

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
                ? <IconButton onClick={() => dispatch({type:"open"})} > <AddIcon />Submit a new need </IconButton>
                : <Dialog open={state.newNeedOpen} onClose={closeNeed} aria-labelledby="form-dialog-title" >
                    <DialogContent>
                        <DialogContentText>
                            Plase use this form to submit a new need.
                        </DialogContentText>
                        <NewNeed closeNeed={closeNeed}/>
                        <DialogContentText>
                            Refer to our Privacy Policy for privacy details.
                        </DialogContentText>
                    </DialogContent>
                  </Dialog>
            }
        </div>
    )
};

export default Needs;