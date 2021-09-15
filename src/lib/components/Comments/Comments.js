import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Button,
  Form,
  FormField,
  Heading,
  Markdown,
  Text,
  TextArea,
} from 'grommet';
import { Blank, Close, Edit, Trash } from 'grommet-icons';
import DesignContext from '../DesignContext';
import { apiUrl } from '../design';

const friendlyDate = (iso) => {
  const date = new Date(iso);
  const now = new Date();
  if (date.getFullYear() !== now.getFullYear()) {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
  if (date.getMonth() !== now.getMonth()) {
    return date.toLocaleString('default', { month: 'long', day: 'numeric' });
  }
  if (date.getDate() !== now.getDate()) {
    return date.toLocaleString('default', { month: 'long', day: 'numeric' });
  }
  return date.toLocaleString('default', { hour: 'numeric', minute: '2-digit' });
};

const breakLines = (text) => text.replace(/(\S)\n/g, (_, c) => `${c}  \n`);

const Comments = () => {
  const { design, selected, setMode, setSelected } = useContext(DesignContext);
  const [comments, setComments] = useState(design.comments);
  const [active, setActive] = useState();
  const [adding, setAdding] = useState();
  const [addValue, setAddValue] = useState({ text: '' });
  const [deleting, setDeleting] = useState();
  const [editing, setEditing] = useState();
  const [editValue, setEditValue] = useState({ text: '' });
  const addAreaRef = useRef();

  useEffect(() => {
    if (design.id) {
      // TODO: password
      fetch(`${apiUrl}/${design.id}/comments`).then((response) => {
        if (response.ok) {
          response.json().then((nextComments) => setComments(nextComments));
        }
      });
    }
  }, [design.id]);

  // focus on add TextArea to start with
  useEffect(() => addAreaRef.current.focus(), []);

  // scroll to bottom when comments change but add TextArea has focus
  useEffect(() => {
    if (document.activeElement === addAreaRef.current) {
      addAreaRef.current.scrollIntoView();
    }
  }, [comments]);

  const addComment = useCallback(
    (comment) => {
      setAdding(true);
      const nextComments = [...comments];
      comment.selected = selected;
      nextComments.push(comment);
      setComments(nextComments);
      setAddValue({ text: '' });

      const body = JSON.stringify(comment);
      fetch(`${apiUrl}/${design.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Content-Length': body.length,
        },
        body,
      }).then((response) => {
        if (response.ok) {
          response.json().then(({ id, createdAt }) => {
            comment.id = id;
            comment.createdAt = createdAt;
            setAdding(false);
          });
        }
      });
    },
    [comments, design.id, selected],
  );

  const updateComment = useCallback(
    (comment) => {
      const nextComments = [...comments];
      const index = nextComments.findIndex((c) => c.id === comment.id);
      nextComments[index] = comment;
      comment.selected = selected;
      setComments(nextComments);
      setEditValue(undefined);
      setEditing(false);

      const body = JSON.stringify(comment);
      fetch(`${apiUrl}/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Content-Length': body.length,
        },
        body,
      });
    },
    [comments, selected],
  );

  const deleteComment = useCallback(
    (id) => {
      const nextComments = comments.filter((c) => c.id !== id);
      setComments(nextComments);
      setDeleting(undefined);
      fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    },
    [comments],
  );

  const title = `close comments ${
    /Mac/i.test(navigator.platform) ? '⌘' : 'Ctrl+'
  };`;

  return (
    <Box height="100vh" border="left">
      <Box flex={false} border="bottom">
        <Box
          flex={false}
          direction="row"
          align="center"
          justify="between"
          border="bottom"
          pad={{ left: 'small' }}
        >
          <Heading size="18px" margin="none" truncate>
            Comments
          </Heading>
          <Button
            title={title}
            tip={title}
            icon={<Close />}
            onClick={() => setMode(design.local ? 'edit' : 'preview')}
          />
        </Box>
      </Box>

      <Box flex overflow="auto">
        <Box flex={false}>
          {comments ? (
            comments.map((c) => (
              <Box
                key={c.createdAt}
                border="bottom"
                background={
                  active && c.id === active ? 'background-front' : undefined
                }
                focusIndicator={false}
                onClick={() => {
                  if (active !== c.id) {
                    setActive(c.id);
                    setSelected(c.selected);
                  }
                }}
              >
                <Box direction="row" align="center" justify="between">
                  <Box pad="small" flex>
                    <Text size="small" color="text-weak">
                      {c.createdAt ? friendlyDate(c.createdAt) : '-'}
                    </Text>
                  </Box>
                  {c.id && active === c.id ? (
                    <Box direction="row">
                      {c.id && (
                        <Button
                          title="edit comment"
                          tip="edit comment"
                          icon={<Edit color="text-xweak" />}
                          hoverIndicator
                          onClick={() => {
                            if (editing === c.id) setEditing(undefined);
                            else {
                              setEditing(c.id);
                              setEditValue(c);
                            }
                          }}
                        />
                      )}
                      {c.id && deleting === c.id && (
                        <Button
                          title="confirm delete"
                          tip="confirm delete"
                          icon={<Trash color="status-critical" />}
                          hoverIndicator
                          onClick={() => deleteComment(c.id)}
                        />
                      )}
                      <Button
                        title="delete comment"
                        tip="delete comment"
                        icon={<Trash color="text-xweak" />}
                        hoverIndicator
                        onClick={() =>
                          setDeleting(deleting === c.id ? undefined : c.id)
                        }
                      />
                    </Box>
                  ) : (
                    <Button icon={<Blank />} disabled />
                  )}
                </Box>
                {c.id && editing === c.id ? (
                  <Form
                    value={editValue}
                    onChange={setEditValue}
                    onSubmit={({ value }) => updateComment(value)}
                  >
                    <Box margin={{ bottom: 'medium' }}>
                      <FormField name="text" required>
                        <TextArea name="text" />
                      </FormField>
                      <Box alignSelf="center" pad="small">
                        {adding ? (
                          <Text>updating ...</Text>
                        ) : (
                          <Button
                            type="submit"
                            primary
                            label="update comment"
                          />
                        )}
                      </Box>
                    </Box>
                  </Form>
                ) : (
                  <Box pad="small">
                    <Markdown>{breakLines(c.text)}</Markdown>
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Box pad="small" animation="pulse" align="center">
              <Text color="text-xweak">Loading ...</Text>
            </Box>
          )}
          <Form
            value={addValue}
            onChange={setAddValue}
            onSubmit={({ value }) => addComment(value)}
          >
            <Box
              pad={{ vertical: 'small' }}
              background={active ? undefined : 'background-front'}
            >
              <FormField name="text" required>
                <TextArea
                  ref={addAreaRef}
                  name="text"
                  onFocus={() => setActive(undefined)}
                />
              </FormField>
              <Box alignSelf="center" pad="small">
                {adding ? (
                  <Text>adding ...</Text>
                ) : (
                  <Button type="submit" label="add comment" />
                )}
              </Box>
            </Box>
          </Form>
        </Box>
      </Box>
    </Box>
  );
};

export default Comments;
