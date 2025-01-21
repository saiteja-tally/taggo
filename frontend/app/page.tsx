"use client"
import { useEffect, useState } from 'react';
import Submissions from './components/Submissions';
import HomeHeader from './components/HomeHeader';
import withAuth from './utils/withAuth';
import getUsernameFromToken from './utils/getUsernameFromToken';

const Home = () => {

    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsername = async () => {
            const username = await getUsernameFromToken();
            if (username) {
                setUsername(username);
            }
        };
        fetchUsername();
    }, [username]);

    return (
        <div>
            <HomeHeader username={username} />
            <Submissions username={username}/>
        </div>
    );
}

export default withAuth(Home);
