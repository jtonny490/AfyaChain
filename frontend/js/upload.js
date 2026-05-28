// This file contains the API-related functions for making HTTP requests to the backend.

export const fetchData = async (url) => {
    const response = await fetch(url);
    return handleResponse(response);
};

export const postData = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const handleResponse = async (response) => {
    if (!response.ok) {
        throw new Error('Internal Server Error');
    }
    return response.json();
};