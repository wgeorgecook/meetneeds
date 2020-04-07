import React, { useReducer } from 'react'
import NewNeed from './NewNeed'
import { AppBar, Button, Dialog, DialogContent, DialogContentText, Toolbar, Typography } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add';

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


const Topbar = () => {
    const [ state, dispatch ] = useReducer(newNeedReducer, {newNeedOpen: false});

    const closeNeed = () => {
        dispatch({newNeedOpen: false})
    };


    return(
        <AppBar position="static">
        <Toolbar>
            <Typography variant="h6">
            Meet Needs - Connecting Your Community
            </Typography>
            { !state.newNeedOpen
                    ? <Button variant="text" onClick={() => dispatch({type:"open"})} > <AddIcon color="inherit"/>New need </Button>
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

        </Toolbar>
        </AppBar>
    )
};

export default Topbar;