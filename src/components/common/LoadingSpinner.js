// d:\Coding\Mast Pharmacy\frontend\src\components\common\LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  let sizeClass = '';
  switch (size) {
    case 'small':
      sizeClass = 'spinner-sm';
      break;
    case 'large':
      sizeClass = 'spinner-lg';
      break;
    default:
      sizeClass = '';
  }

  return (
    <div className={`spinner-container ${color}`}>
      <div className={`spinner ${sizeClass}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
