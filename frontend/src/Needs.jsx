import React, { useState, useEffect } from 'react';
import Topbar from './Topbar'
import Need from './Need'
import urls from './urls'
import { Card, Col, Row } from 'antd';

const useFetch = (url) => {
    const [{ data, loading }, setState] = useState({
        data: null,
        loading: true,
    })


    useEffect(() => {
        fetch(url)
        .then(response => response.json())
        .then(data => setState({data: data, loading: false}))
    }, [url]);

    return { data, loading };
};


const Needs = () => {
    // TODO: this needs to re-render when a user accepts a need to fulfil or submits a new need
    const queryURL = `${urls.GET_URL}?pagenumber=1`;
    const { data, loading } = useFetch(queryURL);

    return (
        <div>
            <Topbar />
            {
                (loading)
                ?  <Card loading={loading} />
                :  <Row gutter={[16, 16]}>
                        {[...data].map(n => (
                                <Col key={n._id}>
                                    {<Need {...n}/>}
                                </Col>
                        ))}
                    </Row>
            }
        </div>
    )
};

export default Needs;