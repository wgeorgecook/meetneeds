import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Modal, Checkbox } from 'antd';
import MeetNeed from './MeetNeed';
import urls from './urls';

const Need = props => {

    const { onMetNeed, user } = props;

    const [n, setNeed] = useState(props);
    const [meetOpen, setMeetOpen] = useState({meetOpen: false})
    const [checked, setChecked] = useState(n.approved)
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [form] = Form.useForm();
    const url = `${urls.UPDATE_URL}?id=${n._id}`;

    const onSuccess = (data) => {
        setConfirmModalOpen(true);
    }

    const closeConfirm = () => {
        setConfirmModalOpen(false);
        setMeetOpen({meetOpen: false});
    };

    const toggleApproved = (e, id) => {
        console.log("Checked: " + e.target.checked);
        console.log("ID: " + id);
        console.log("ID Token: ", user.wc.access_token);

        // update the UI
        setChecked(e.target.checked);

        // create the updated object and set options on the request
        const requestOptions = {
            method: 'POST',
            headers: new Headers({'Authorization':`Bearer ${user?.wc?.access_token}`}),
            body: JSON.stringify({"approved": e.target.checked})
        };

        // make the database request to update the approval status on this need
        const updateURL = `${urls.UPDATE_URL}?id=${id}&approveChange=${e.target.checked}`
        fetch(updateURL, requestOptions)
        .then(resp => resp)
        .then(data => console.log(data))
        .catch(err => alert(`Something went wrong: ${err}`));
    }

    const submitData = (values, cb) => {
        if (!(values.name && values.rationale && (values.phone || values.email))) {
            alert("Please enter your name, how you plan to provide for this need, and at least one way we can contact you.")
            return;
        }

        async function sendData() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "meetingUser": {
                        "name": values.name,
                        "email": values.email,
                        "phone": values.phone,
                        "rationale": values.rationale,
                    }})
            };

            fetch(url, requestOptions)
            .then(resp => resp)
            .then(data => onSuccess(data))
            .catch(err => alert(`Something went wrong: ${err}`));
        }

        sendData();
        onMetNeed();
    };

    useEffect(() => {
        setNeed(props);
      }, [props]);

    return (
        <div>
            <Card title={`${n.needingUser.name} needs`}>
                <p>{n.need}</p>
                <Button size="small" onClick={() => setMeetOpen({meetOpen: true})}>I can meet this need</Button>
                <Modal
                    visible={meetOpen.meetOpen}
                    onCancel={() => setMeetOpen({meetOpen: false})}
                    onOk={() => {
                        (n.sample)
                        ? alert("You cannot meet the sample need, it is here to demonstrate functionality.")
                        : form
                            .validateFields()
                            .then(values => {
                            submitData(values);
                            form.resetFields();
                            })
                    }}
                    okText="Submit"
                >
                    <MeetNeed form={form} />
                </Modal>
                <Modal
                    visible={confirmModalOpen}
                    onOk={closeConfirm}
                    footer={[<Button key="submit" type="primary" onClick={closeConfirm}>Close</Button>]}
                >
                    <p style={{"marginTop": "1em"}}>Thank you for voluntering to meet this need! Someone will be in contact with you soon about this.</p>
                </Modal>
                { user
                    ? <div style={{"marginTop": "1em"}} >
                        <Checkbox checked={checked} onChange={(e) => toggleApproved(e, n._id)}>This need is approved</Checkbox>
                        {(n.isMet)
                        ? <p style={{"marginTop": "1em"}}>{n.meetingUser.name} volunteered to meet this need.</p>
                        : <p style={{"marginTop": "1em"}}>This need is still unmet.</p>}
                      </div>
                    :
                    null
                }
            </Card>
        </div>
    )
};
export default Need;