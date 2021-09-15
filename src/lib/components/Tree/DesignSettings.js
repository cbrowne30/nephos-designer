import React, { useCallback, useContext, useState } from 'react';
import {
  Anchor,
  Box,
  Button,
  Heading,
  Paragraph,
  RadioButtonGroup,
  Text,
  TextArea,
  TextInput,
} from 'grommet';
import { Add, Trash } from 'grommet-icons';
import Action from '../Action';
import Field from '../Field';
import themes from '../themes';
import DesignContext from '../DesignContext';

const themeSuggestions = themes.map(
  ({ label, name, designerUrl, packageName, jsUrl }) => {
    const value = jsUrl || designerUrl || packageName;
    return {
      label: (
        <Box pad={{ horizontal: 'small', vertical: 'xsmall' }} gap="xsmall">
          <Text weight="bold">{label || name}</Text>
          <Text>{value}</Text>
        </Box>
      ),
      value,
    };
  },
);

const DesignSettings = ({ onClose: onCloseProp }) => {
  const { changeDesign, design, theme } = useContext(DesignContext);
  const [tmpDesign, setTmpDesign] = useState(
    JSON.parse(JSON.stringify(design)),
  );
  const onClose = useCallback(() => {
    changeDesign(tmpDesign);
    onCloseProp();
  }, [changeDesign, onCloseProp, tmpDesign]);

  return (
    <Action label="design" onClose={onClose}>
      <Box flex={false} gap="medium">
        <Field label="Name" htmlFor="name">
          <TextInput
            id="name"
            name="name"
            plain
            value={tmpDesign.name || ''}
            onChange={(event) => {
              const nextDesign = JSON.parse(JSON.stringify(tmpDesign));
              nextDesign.name = event.target.value;
              setTmpDesign(nextDesign);
            }}
            style={{ textAlign: 'end' }}
          />
        </Field>
        {tmpDesign.derivedFromId && (
          <Box
            align="end"
            margin={{ vertical: 'xsmall', horizontal: 'medium' }}
          >
            <Text size="small">
              derived from{' '}
              <Anchor
                size="small"
                label={tmpDesign.derivedFromId}
                href={`//designer.grommet.io?${tmpDesign.derivedFromId}`}
              />
            </Text>
          </Box>
        )}

        <Box>
          <Box direction="row" justify="between" align="center">
            <Heading level={3} size="small">
              Imports
            </Heading>
            <Button
              title="add an import"
              tip="add an import"
              icon={<Add />}
              hoverIndicator
              onClick={() => {
                const nextDesign = JSON.parse(JSON.stringify(tmpDesign));
                if (!nextDesign.imports) nextDesign.imports = [];
                nextDesign.imports.push({});
                setTmpDesign(nextDesign);
              }}
            />
          </Box>
          {tmpDesign.imports && (
            <Box flex={false}>
              {tmpDesign.imports.map((impor, index) => (
                <Box
                  key={index}
                  direction="row"
                  align="start"
                  justify="between"
                >
                  <Box flex="grow">
                    <Field htmlFor={`url-${index}`}>
                      <TextInput
                        id={`url-${index}`}
                        name={`url-${index}`}
                        plain
                        placeholder="url"
                        value={impor.url}
                        onChange={(event) => {
                          const nextDesign = JSON.parse(
                            JSON.stringify(tmpDesign),
                          );
                          nextDesign.imports[index].url = event.target.value;
                          setTmpDesign(nextDesign);
                        }}
                        style={{ textAlign: 'end' }}
                      />
                    </Field>
                  </Box>
                  <Button
                    title="remove import"
                    tip="remove import"
                    icon={<Trash />}
                    hoverIndicator
                    onClick={() => {
                      const nextDesign = JSON.parse(JSON.stringify(tmpDesign));
                      nextDesign.imports.splice(index, 1);
                      setTmpDesign(nextDesign);
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box>
          <Box direction="row" justify="between" align="center">
            <Heading level={3} size="small">
              Theme
            </Heading>
            <Anchor
              href={tmpDesign.theme || 'https://theme-designer.grommet.io'}
              target="_blank"
              rel="noopener noreferrer"
            >
              theme designer
            </Anchor>
          </Box>

          <Field label="url" htmlFor="theme" align="start">
            <TextInput
              id="theme"
              name="theme"
              plain
              value={tmpDesign.theme || ''}
              suggestions={themeSuggestions}
              onChange={(event) => {
                const themeValue = event.target.value;
                const nextDesign = JSON.parse(JSON.stringify(tmpDesign));
                nextDesign.theme = themeValue;
                setTmpDesign(nextDesign);
              }}
              onSelect={({ suggestion }) => {
                const nextDesign = JSON.parse(JSON.stringify(tmpDesign));
                nextDesign.theme = suggestion.value;
                setTmpDesign(nextDesign);
              }}
              style={{ textAlign: 'end' }}
            />
          </Field>

          {theme && typeof theme.global.colors.background === 'object' && (
            <Field label="mode" htmlFor="themeMode">
              <RadioButtonGroup
                id="themeMode"
                name="themeMode"
                direction="row"
                gap="medium"
                margin={{ right: 'small' }}
                options={['dark', 'light']}
                value={tmpDesign.themeMode}
                onChange={(event) => {
                  const nextDesign = JSON.parse(JSON.stringify(tmpDesign));
                  nextDesign.themeMode = event.target.value;
                  setTmpDesign(nextDesign);
                }}
              />
            </Field>
          )}
        </Box>

        <Box>
          <Box direction="row" justify="between" align="center">
            <Heading level={3} size="small">
              Data
            </Heading>
            <Button
              title="add a data source"
              tip="add a data source"
              icon={<Add />}
              hoverIndicator
              onClick={() => {
                const nextDesign = JSON.parse(JSON.stringify(tmpDesign));
                if (!nextDesign.data) {
                  nextDesign.data = { data: '' };
                } else {
                  nextDesign.data[
                    `data-${Object.keys(nextDesign.data).length}`
                  ] = '';
                }
                setTmpDesign(nextDesign);
              }}
            />
          </Box>
          {tmpDesign.data && (
            <Box flex={false}>
              <Paragraph margin={{ horizontal: 'medium' }}>
                Data sources can be used to provide consistent content across
                your design. These can be JSON or a URL to a REST+json API
                endpoint. Reference the data using curly braces to wrap a path
                notation within component text. For example:{' '}
                {`{<dataname>.<property>}`}.
              </Paragraph>
              {Object.keys(tmpDesign.data).map((key, index) => (
                <Box key={key} direction="row" align="start">
                  <Box>
                    <Field label="Name" htmlFor={`name-${index}`}>
                      <TextInput
                        id={`name-${index}`}
                        name={`name-${index}`}
                        plain
                        value={key || ''}
                        onChange={(event) => {
                          if (event.target.value !== key) {
                            const nextDesign = JSON.parse(
                              JSON.stringify(tmpDesign),
                            );
                            nextDesign.data[event.target.value] =
                              nextDesign.data[key];
                            delete nextDesign.data[key];
                            setTmpDesign(nextDesign);
                          }
                        }}
                        style={{ textAlign: 'end' }}
                      />
                    </Field>
                    <Field label="Source" htmlFor={`source-${index}`}>
                      <TextArea
                        id={`source-${index}`}
                        name={`source-${index}`}
                        plain
                        cols={30}
                        rows={4}
                        value={tmpDesign.data[key]}
                        onChange={(event) => {
                          const nextDesign = JSON.parse(
                            JSON.stringify(tmpDesign),
                          );
                          nextDesign.data[key] = event.target.value;
                          setTmpDesign(nextDesign);
                        }}
                        style={{ textAlign: 'end' }}
                      />
                    </Field>
                  </Box>
                  <Button
                    title="delete data source"
                    tip="delete data source"
                    icon={<Trash />}
                    hoverIndicator
                    onClick={() => {
                      const nextDesign = JSON.parse(JSON.stringify(tmpDesign));
                      delete nextDesign.data[key];
                      if (Object.keys(nextDesign.data).length === 0) {
                        delete nextDesign.data;
                      }
                      setTmpDesign(nextDesign);
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Action>
  );
};

export default DesignSettings;
