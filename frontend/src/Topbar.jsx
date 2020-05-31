import React, { useReducer } from 'react';
import Auth from './Auth'
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

const confirmModalReducer = (state, action) => {
    switch(action.type) {
        case "open":
            return {confirmModalOpen: true};
        case "close":
            return {confirmModalOpen: false};
        default:
            return state.confirmModalOpen
    }
}



const Topbar = (props) => {
    const { onAuthSuccess, onAuthFailure, user } = props;

    const [ newNeedState, newNeedDispatch ] = useReducer(newNeedReducer, {newNeedOpen: false});
    const [ confirmModalState, confirmModalDispatch ] = useReducer(confirmModalReducer, {confirmModalOpen: false})
    const [ form ] = Form.useForm();

    const url = urls.CREATE_URL;

    const closeNeed = (confirm) => {
        (confirm) ? confirmModalDispatch({type:"open"}) : newNeedDispatch({type: "close"})
    };
    const closeConfirm = () => {
        confirmModalDispatch({type:"close"});
        newNeedDispatch({type:"close"})
    };
    const onSuccess = (data) => {
        closeNeed();
    };
    const submitData = (formData) => {
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
                    "approved": false,
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
            extra={<Button type="primary" onClick={() => newNeedDispatch({type:"open"})}> New need </Button>}
            >
            <Modal
                visible={newNeedState.newNeedOpen}
                onCancel={() => closeNeed(false)}
                onOk={() => {
                    form
                      .validateFields()
                      .then(values => {
                        submitData(values);
                        form.resetFields();
                      })}}
            >
                <p>Plase use this form to submit a new need.</p>
                <NewNeed form={form} closeNeed={closeNeed}/>
                <p>Refer to our Privacy Policy for privacy details.</p>
            </Modal>
            <Modal
                visible={confirmModalState.confirmModalOpen}
                onCancel={closeConfirm}
                onOk={closeConfirm}
                footer={[<Button key="submit" type="primary" onClick={closeConfirm}>Close</Button>]}
            >
                <p style={{"marginTop": "1em"}}>Thank you for submitting your need! This request will be validated before being made public.</p>
            </Modal>
            {
                user ? <div>Hello, {user?.Tt?.sW}!</div> : <Auth onAuthSuccess={(vals) => onAuthSuccess(vals)} onAuthFailure={() => onAuthFailure(null)}/>
            }
            <Divider />
        </PageHeader>
    )
};

export default Topbar;