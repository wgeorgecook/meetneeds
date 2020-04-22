import React from 'react';
import { Checkbox, Form, Input } from 'antd'

const NewNeed = (props) => {
    const { form } = props;


    return (
        <Form name="Submit New Need" form={form}>
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
            <Form.Item
                name="need"
                label="Need"
                rules={[{required: true}]}
            >
                <Input />
            </Form.Item>
            <Form.Item name="anonymous" valuePropName="checked">
                <Checkbox>I wish to remain anonymous when my need is displayed publicly</Checkbox>
            </Form.Item>
        </Form>
    )
};
export default NewNeed;