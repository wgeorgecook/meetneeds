import React, { useState, useEffect } from 'react';
import Topbar from './Topbar'
import Need from './Need'
import urls from './urls'
import { Card, List } from 'antd';

const useFetch = (url, user) => {
    const [{ data, loading, pageNumber }, setState] = useState({
        data: {},
        loading: true,
        timeout: false,
        pageNumber: 1,
        error: ""

    })

    let requestHeaders = {
        Accept: "application/json",
    }

    if (user) { requestHeaders["Authorization"] = `Bearer ${user?.wc?.access_token}`}


    useEffect(() => {
        fetch(url, {headers: requestHeaders})
        .then(response => response.json())
        .then(data => setState({data: data, loading: false, pageNumber: pageNumber}))
        .catch(err => alert("There's been an error: " + err.message + ". Please try again later."))
    }, [user]);

    return { data, loading, pageNumber };
};

const Needs = (props) => {
    const { user, onAuthSuccess, onAuthFailure } = props;
    const [ pageNumber, setPageNumber ] = useState(1);
    const queryURL = `${urls.GET_URL}?pagenumber=${pageNumber}`;
    const { data, loading, itemTotal } = useFetch(queryURL, user); // fetches the data from the backend

    // TODO: actually get the end page number to set the pagination to
    return (
        <div>
            <Topbar
                onNewNeed={() => setPageNumber(0)}
                onAuthSuccess={(vals) => onAuthSuccess(vals)}
                onAuthFailure={() => onAuthFailure()}
                user={user}
            />
            {
                (loading)
                ?  <Card loading />
                :  (data === null)
                ? <Card>Woah! There are no unmet needs to load. Check back later to meet a need, or click the New Need button to create a new one.</Card>
                : <List
                        pagination={{
                            onChange: (page) => {
                            setPageNumber(page);
                            },
                            pageSize: 10,
                        }}
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 2,
                            md: 4,
                            lg: 4,
                            xl: 6,
                            xxl: 3,
                        }}
                        dataSource={[...data]}
                        total={itemTotal}
                        renderItem={(n) => (
                            <List.Item>
                                <Need onMetNeed={() => setPageNumber(pageNumber)} {...n} user={user}/>
                            </List.Item>
                        )}
                    />
            }
        </div>
    )
};

export default Needs;