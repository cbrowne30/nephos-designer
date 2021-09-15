import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  Box,
  Button,
  CheckBox,
  FileInput,
  Header,
  Heading,
  Image,
  Markdown,
  Paragraph,
  RadioButtonGroup,
  Text,
  TextInput,
} from 'grommet';
import { List, Search } from 'grommet-icons';
import { parseUrlParams } from './utils';
import Manage from './Manage';

const tutorials = [
  {
    title: 'introduction',
    thumb:
      'https://us-central1-grommet-designer.cloudfunctions.net/images/eric-soderberg-hpe-com/designer-tutorial-introduction.png',
    url: 'https://us-central1-grommet-designer.cloudfunctions.net/images/eric-soderberg-hpe-com/designer%20introduction%202a.mp4',
  },
];

const inspirations = [
  {
    title: 'HPE design system',
    url: 'https://designer.grommet.io/?id=HPE-design-system-hpedesignsystem-hpe-com',
  },
  {
    title: 'Card',
    url: 'https://designer.grommet.io/?id=Card-eric-soderberg-hpe-com',
  },
];

const ThumbnailContainer = styled.div`
  transform: scale(0.25);
  transform-origin: top left;
  pointer-events: none;
`;

const ThumbnailFrame = styled.iframe`
  border: none;
`;

const Thumbnail = ({ title, url }) => {
  const [show, setShow] = useState();
  const ref = useRef();

  // only show content when visible to the user
  useEffect(() => {
    const scroller = ref.current.parentNode.parentNode;
    const update = () => {
      const scrollerRect = scroller.getBoundingClientRect();
      const rect = ref.current.getBoundingClientRect();
      setShow(rect.right > scrollerRect.left && rect.left < scrollerRect.right);
    };
    update();
    let timer;
    const delay = () => {
      clearTimeout(timer);
      timer = setTimeout(update, 1000);
    };
    scroller.addEventListener('scroll', delay);
    return () => {
      scroller.removeEventListener('scroll', delay);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Box ref={ref} gap="xsmall">
      <Box
        width="medium"
        height="small"
        round="xsmall"
        background="background-front"
        overflow="hidden"
      >
        {show && (
          <ThumbnailContainer>
            <ThumbnailFrame
              width="1536"
              height="768"
              title={title}
              src={`${url}&mode=thumb`}
            />
          </ThumbnailContainer>
        )}
      </Box>
      <Text weight="bold" size="large">
        {title}
      </Text>
    </Box>
  );
};

const Start = ({
  chooseDesign,
  colorMode,
  createDesign,
  importDesign,
  rtl,
  setColorMode,
  setRtl,
}) => {
  const [designs, setDesigns] = useState([]);
  const [designsFetched, setDesignsFetched] = useState([]);
  const [readme, setReadme] = useState();
  const [search, setSearch] = useState();
  const [error, setError] = useState();
  const [manage, setManage] = useState();

  useEffect(() => {
    document.title = 'Grommet Designer';
  }, []);

  // load design names from local storage
  useEffect(() => {
    let stored = localStorage.getItem('designs');
    if (stored) {
      // prune out non-existing designs
      const nextDesigns = JSON.parse(stored).filter((name) =>
        localStorage.getItem(name),
      );
      setDesigns(nextDesigns);
      localStorage.setItem('designs', JSON.stringify(nextDesigns));

      // prune out orphaned designs
      for (let i = 0; i < localStorage.length; i++) {
        const name = localStorage.key(i);
        if (!nextDesigns.includes(name)) {
          stored = localStorage.getItem(name);
          try {
            const design = JSON.parse(stored);
            if (
              design.screens &&
              design.components &&
              design.version &&
              design.name
            ) {
              // looks like a design, but it isn't in 'designs', remove it
              console.log('Removed orphan design:', name);
              localStorage.removeItem(name);
            }
          } catch {
            // no-op
          }
        }
      }
    }
  }, []);

  const urls = useMemo(() => {
    const result = {};
    designs.forEach((name) => {
      const stored = localStorage.getItem(name);
      const design = JSON.parse(stored);
      result[name] = design.screens
        ? `/?name=${encodeURIComponent(name)}`
        : `/?id=${encodeURIComponent(design.id)}`;
    });
    return result;
  }, [designs]);

  // load previously fetched designs from local storage
  useEffect(() => {
    let stored = localStorage.getItem('designs-fetched');
    if (stored) {
      setDesignsFetched(JSON.parse(stored));
    }
  }, []);

  // get README from GitHub
  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/grommet/grommet-designer/master/README.md',
    ).then((response) => {
      if (response.ok) {
        response
          .text()
          .then((text) => setReadme(text.split('\n').splice(8).join('\n')));
      }
    });
  }, []);

  return (
    <Box fill direction="row-responsive" gap="medium" border="between">
      <Box align="start" pad="large" height="100vh">
        <Heading margin={{ top: 'none' }}>grommet designer</Heading>
        <Paragraph size="xlarge">design with grommet components</Paragraph>
        <Button
          title="create a new design"
          primary
          label="Create"
          href="/_new"
          onClick={(event) => {
            if (!event.ctrlKey && !event.metaKey) {
              event.preventDefault();
              createDesign();
            }
          }}
        />
        <Box flex />
        {error && (
          <Box
            background={{ color: 'status-error', opacity: 'weak' }}
            pad="small"
          >
            <Text>{error}</Text>
          </Box>
        )}
        <FileInput
          accept=".json"
          messages={{
            dropPrompt: 'Import - drop design file here',
          }}
          onChange={(event) => {
            setError(undefined);
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const nextDesign = JSON.parse(reader.result);
                importDesign(nextDesign);
              } catch (e) {
                setError(e.message);
              }
            };
            reader.readAsText(event.target.files[0]);
          }}
        />
        <Box
          flex={false}
          direction="row"
          justify="center"
          gap="medium"
          margin={{ top: 'large' }}
        >
          <RadioButtonGroup
            id="themeMode"
            name="themeMode"
            direction="row"
            gap="medium"
            options={['dark', 'light']}
            value={colorMode || ''}
            onChange={(event) => {
              setColorMode(event.target.value);
            }}
          />
          <CheckBox
            label="right to left"
            checked={rtl || false}
            onChange={() => setRtl(!rtl)}
          />
        </Box>
      </Box>

      <Box
        flex
        fill
        overflow="auto"
        pad={{ vertical: 'medium', horizontal: 'large' }}
        gap="large"
      >
        {designs && designs.length > 0 && (
          <Box flex={false}>
            <Header>
              <Heading level={2}>my designs</Heading>
              {designs.length > 5 && (
                <Box
                  basis="medium"
                  flex={false}
                  direction="row"
                  align="center"
                  justify="end"
                  gap="small"
                >
                  <TextInput
                    icon={<Search />}
                    reverse
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <Button icon={<List />} onClick={() => setManage(true)} />
                </Box>
              )}
            </Header>
            <Box direction="row" overflow="auto" gap="medium" border="right">
              {designs
                .filter(
                  (name) =>
                    !search || name.search(new RegExp(search, 'i')) !== -1,
                )
                .map((name, index) => {
                  const url = urls[name];
                  return (
                    <Button
                      key={name}
                      plain
                      href={`${url}&mode=edit`}
                      onClick={(event) => {
                        if (!event.ctrlKey && !event.metaKey) {
                          event.preventDefault();
                          // if we've offloaded this design, re-load it
                          const stored = localStorage.getItem(name);
                          const design = JSON.parse(stored);
                          if (!design.screens) chooseDesign({ id: design.id });
                          else chooseDesign({ name });
                        }
                      }}
                    >
                      <Thumbnail title={name} url={url} />
                    </Button>
                  );
                })}
            </Box>
          </Box>
        )}

        {designsFetched && designsFetched.length > 0 && (
          <Box flex={false}>
            <Header>
              <Heading level={2}>fetched designs</Heading>
            </Header>
            <Box direction="row" overflow="auto" gap="medium" border="right">
              {designsFetched.map(({ name, url }) => {
                return (
                  <Button
                    key={name}
                    plain
                    href={url}
                    onClick={(event) => {
                      if (!event.ctrlKey && !event.metaKey) {
                        event.preventDefault();
                        chooseDesign({ id: parseUrlParams(url).id });
                      }
                    }}
                  >
                    <Thumbnail title={name} url={url} />
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}

        <Box flex={false} alignSelf="start">
          <Header alignSelf="stretch">
            <Heading level={2}>tutorials</Heading>
          </Header>
          {tutorials.map(({ thumb, title, url }) => (
            <Button key={title} plain href={url} target="_blank">
              <Box gap="xsmall">
                <Box
                  width="medium"
                  height="small"
                  round="xsmall"
                  background="background-front"
                  overflow="hidden"
                >
                  <Image src={thumb} fit="contain" />
                </Box>
                <Text weight="bold" size="large">
                  {title}
                </Text>
              </Box>
            </Button>
          ))}
        </Box>

        <Box flex={false}>
          <Heading level={2}>inspiration</Heading>
          <Box direction="row" overflow="auto" gap="medium">
            {inspirations.map(({ title, url }) => (
              <Button key={title} plain href={`${url}&mode=edit`}>
                <Thumbnail title={title} url={url} />
              </Button>
            ))}
          </Box>
        </Box>

        {readme && (
          <Box flex={false}>
            <Markdown>{readme}</Markdown>
          </Box>
        )}
        {manage && (
          <Manage
            onClose={() => {
              setManage(false);
              setDesigns([...designs]); // trigger re-load of offloaded state
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Start;
