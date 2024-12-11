import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './detector.css'; // Import CSS for styling

const Detector = ({ username }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [emotion, setEmotion] = useState('');
    const [details, setDetails] = useState('');
    const [userEmotions, setUserEmotions] = useState([]);
    const [filter, setFilter] = useState('All');
    const [interval, setIntervalTime] = useState(1); // Default interval in minutes
    const [feedback, setFeedback] = useState(''); // Feedback for user actions
    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const streamRef = useRef(null);

    // Fetch user emotions from the backend
    const fetchUserEmotions = async () => {
        try {
            const response = await axios.get('https://114a-129-173-66-71.ngrok-free.app/user_emotions', { withCredentials: true });
            setUserEmotions(response.data || []);
        } catch (error) {
            console.error("Error fetching user emotions:", error);
            setFeedback("Failed to load previous results.");
        }
    };

    useEffect(() => {
        fetchUserEmotions();
    }, []);

    const startRecording = async () => {
        try {
            setFeedback('Recording...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Initialize MediaRecorder
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    const audioBlob = new Blob([event.data], { type: 'audio/wav' });
                    processAudioPrediction(audioBlob);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setFeedback('Recording started.');

            // Handle periodic recording based on interval
            setInterval(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.stop();
                    mediaRecorderRef.current.start();
                }
            }, interval * 60 * 1000); // Convert minutes to milliseconds
        } catch (error) {
            console.error('Error starting recording:', error);
            setFeedback('Error starting recording.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }

        setIsRecording(false);
        setFeedback('Recording stopped.');
    };

    const processAudioPrediction = async (blob) => {
        try {
            const formData = new FormData();
            formData.append('file', blob, 'recording.wav');

            const response = await axios.post('https://114a-129-173-66-71.ngrok-free.app/predict_emotion', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            const detectedEmotion = response.data.emotion;
            const emotionDetails = response.data.reason;

            setEmotion(`Detected Emotion: ${detectedEmotion === 'stressed' ? 'Stressed' : 'Not Stressed'}`);
            setDetails(`Details: ${emotionDetails}`);

            fetchUserEmotions();
        } catch (error) {
            console.error('Error processing audio prediction:', error);
            setFeedback('Error processing prediction.');
        }
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const handleIntervalChange = (event) => {
        const newInterval = Number(event.target.value);
        setIntervalTime(newInterval > 0 ? newInterval : 1); // Ensure a valid interval
    };

    const filteredEmotions = userEmotions.filter((entry) => {
        if (filter === 'All') return true;
        if (filter === 'Stressed') return entry.emotion === 'stressed';
        if (filter === 'Not Stressed') return entry.emotion === 'not stressed';
        return false;
    });

    return (
        <div className="detector-container">
            <div className="controls">
                <label>Interval (minutes):</label>
                <input
                    type="number"
                    min="1"
                    value={interval}
                    onChange={handleIntervalChange}
                    placeholder="Recording Interval"
                />
                <button onClick={startRecording} disabled={isRecording} className="btn btn-success">
                    Start Recording
                </button>
                <button onClick={stopRecording} disabled={!isRecording} className="btn btn-danger">
                    Stop Recording
                </button>
            </div>

            <canvas id="pitchCanvas" width="600" height="100"></canvas>

            <div className="feedback">
                {feedback && <p>{feedback}</p>}
                {emotion && <p>{emotion}</p>}
                {details && <p>{details}</p>}
            </div>

            <div className="filter">
                <label>Filter Results:</label>
                <select value={filter} onChange={handleFilterChange}>
                    <option value="All">All</option>
                    <option value="Stressed">Stressed</option>
                    <option value="Not Stressed">Not Stressed</option>
                </select>
            </div>

            <div className="results">
                <h3>Previous Results</h3>
                <ul>
                    {filteredEmotions.map((entry, index) => (
                        <li key={index}>
                            {new Date(entry.timestamp).toLocaleString()}: {entry.emotion === 'stressed' ? 'Stressed' : 'Not Stressed'}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Detector;
