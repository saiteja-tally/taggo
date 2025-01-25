"use client"
import { useEffect, useState } from 'react';
import Submissions from './components/Submissions';
import HomeHeader from './components/HomeHeader';
import withAuth from './utils/withAuth';
import axiosInstance from './utils/axiosInstance';

const Home = () => {

    interface UserData {
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        date_joined: string;
        is_superuser: boolean;
        groups: string[];
    }

    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axiosInstance.get('/get_user_data');
            setUserData(response.data);
        };
        fetchData();
    }, []);

    return (
        <div>
            <HomeHeader userData={userData} />
            <Submissions userData={userData}/>
        </div>
    );
}

export default withAuth(Home);
