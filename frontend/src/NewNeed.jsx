import axios from 'axios'
import React, { useState } from 'react';
import { Button, Grid, TextField } from '@material-ui/core'
import { toast } from 'react-toastify';

const NewNeed = props => {

    const { closeNeed } = props;

    const initialState = {
        "name": "",
        "email": "",
        "phone": "",
        "need": "",
    };

    const [{ name, email, phone, need }, setState] = useState(initialState)

    const url = "https://cors-anywhere.herokuapp.com/https://meetneeds.herokuapp.com/create";

    const handleChange = (e, type) => {
        const data = e.target.value;
        setState(prevState => ({...prevState, [type]: data}))
    };

    const clearState = () => {
        setState({ ...initialState });
      };

    const successfulPost = () => {
        toast('Need successfully created', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            });

        clearState();
        closeNeed();
    };

    // TODO: Validate entries
    const submitData = () => {
        if (!(name && need && (phone || email))) {
            alert("Please enter your name, your need, and at least one way we can contact you.")
            return;
        }

        async function sendData() {
            const resp = await axios.post(
                url,
                {
                    "needingUser": {
                        "name": name,
                        "email": email,
                        "phone": phone,
                    },
                    need
                },
                { "headers":
                        {
                            'Content-Type': 'application/json',
                        }
                }
            );
            const data = resp;

            if (resp.status === 200) {
                successfulPost();
            } else {
                alert("Something went wrong, please try again")
            }

            console.log("Data received: ", data)
        }

        sendData();
    };

    return (
        <div>
            <h3>Submit a new need</h3>
            <Grid
                container
                direction="column"
                justify="space-evenly"
                alignItems="stretch"
                spacing={4}
            >
                <Grid item>
                    <TextField id="outlined-basic" label="Name" variant="outlined" value={name} multiline onChange={(e) => handleChange(e, "name")}/>
                </Grid>
                <Grid item>
                    <TextField id="outlined-basic" label="Phone Number" variant="outlined" value={phone} multiline onChange={(e) => handleChange(e, "phone")}/>
                </Grid>
                <Grid item>
                    <TextField id="outlined-basic" label="Email" variant="outlined" value={email} multiline onChange={(e) => handleChange(e, "email")}/>
                </Grid>
                <Grid item>
                    <TextField id="outlined-basic" label="Need" variant="outlined" value={need} multiline onChange={(e) => handleChange(e, "need")}/>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={submitData}>Send</Button>
                </Grid>
            </Grid>
        </div>
    )
};
export default NewNeed;