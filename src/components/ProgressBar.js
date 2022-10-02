import React from 'react'

function ProgressBar(props) {
    const { bgcolor, completed } = props;

    const containerStyles = {
        height: 50,
        width: '100%',
        backgroundColor: "#e0e0de",
        borderRadius: 50,
        margin: "auto"
      }
    
      const fillerStyles = {
        height: '100%',
        width: `${completed}%`,
        backgroundColor: bgcolor,
        borderRadius: 'inherit',
        textAlign: 'right',
        transition: 'width 1s ease-in-out'
      }
    
      const labelStyles = {
        padding: "5px 10px 5px",
        color: 'white',
        fontWeight: 'bold',
        height: "100%",
        fontSize: "1.5em",
        display: "inline-block"
      }
  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
        <span style={labelStyles}>{`${completed}%`}</span>
      </div>
    </div>
    )
}

export default ProgressBar




