import React, { useState, useEffect } from 'react';
import Topbar from './Topbar'
import Need from './Need'
import urls from './urls'
import { Row, Col } from 'antd';

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

    return {data, loading};
};


const Needs = () => {
    // TODO: this needs to re-render when a user accepts a need to fulfil
    const { data, loading } = useFetch(`${urls.GET_URL}?pagenumber=1`);

    return (
        <div>
            <Topbar />
            {
                (loading)
                ?  <div>loading...</div>
                :  <Row gutter={[16, 16]}>
                        {[...data].map(n => (
                                <Col key={n._id}>
                                    {(n.isMet) ? null : <Need {...n}/>}
                                </Col>
                        ))}
                    </Row>
            }
        </div>
    )
};

export default Needs;