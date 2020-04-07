import React, { useReducer } from 'react'
import NewNeed from './NewNeed'
import { Button, Divider, Modal, PageHeader } from 'antd';

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

    const closeNeed = () => {
        dispatch({newNeedOpen: false})
    };


    return(
        <PageHeader
            title="Meet Needs"
            subTitle="Connecting Your Community"
            extra={<Button type="primary" onClick={() => dispatch({type:"open"})}> New need </Button>}
            >
            <Modal visible={state.newNeedOpen} onCancel={closeNeed} onOk={closeNeed} >
                <p>Plase use this form to submit a new need.</p>
                <NewNeed closeNeed={closeNeed}/>
                <p>Refer to our Privacy Policy for privacy details.</p>
            </Modal>
            <Divider />
        </PageHeader>
    )
};

export default Topbar;