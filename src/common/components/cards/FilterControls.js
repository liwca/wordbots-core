import React, { Component } from 'react';
import Toggle from 'material-ui/lib/toggle';
import { Range } from 'rc-slider';

class FilterControls extends Component {
  render() {
    const toggleStyle = { marginBottom: 10 };

    return (
      <div>
        <div key="type" style={{marginBottom: 20}}>
          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10
          }}>Card Types</div>

          <Toggle
            style={toggleStyle}
            label="Robots"
            defaultToggled
            onToggle={this.props.onToggleFilter('robots')} />
          <Toggle
            style={toggleStyle}
            label="Events"
            defaultToggled
            onToggle={this.props.onToggleFilter('events')} />
          <Toggle
            style={toggleStyle}
            label="Structures"
            defaultToggled
            onToggle={this.props.onToggleFilter('structures')} />
        </div>
        <div key="cost" style={{marginBottom: 20}}>
          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 20
          }}>Card Cost</div>

          <div>
            <Range
              step={1}
              allowCross={false}
              min={0}
              max={20}
              marks={{
                0: 0,
                5: 5,
                10: 10,
                15: 15,
                20: 20
              }}
              defaultValue={[0, 20]}
              onChange={values => { this.props.onSetCostRange(values); }}
            />
          </div>
        </div>
      </div>
    );
  }
}

const { func } = React.PropTypes;

FilterControls.propTypes = {
  onToggleFilter: func,
  onSetCostRange: func
};

export default FilterControls;
