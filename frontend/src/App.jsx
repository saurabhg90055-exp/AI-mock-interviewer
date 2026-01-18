import AudioRecorder from './AudioRecorder';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>🎯 AI Mock Interviewer</h1>
      <p style={{ color: '#a0aec0', marginBottom: '2rem' }}>
        Practice technical interviews with AI-powered feedback
      </p>
      <AudioRecorder />
    </div>
  );
}

export default App;