import axios from 'axios'
import React, { useState } from 'react';
import { Button, Grid, TextField } from '@material-ui/core'

const NewNeed = () => {
    // TODO: Validate entries
    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
    const [phone, setPhone] = useState(null);
    const [need, setNeed] = useState(null)
    const url = "https://cors-anywhere.herokuapp.com/https://meetneeds.herokuapp.com/create";

    const handleChange = (e, type) => {
        const data = e.target.value;
        switch (type) {
            case "name":
                setName(data);
                break;
            case "email":
                setEmail(data);
                break;
            case "phone":
                setPhone(data);
                break;
            case "need":
                setNeed(data);
                break;
            default:
                break;
        }
    };

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
            const data = await resp;
            console.log(data);
        }

        sendData();
    };

    return (
        <Grid
            container
            direction="column"
            justify="space-evenly"
            alignItems="stretch"
            spacing={4}
        >
            <Grid item>
                <TextField id="outlined-basic" label="Name" variant="outlined" multiline onChange={(e) => handleChange(e, "name")}/>
            </Grid>
            <Grid item>
                <TextField id="outlined-basic" label="Phone Number" variant="outlined" multiline onChange={(e) => handleChange(e, "phone")}/>
            </Grid>
            <Grid item>
                <TextField id="outlined-basic" label="Email" variant="outlined" multiline onChange={(e) => handleChange(e, "email")}/>
            </Grid>
            <Grid item>
                <TextField id="outlined-basic" label="Need" variant="outlined" multiline onChange={(e) => handleChange(e, "need")}/>
            </Grid>
            <Grid item>
                <Button variant="contained" color="primary" onClick={submitData}>Send</Button>
            </Grid>
        </Grid>
    )
};
export default NewNeed;