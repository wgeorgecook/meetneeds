import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Modal } from 'antd';
import MeetNeed from './MeetNeed';
import urls from './urls';

const Need = props => {

    const [n, setNeed] = useState(props);
    const [meetOpen, setMeetOpen] = useState({meetOpen: false})
    const [form] = Form.useForm();
    const url = `${urls.UPDATE_URL}?id=${n._id}`;

    const onSuccess = (data) => {
        console.log(data);
        setMeetOpen({meetOpen: false});
    }

    const submitData = (values, cb) => {
        console.log(values);
        if (!(values.name && values.rationale && (values.phone || values.email))) {
            alert("Please enter your name, how you plan to provide for this need, and at least one way we can contact you.")
            return;
        }

        async function sendData() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                mode: 'no-cors',
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
        props.onMetNeed();
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
                        form
                            .validateFields()
                            .then(values => {
                            form.resetFields();
                            submitData(values);
                            })
                    }}
                    okText="Submit"
                >
                    <MeetNeed form={form} />
                </Modal>
            </Card>
        </div>
    )
};
export default Need;