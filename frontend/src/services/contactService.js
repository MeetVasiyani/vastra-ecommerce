import axios from 'axios';
import { API_BASE_URL } from './config';

export const submitContactForm = async (contactData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/Contact`, contactData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;

        if (data.isSuccess) {
            return {
                success: true,
                message: data.message
            };
        }

        return {
            success: false,
            error: data.message || 'Failed to submit contact form. Please try again.'
        };
    } catch (error) {
        if (error.response) {
            const data = error.response.data;
            return {
                success: false,
                error: data.message || 'Failed to submit contact form. Please try again.'
            };
        }
        console.error('Contact form submission error:', error);
        return {
            success: false,
            error: 'Network error. Please check your connection and try again.'
        };
    }
};

export default {
    submitContactForm
};
