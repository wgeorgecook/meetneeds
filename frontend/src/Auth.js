import React from 'react';
import { GoogleLogin } from 'react-google-login';

const Auth = (props) => {
    const { onAuthSuccess, onAuthFailure } = props;
    return (
        <GoogleLogin
            clientId='307796009112-hai5ta64pmiuoq7471hb07bk7olc2h7r.apps.googleusercontent.com'
            icon={false}
            isSignedIn
            hostedDomain='baysideplacerville.com'
            buttonText='Bayside Of Placerville Administrator Portal'
            onSuccess={onAuthSuccess}
            onFailure={onAuthFailure}
        />
    )
};
export default Auth;