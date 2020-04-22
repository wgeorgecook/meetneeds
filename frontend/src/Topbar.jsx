import React, { useReducer } from 'react';
import NewNeed from './NewNeed';
import urls from './urls';
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


const Topbar = (props) => {
    const [ state, dispatch ] = useReducer(newNeedReducer, {newNeedOpen: false});
    const [form] = Form.useForm();
    const url = urls.CREATE_URL;
    const closeNeed = () => {
        dispatch({newNeedOpen: false})
    };

    const onSuccess = (data) => {
        console.log(data);
        closeNeed();
    };

    // TODO: Validate phone entries
    const submitData = (formData) => {
        console.log("Received this form data: ")
        console.log(formData)
        if (!(formData.name && formData.need && (formData.phone || formData.email))) {
            alert("Please enter your name, your need, and at least one way we can contact you.")
            return;
        }

        async function sendData() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                mode: 'no-cors',
                body: JSON.stringify({
                    "needingUser": {
                        "name": formData.name,
                        "email": formData.email,
                        "phone": formData.phone,
                        "anon": formData.anonymous
                    },
                    "need": formData.need,
                })
            };
            fetch(url, requestOptions)
            .then(resp => resp)
            .then(data => onSuccess(data))
            .catch(err => alert(`Something went wrong: ${err}`));
        };

        sendData();
        props.onNewNeed();
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