import {bare} from './design/bare';

export const getComponentType = (libraries, typeName) => {
  const [libraryName, componentName] = typeName.split('.');
  let component;
  libraries.some(({ name, components }) => {
    component = componentName ? libraryName === name && components[componentName] : components[typeName];
    return !!component;
  });
  return component || undefined;
};

export const displayName = (component) =>
  component.name ||
  component.text ||
  component.props.name ||
  component.props.label ||
  component.props.icon ||
  component.type.split('.')[1] ||
  component.type;

export const getReferenceDesign = (imports, referenceComponent) => {
  if (referenceComponent.props.design)
    return imports
      .filter((i) => i.url === referenceComponent.props.design.url)
      .map((i) => i.design)[0];
  return undefined;
};

export const parseUrlParams = (url) => {
  const params = {};
  (url.split('?')[1] || '').split('&').forEach((p) => {
    const [k, v] = p.split('=');
    params[k] = decodeURIComponent(v);
  });
  return params;
};

export const generateDesignName = () =>
  `${new Date().toLocaleDateString('default', {
    month: 'short',
    day: 'numeric',
  })} Design`;

export const setupDesign = (starter = bare) => {
  let nextId = 1;
  Object.keys(starter.screens).forEach(
    id => (nextId = Math.max(nextId, parseInt(id, 10))),
  );
  Object.keys(starter.components).forEach(
    id => (nextId = Math.max(nextId, parseInt(id, 10))),
  );
  nextId += 1;
  const name = starter.name || generateDesignName();
  return {
    ...starter,
    name,
    nextId,
    version: 3.2,
    created: new Date().toISOString(),
  };
};