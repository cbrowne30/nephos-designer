import React, { useContext, useState } from 'react';
import { Box, Button, Keyboard, Menu, Text, CheckBox } from 'grommet';
import { Duplicate, Trash, FormClose } from 'grommet-icons';
import DesignContext from '../DesignContext';
import { addScreen, deleteScreen, newFrom, slugify } from '../design';
import TextInputField from './TextInputField';
import Field from "../Field"
import BooleanProperty from './BooleanProperty';

const ScreenDetails = () => {
  const [auth, setAuth] = useState(false);
  const { changeDesign, design, imports, selected, setSelected } =
    useContext(DesignContext);
  const delet = () => {
    const nextDesign = JSON.parse(JSON.stringify(design));
    const nextScreen = deleteScreen(nextDesign, selected.screen);
    const nextSelected = { screen: nextScreen };
    setSelected(nextSelected);
    changeDesign(nextDesign);
  };

  const duplicate = () => {
    const nextDesign = JSON.parse(JSON.stringify(design));
    const nextSelected = { ...selected };
    addScreen(nextDesign, nextSelected, nextDesign.screens[selected.screen]);
    changeDesign(nextDesign);
    setSelected(nextSelected);
  };

  const newDesignFrom = () => {
    const [nextDesign, nextSelected] = newFrom({
      design,
      externalReferences: false,
      imports,
      selected,
    });
    changeDesign(nextDesign);
    setSelected(nextSelected);
  };

  const onKeyDown = (event) => {
    if (event.metaKey) {
      if (event.keyCode === 8) {
        // delete
        event.preventDefault();
        delet();
      }
    }
  };

  const menuItems = [
    {
      label: `create new design using this Screen`,
      onClick: newDesignFrom,
    },
  ].filter((i) => i);

  const screen = design.screens[selected.screen];
  if (!screen) return null;
  const authRef = {"name": "auth", "onChange": setAuth, "value": auth}
  return (
    <Keyboard target="document" onKeyDown={onKeyDown}>
      <Box border="left">
        <Box
          flex={false}
          direction="row"
          align="center"
          justify="between"
          border="bottom"
        >
          <Menu
            hoverIndicator
            label={
              <Text weight="bold" truncate>
                Screen
              </Text>
            }
            dropProps={{ align: { top: 'bottom', left: 'left' } }}
            items={menuItems}
          />
          <Box flex={false} direction="row" align="center">
            <Button
              title="duplicate"
              tip="duplicate"
              icon={<Duplicate />}
              hoverIndicator
              onClick={duplicate}
            />
            {design.screenOrder.length > 1 && (
              <Button
                title="delete"
                tip="delete"
                icon={<Trash />}
                hoverIndicator
                onClick={delet}
              />
            )}
          </Box>
        </Box>
        <Box flex overflow="auto">
          <Box flex={false}>
            <TextInputField
              name="name"
              componentId={screen.id}
              value={screen.name || ''}
              onChange={(value) => {
                const nextDesign = JSON.parse(JSON.stringify(design));
                nextDesign.screens[selected.screen].name = value;
                nextDesign.screens[selected.screen].path = slugify(value);
                changeDesign(nextDesign);
              }}
            />
            <TextInputField
              name="path"
              componentId={screen.id}
              value={screen.path || ''}
              onChange={(value) => {
                const nextDesign = JSON.parse(JSON.stringify(design));
                nextDesign.screens[selected.screen].path = value;
                changeDesign(nextDesign);
              }}
            />
            <Field key="auth" label="Authentication" htmlFor="auth-check">
            <Box pad="small" direction="row" gap="small">
              <CheckBox
                id="auth-check"
                name="auth-check"
                checked={!!auth}
                onChange={event => setAuth(event.target.checked)}
              />
              {auth === false && (
                <Box
                  title="undefine"
                  pad={{ horizontal: 'xxsmall' }}
                  round="xsmall"
                  hoverIndicator
                  onClick={() => setAuth(undefined)}
                >
                  <FormClose />
                </Box>
              )}
            </Box>
          </Field>
          </Box>
        </Box>
      </Box>
    </Keyboard>
  );
};

export default ScreenDetails;
