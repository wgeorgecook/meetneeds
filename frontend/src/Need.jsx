import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal } from 'antd';
import { toast } from 'react-toastify';
import axios from 'axios'

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

        // TODO: Validate entries
        const submitData = (values) => {
            console.log(values);
            if (!(values.name && (values.phone || values.email))) {
                alert("Please enter your name and at least one way we can contact you.")
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
            <Card title="Community Need">
                <p>Name: {n.needingUser.name}</p>
                <p>Need: {n.need}</p>
                    { (!meetOpen.meetOpen)
                      ? <Button size="small" onClick={() => setMeetOpen({meetOpen: true})}>I can meet this need</Button>
                      : <Modal
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
                            <p>Thank you for volunteering to meet this need! </p>
                            <p>Please complete this form and we will be in touch soon.</p>
                            <Form name="Meet A Need" form={form}>
                                <Form.Item
                                    name={"name"}
                                    label='Name'
                                    rules={[{ required: true }]}
                                >
                                        <Input />
                                </Form.Item>
                                <Form.Item
                                    name={"phone"}
                                    label='Phone'
                                    rules={[{ required: false }]}
                                >
                                        <Input />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label="E-mail"
                                    rules={[{type: 'email', message: 'The input is not valid E-mail!'}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Form>
                        </Modal>
                    }
            </Card>
        </div>
    )
};
export default Need;