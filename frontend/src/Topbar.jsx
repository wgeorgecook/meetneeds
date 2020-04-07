import React, { useReducer } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import NewNeed from './NewNeed'
import { Button, Divider, Form, Modal, PageHeader } from 'antd';

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
    const [form] = Form.useForm();
    const url = "https://cors-anywhere.herokuapp.com/https://meetneeds.herokuapp.com/create";
    const closeNeed = () => {
        dispatch({newNeedOpen: false})
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

        closeNeed();
    };

    // TODO: Validate entries
    const submitData = (formData) => {
        if (!(formData.name && formData.need && (formData.phone || formData.email))) {
            alert("Please enter your name, your need, and at least one way we can contact you.")
            return;
        }

        async function sendData() {
            const resp = await axios.post(
                url,
                {
                    "needingUser": {
                        "name": formData.name,
                        "email": formData.email,
                        "phone": formData.phone,
                    },
                    "need": formData.need,
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


    return(
        <PageHeader
            title="Meet Needs"
            subTitle="Connecting Your Community"
            extra={<Button type="primary" onClick={() => dispatch({type:"open"})}> New need </Button>}
            >
            <Modal
                visible={state.newNeedOpen}
                onCancel={closeNeed}
                onOk={() => {
                    form
                      .validateFields()
                      .then(values => {
                        form.resetFields();
                        submitData(values);
                      })}}
            >
                <p>Plase use this form to submit a new need.</p>
                <NewNeed form={form} closeNeed={closeNeed}/>
                <p>Refer to our Privacy Policy for privacy details.</p>
            </Modal>
            <Divider />
        </PageHeader>
    )
};

export default Topbar;