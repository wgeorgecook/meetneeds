import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Modal } from 'antd';
import { toast } from 'react-toastify';
import axios from 'axios'
import MeetNeed from './MeetNeed';

const Need = props => {

    const [n, setNeed] = useState(props);
    const [meetOpen, setMeetOpen] = useState({meetOpen: false})
    const [form] = Form.useForm();
    const url = `https://cors-anywhere.herokuapp.com/https://meetneeds.herokuapp.com/update?id=${n._id}&isMet=true`;

    const successfulPost = () => {
        toast('From successfully sent!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            });

        setMeetOpen({meetOpen: false})

    };

        const submitData = (values) => {
            console.log(values);
            if (!(values.name && values.rationale && (values.phone || values.email))) {
                alert("Please enter your name, how you plan to provide for this need, and at least one way we can contact you.")
                return;
            }

            async function sendData() {
                const resp = await axios.post(
                    url,
                    {
                        "meetingUser": {
                            "name": values.name,
                            "email": values.email,
                            "phone": values.phone,
                            "rationale": values.rationale,
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