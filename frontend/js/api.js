// This file contains the API-related functions for making HTTP requests to the backend.

export const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const postData = async (url, data) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
    return response.json();
};