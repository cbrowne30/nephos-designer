import React, { useContext } from 'react';
import { Box, Text } from 'grommet';
import DesignContext from '../DesignContext';
import { getDisplayName } from '../design';
import ArrayProperty from './ArrayProperty';

const LinkLabel = ({ selected, value }) => {
  const { design } = useContext(DesignContext);
  let label;
  if (!value || value.length === 0) {
    label = '';
  } else if (value.component) {
    label = getDisplayName(design, value.component);
  } else if (value.screen) {
    label = (design.screens[value.screen] || {}).name; // defensive
  } else if (value.label) {
    label = value.label;
  } else if (Array.isArray(value)) {
    label = value.map((v) => v.label).join(', ');
  } else if (typeof value === 'string') {
    // defensive
    label = value;
  } else {
    label = JSON.stringify(value);
  }
  return (
    <Box pad="small">
      <Text weight={selected ? 'bold' : undefined}>{label}</Text>
    </Box>
  );
};

const LinkProperty = React.forwardRef(
  ({ design, first, name, onChange, linkOptions, sub, value }, ref) => {
    return (
      <ArrayProperty
        ref={ref}
        name={name}
        sub={sub}
        first={first}
        Label={LinkLabel}
        options={linkOptions}
        multiple
        value={value}
        labelKey="label"
        valueKey="key"
        onChange={onChange}
      />
    );
  },
);

export default LinkProperty;
