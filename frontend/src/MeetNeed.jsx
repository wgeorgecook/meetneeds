import axios from 'axios'
import React, { useState } from 'react';
import { Button, Grid, TextField } from '@material-ui/core'
import { toast } from 'react-toastify';

const MeetNeed = props => {

    const { closeNeed, _id } = props;
    console.log(props)

    const initialState = {
        "name": "",
        "email": "",
        "phone": "",
        "need": "",
        "id": _id
    };

    const [{ name, email, phone, id }, setState] = useState(initialState)

    const url = `https://cors-anywhere.herokuapp.com/https://meetneeds.herokuapp.com/update?id=${id}&isMet=true`;

    const handleChange = (e, type) => {
        const data = e.target.value;
        setState(prevState => ({...prevState, [type]: data}))
    };

    const clearState = () => {
        setState({ ...initialState });
      };

    const successfulPost = () => {
        toast('From successfully sent!', {
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
        if (!(name && (phone || email))) {
            alert("Please enter your name and at least one way we can contact you.")
            return;
        }

        async function sendData() {
            const resp = await axios.post(
                url,
                {
                    "meetingUser": {
                        "name": name,
                        "email": email,
                        "phone": phone,
                    },
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
                    <Button variant="contained" color="primary" onClick={submitData}>Submit Form</Button>
                </Grid>
            </Grid>
        </div>
    )
};
export default MeetNeed;