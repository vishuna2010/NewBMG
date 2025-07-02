import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css'; // Import Ant Design CSS reset (for v5+)
import './index.css'; // Your custom global styles should come after library styles
import App from './App';
// import reportWebVitals from './reportWebVitals'; // Can be added if needed

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
