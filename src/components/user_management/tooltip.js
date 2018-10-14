import React from 'react';

/**
 * Tooltip component
 * @property {number} width. Tooltip width
 * @property {string} background. Background for tooltip
 * @property {string} text. Text which placed into tooltip
 * @property {object} position. Event coords {x, y}
 */
export default class Tooltip extends React.Component {
    render() {

        return (
            <div style={{width: this.props.width + 'px',
                background: this.props.background,
                fontSize: '12px',
                position: 'absolute',
                top: this.props.position.y -65,
                left: this.props.position.x,
                zIndex: 1000,
                padding: '5px 0px',
                textAlign: 'center',
                color: 'white'
            }}
            >
                {this.props.text}
            </div>
        );
    }
}

Tooltip.propTypes = {
    width: React.PropTypes.number,
    background: React.PropTypes.string,
    text: React.PropTypes.string,
    position: React.PropTypes.object
};

Tooltip.defaultProps = {
    width: 100,
    background: 'none',
    text: '',
    position: {x: 0, y: 0}
}