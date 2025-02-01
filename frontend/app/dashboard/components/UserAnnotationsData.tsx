import React from 'react';
import { useState } from 'react';

interface UserAnnotationDataProps {
    selectedUsername: string | null;
}

const UserAnnotationsData: React.FC<UserAnnotationDataProps> = ({ selectedUsername }) => {

    const [data, setData] = useState<any[]>([]);


    return (
        <div>
            <h1
            className='text-2xl text-gray-800 text-center'
            >
            {selectedUsername ? `${selectedUsername}'s Annotation Data` : 'No User Selected'}
            </h1>
        </div>
    );
};

export default UserAnnotationsData;