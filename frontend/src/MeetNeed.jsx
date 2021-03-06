import React from 'react';
import { Form, Input } from 'antd'
import { validatePhoneNumber } from './Utils'


const MeetNeed = (props) => {
    const { form } = props;

    return (
        <Form name="Meet A Need" form={form}>
            <p>Thank you for volunteering to meet this need! </p>
            <p>Please complete this form and we will be in touch soon.</p>
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
                rules={[{ required: false, validator: validatePhoneNumber}]}
            >
                    <Input />
            </Form.Item>
            <Form.Item
                name="email"
                label="E-mail"
                rules={[{type: 'email', message: 'Please enter a valid email'}]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="rationale"
                label="Please let us know how you'll meet this need"
                rules={[{required: true}]}
            >
                <Input />
            </Form.Item>
        </Form>
    )
};
export default MeetNeed;