import {
  Box,
  Button, Grid,
  Heading, Paragraph
} from 'grommet';
import { Download } from 'grommet-icons';
import React, { useContext } from 'react';
import Action from '../Action';
import DesignContext from '../DesignContext';

const Summary = ({ Icon, label, guidance }) => (
  <Box align="center" gap="small" margin={{ top: 'medium' }}>
    <Icon size="large" />
    <Heading level={3} margin="none">
      {label}
    </Heading>
    <Paragraph textAlign="center">{guidance}</Paragraph>
  </Box>
);

const SaveLocally = ({ onClose }) => {
  const { design } = useContext(DesignContext);
  return (
    <Box align="center">
      <Summary
        Icon={Download}
        label="Download"
        guidance={`
        Download the design to a JSON file. You can use this as a separate
        backup copy, inspect and transform it with a program, or share
        it with someone else. You can upload it via the top left control
        that shows all of your designs.
      `}
      />
      <Button
        label="Download"
        hoverIndicator
        href={`data:application/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(design),
        )}`}
        download={`${design.name || 'design'}.json`}
        onClick={() => {
          onClose();
        }}
      />
    </Box>
  );
};

const Share = ({ onClose }) => (
  <Action label="share" full="horizontal" animation="fadeIn" onClose={onClose}>
    <Grid
      fill="horizontal"
      columns={{ count: 'fit', size: 'small' }}
      gap="large"
    >
      <SaveLocally onClose={onClose} />
    </Grid>
  </Action>
);

export default Share;
