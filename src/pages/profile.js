import { withAuthenticator, Authenticator } from "@aws-amplify/ui-react";

const { Auth } = require("aws-amplify");
const { useState, useEffect } = require("react");

function Profile(){
    const [user, setUser] = useState(null);
    useEffect(() => {
        checkUser();
    }, [])

    async function checkUser(){
        const user = await Auth.currentAuthenticatedUser();
        setUser(user);
    }

    if (!user) return null;
    return (
        <div>
            <h1 className="text-3xl font-semibold tracking-wide mt-6">Profile</h1>
            <h1 className="font-medium text-gray-500 my-2">Username: {user.username}</h1>
            <p className="text-sm text-gray-500 mb-6">Email: {user.attributes.email}</p>
            <Authenticator>
                <button onClick={()=>Auth.signOut()} className='bg-red-700 px-4 hover:bg-red-950 py-1 mt-3 rounded-lg text-white'>Sign out</button>
            </Authenticator>
        </div>
    )
}

export default withAuthenticator(Profile);