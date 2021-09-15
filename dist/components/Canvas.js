"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.array.flat.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.split.js");

require("core-js/modules/es.string.match.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.string.includes.js");

require("core-js/modules/es.string.starts-with.js");

var _react = _interopRequireWildcard(require("react"));

var _reactDom = require("react-dom");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _grommet = require("grommet");

var _Icon = _interopRequireDefault(require("./libraries/designer/Icon"));

var _DesignContext = _interopRequireDefault(require("./DesignContext"));

var _design = require("./design");

var _utils = require("./utils");

var _useDebounce = _interopRequireDefault(require("./useDebounce"));

var _templateObject, _templateObject2;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

const InlineInput = _styledComponents.default.input(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n  box-sizing: border-box;\n  font-size: inherit;\n  font-family: inherit;\n  line-height: inherit;\n  border: none;\n  -webkit-appearance: none;\n  outline: none;\n  background: transparent;\n  color: inherit;\n  font-weight: inherit;\n  text-align: inherit;\n  margin: 0;\n  padding: 0;\n  width: 100%;\n  height: auto;\n  resize: none;\n  ::-webkit-search-decoration {\n    -webkit-appearance: none;\n  }\n"])));

const Placeholder = _styledComponents.default.div(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n  pointer-events: none;\n"])));

const arrayExp = /(.+)\[(\d+)\]/; // converts something like 'data[0].details' to: ['data', 0, 'details']

const parsePath = text => text.split('.').map(part => {
  const match = part.match(arrayExp);

  if (match) {
    return [match[1], parseInt(match[2], 10)];
  }

  return part;
}).flat();

const find = (data, path) => {
  const pathParts = typeof path === 'string' ? parsePath(path) : path;
  let value;
  if (typeof data === 'object') value = data[pathParts[0]];else if (Array.isArray(data) && typeof pathParts[0] === 'number') value = data[pathParts[0]];else if (typeof data === 'string' && pathParts.length === 1 && !pathParts[0]) value = data;

  if (value && pathParts.length > 1) {
    if (Array.isArray(value) || typeof value === 'object') {
      return find(value, pathParts.slice(1));
    }
  }

  return value;
};

const replace = (text, datas, contextPath) => (text || '').replace(/\{[^}]*\}/g, match => {
  const dataPath = parsePath(match.slice(1, match.length - 1));
  const path = contextPath ? [...contextPath, ...dataPath] : dataPath;
  let replaced;
  datas.some(data => (replaced = find(data, path)) !== undefined);

  if (replaced !== undefined) {
    if (typeof replaced === 'function') {
      // need to get the context to call this function from
      const funcPath = [...path];
      funcPath.pop();
      let funcContext;
      datas.some(data => (funcContext = find(data, funcPath)) !== undefined);
      return replaced.call(funcContext);
    }

    return replaced;
  }

  return match;
});

const Canvas = () => {
  const responsiveSize = (0, _react.useContext)(_grommet.ResponsiveContext);
  const {
    changeDesign,
    data,
    design,
    imports,
    mode,
    selected,
    setSelected,
    theme
  } = (0, _react.useContext)(_DesignContext.default); // inlineEdit is the component id of the component being edited inline

  const [inlineEdit, setInlineEdit] = (0, _react.useState)(); // inlineEditText is used to debounce inline edit changes

  const [inlineEditText, setInlineEditText] = (0, _useDebounce.default)(undefined, text => {
    const nextDesign = JSON.parse(JSON.stringify(design));
    const component = nextDesign.components[selected.component];
    component.text = text;
    changeDesign(nextDesign);
  });
  const [dragging, setDragging] = (0, _react.useState)();
  const [dropTarget, setDropTarget] = (0, _react.useState)();
  const [dropAt, setDropAt] = (0, _react.useState)();
  const [dirtyData, setDirtyData] = (0, _react.useState)({});
  const grommetRef = (0, _react.useRef)();
  const inputRef = (0, _react.useRef)();
  const rendered = (0, _react.useRef)({}); // referenced maps rendered referenced component to its Reference

  const referenced = (0, _react.useRef)({});
  const [initialize, setInitialize] = (0, _react.useState)({});
  const libraries = (0, _react.useMemo)(() => imports.filter(i => i.library).map(i => i.library), [imports]); // clear inline edit when selection changes

  (0, _react.useEffect)(() => {
    if (inlineEdit && inlineEdit !== selected.component) {
      setInlineEdit(undefined);
    }
  }, [inlineEdit, selected.component]); // set Input height based on contents

  (0, _react.useEffect)(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = "".concat(inputRef.current.scrollHeight, "px");
    }
  });

  const _setHide = (id, hide) => {
    const nextDesign = JSON.parse(JSON.stringify(design));
    nextDesign.components[id].hide = hide;
    changeDesign(nextDesign);
  };

  const moveComponent = () => {
    const nextDesign = JSON.parse(JSON.stringify(design));
    const parent = (0, _design.getParent)(nextDesign, dragging);
    const index = parent.children.indexOf(dragging);
    const nextParent = nextDesign.components[dropTarget];
    if (!nextParent.children) nextParent.children = [];
    const nextIndex = dropAt !== undefined ? nextParent.children.indexOf(dropAt) : nextParent.children.length;
    parent.children.splice(index, 1);
    nextParent.children.splice(nextIndex, 0, dragging);
    setDragging(undefined);
    setDropTarget(undefined);
    setDropAt(undefined);
    changeDesign(nextDesign);
  };

  const followLink = (0, _react.useCallback)(function (to) {
    let {
      dataContextPath,
      nextRef
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (Array.isArray(to)) {
      // when to is an Array, lazily create nextDesign and re-use
      const ref = {};
      to.forEach(t => followLink(t, {
        dataContextPath,
        nextRef: ref
      }));
      if (ref.design) changeDesign(ref.design);
    } else if (to.control === 'toggleThemeMode') {
      const nextDesign = (nextRef === null || nextRef === void 0 ? void 0 : nextRef.design) || JSON.parse(JSON.stringify(design));
      nextDesign.themeMode = design.themeMode === 'dark' ? 'light' : 'dark';
      nextRef ? nextRef.design = nextDesign : changeDesign(nextDesign);
    } else if (to.component) {
      let target = design.components[to.component]; // if we have rendered this via a Reference, use the Reference

      if (referenced.current[target.id]) target = design.components[referenced.current[target.id]];
      let type; // if this is a reference, check the target type

      if (!target) type = {};else if (target.type === 'designer.Reference') {
        const referencedComponent = design.components[target.props.component];
        type = (0, _utils.getComponentType)(libraries, referencedComponent.type);
      } else type = (0, _utils.getComponentType)(libraries, target.type);
      const {
        hideable,
        selectable
      } = type;

      if (selectable) {
        const nextDesign = (nextRef === null || nextRef === void 0 ? void 0 : nextRef.design) || JSON.parse(JSON.stringify(design));
        const component = nextDesign.components[target.id];
        component.props.active = component.props.active + 1;

        if (component.props.active > component.children.length) {
          component.props.active = 1;
        }

        nextRef ? nextRef.design = nextDesign : changeDesign(nextDesign);
      } else if (hideable) {
        const nextDesign = (nextRef === null || nextRef === void 0 ? void 0 : nextRef.design) || JSON.parse(JSON.stringify(design));
        nextDesign.components[target.id].hide = !target.hide;
        nextRef ? nextRef.design = nextDesign : changeDesign(nextDesign);
        if (target.hide) setSelected(_objectSpread(_objectSpread({}, to), {}, {
          dataContextPath
        }));
      } else if (target) {
        // might not have anymore
        setSelected(_objectSpread(_objectSpread({}, to), {}, {
          dataContextPath
        }));
      }
    } else {
      if (design.screens[to.screen]) {
        // might not have anymore
        setSelected(_objectSpread(_objectSpread({}, to), {}, {
          dataContextPath
        }));
      }
    }
  }, [design, libraries, setSelected, changeDesign]);
  const followLinkOption = (0, _react.useCallback)(function (options, selected) {
    let {
      nextRef
    } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    const nextDesign = (nextRef === null || nextRef === void 0 ? void 0 : nextRef.design) || JSON.parse(JSON.stringify(design)); // figure out which link to use, if any

    Object.keys(options).filter(n => options[n]).forEach(name => {
      // function shared by array and non-array cases
      const updateLink = link => {
        if (link.control) {
          if (link.control === 'toggleThemeMode') {
            nextDesign.themeMode = design.themeMode === 'dark' ? 'light' : 'dark';
          }
        } else {
          const target = design.components[link.component];
          const hideable = target && (0, _utils.getComponentType)(libraries, target.type).hideable;
          const selectable = target && (0, _utils.getComponentType)(libraries, target.type).selectable;

          if (selectable) {
            const component = nextDesign.components[target.id]; // -link-checked- cases

            if (name === '-unchecked-' && !selected) component.props.active = 1;else if (name === '-checked-' && selected) component.props.active = 2;else if (name === '-both-') component.props.active = component.props.active + 1;

            if (component.props.active > component.children.length) {
              component.props.active = 1;
            }

            nextRef ? nextRef.design = nextDesign : changeDesign(nextDesign);
          } else if (hideable) {
            let hide; // -link-checked- cases

            if (name === '-checked-') hide = !selected;else if (name === '-unchecked-') hide = selected; // undefined ok
            else if (name === '-both-') hide = !selected; // -link-option- cases
            else if (name === '-any-') hide = !selected || !selected.length;else if (name === '-none-') hide = Array.isArray(selected) ? !!selected.length && selected[0] !== name : !!selected && selected !== name;else hide = Array.isArray(selected) ? !selected.includes(name) : selected !== name;
            if (hide !== undefined) nextDesign.components[target.id].hide = hide;
          }
        }
      };

      if (Array.isArray(options[name])) options[name].forEach(updateLink);else updateLink(options[name]);
    });
    nextRef ? nextRef.design = nextDesign : changeDesign(nextDesign);
  }, [design, libraries, changeDesign]); // Initialize components who have asked for it, one at a time in case
  // they affect others

  (0, _react.useEffect)(() => {
    if (Object.keys(initialize).length) {
      const id = Object.keys(initialize)[0];
      const component = initialize[id];
      const type = (0, _utils.getComponentType)(libraries, component.type);
      type.initialize(component, {
        followLinkOption
      });

      const nextInitialize = _objectSpread({}, initialize);

      delete nextInitialize[id];
      setInitialize(nextInitialize);
    }
  }, [followLinkOption, initialize, libraries]);

  const renderRepeater = (component, type, _ref) => {
    let {
      dataContextPath
    } = _ref;
    const {
      children,
      designProps,
      props: {
        count
      }
    } = component;
    const dataPath = designProps ? designProps.dataPath : undefined;
    let contents;

    if ((children === null || children === void 0 ? void 0 : children.length) === 1) {
      if (data && dataPath) {
        const path = dataContextPath ? [...dataContextPath, ...parsePath(dataPath)] : parsePath(dataPath);
        const dataValue = find(data, path);

        if (dataValue && Array.isArray(dataValue)) {
          contents = dataValue.map((_, index) => renderComponent(children[0], {
            dataContextPath: [...path, index],
            key: "".concat(component.id, "-").concat(index)
          }));
        }
      }

      if (!contents) {
        contents = [];

        for (let i = 0; i < count; i += 1) {
          contents.push(renderComponent(children[0], {
            dataContextPath,
            key: "".concat(component.id, "-").concat(i)
          }));
        }
      }
    } else if (!children || children.length === 0) {
      contents = type.placeholder;
    }

    return contents || null;
  };

  const nextRendered = {};

  const renderComponent = function renderComponent(id) {
    var _specialProps, _parent$children;

    let {
      dataContextPath,
      datum,
      key,
      referenceDesign: referenceDesignProp
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let component = (referenceDesignProp || design).components[id];

    if (!component) {
      console.warn("Missing component ".concat(id));
      return null;
    } // don't render if hiding at this size


    if (component.responsive && component.responsive.hide && component.responsive.hide.includes(responsiveSize)) return null;
    let responsiveProps = component.responsive && component.responsive[responsiveSize] && component.responsive[responsiveSize].props;
    let mergedProps = responsiveProps ? _objectSpread(_objectSpread({}, component.props), responsiveProps) : component.props;
    let parent;
    let referenceDesign = referenceDesignProp;
    let hide = !component || component.hide;

    if (component && (component.type === 'designer.Reference' || component.type === 'Reference')) {
      const referringComponent = component;

      if (mergedProps.includeChildren === false) {
        parent = component;
      }

      referenceDesign = (0, _utils.getReferenceDesign)(imports, component);
      component = (referenceDesign || design).components[mergedProps.component];

      if (component) {
        // remember that we used a Reference in case a link is followed
        referenced.current[component.id] = referringComponent.id; // If the referring component doesn't have a name,
        // use hide from linked component

        if (!referringComponent.name) hide = component.hide; // don't render if hiding at this size

        if (component.responsive && component.responsive.hide && component.responsive.hide.includes(responsiveSize)) hide = true;
        responsiveProps = component.responsive && component.responsive[responsiveSize] && component.responsive[responsiveSize].props;
        mergedProps = responsiveProps ? _objectSpread(_objectSpread({}, component.props), responsiveProps) : component.props;
      }
    }

    if (hide) return null;
    const type = (0, _utils.getComponentType)(libraries, component.type);

    if (!type) {
      console.warn("Missing component type ".concat(component.type));
      return null;
    }

    const contextPath = dataContextPath || selected.dataContextPath;

    if (component.type === 'designer.Repeater' || component.type === 'Repeater') {
      return renderRepeater(component, type, {
        dataContextPath: contextPath,
        referenceDesign
      });
    } // set up any properties that need special handling


    let specialProps;

    if (type.override) {
      var _component$designProp;

      let dataValue;
      let dataPath = dataContextPath;

      if ((_component$designProp = component.designProps) !== null && _component$designProp !== void 0 && _component$designProp.dataPath) {
        ({
          dataPath
        } = component.designProps);
        dataPath = dataContextPath ? [...dataContextPath, ...parsePath(dataPath)] : parsePath(dataPath); // prefer dirtyData, if we have any

        dataValue = dirtyData[dataPath.join('.')] || find(data, dataPath);
      }

      specialProps = type.override(component, {
        dataContextPath: dataPath,
        design: referenceDesignProp || design,
        followLink,
        followLinkOption,
        replaceData: text => replace(text, [datum, dirtyData, data], contextPath),
        setHide: value => _setHide(id, value),
        data: dataValue || undefined,
        renderComponent,
        // setData is used by Form to track Form changes.
        // These changes are stored within the dirtyData here.
        // Passing undefined will delete the dirtyData, when resetting the Form
        setData: nextDataValue => {
          const nextDirtyData = JSON.parse(JSON.stringify(dirtyData));
          if (nextDataValue === undefined) delete nextDirtyData[dataPath.join('.')];else nextDirtyData[dataPath.join('.')] = nextDataValue;
          setDirtyData(nextDirtyData);
        }
      });
    } else {
      specialProps = {};
    }

    if (component.type === 'grommet.Layer' && grommetRef.current) {
      specialProps.target = (0, _reactDom.findDOMNode)(grommetRef.current);
    }

    Object.keys(mergedProps).forEach(prop => {
      if (type.properties) {
        const property = type.properties[prop]; // use designer Icon for icons

        if (Array.isArray(property) && component.type !== 'designer.Icon' && component.type !== 'Icon' && property.includes('-Icon-')) {
          // pass along size so we can adjust the icon size as well
          specialProps[prop] = /*#__PURE__*/_react.default.createElement(_Icon.default, {
            icon: mergedProps[prop],
            size: component.props.size
          });
        }

        if (typeof property === 'string' && property.startsWith('-component-') && !specialProps[prop]) {
          specialProps[prop] = renderComponent(mergedProps[prop], {
            dataContextPath
          });
        }
      }
    });
    const droppable = !type.text && type.name !== 'Icon';
    let style;

    if (dropTarget === id) {
      style = {
        outline: '5px dashed blue'
      };
    } else if (dropAt === id) {
      style = {
        outline: '1px dashed blue'
      };
    } else if (inlineEdit === id) {
      style = {
        outline: '2px dashed red'
      };
    } else if (mode === 'edit' && selected.component === id) {
      style = {
        outline: '1px dashed red'
      };
    }

    if (!parent) parent = component;
    let children;

    if ((_specialProps = specialProps) !== null && _specialProps !== void 0 && _specialProps.children) {
      children = specialProps.children;
      delete specialProps.children;
    } else if (((_parent$children = parent.children) === null || _parent$children === void 0 ? void 0 : _parent$children.length) > 0) {
      if (parent.children.length > 0) {
        children = parent.children.map(childId => renderComponent(childId, {
          dataContextPath,
          datum,
          referenceDesign
        }));
        if (children.length === 0) children = undefined;
      }
    } else if (inlineEdit === id) {
      children = /*#__PURE__*/_react.default.createElement(InlineInput, {
        ref: type.name === 'Paragraph' ? inputRef : undefined,
        as: type.name === 'Paragraph' ? 'textarea' : undefined,
        placeholder: type.text,
        value: inlineEditText,
        size: inlineEditText ? inlineEditText.length : 4,
        onChange: event => setInlineEditText(event.target.value)
      });
    } else if (component.text !== undefined) {
      if (datum || data) {
        // resolve any data references
        children = replace(component.text, [datum, dirtyData, data], contextPath);
      } else {
        children = component.text;
      } // if (!children) children = <>&nbsp;</>; // breaks Markdown


      if (children === undefined) children = type.text;
    } else if (type.text) {
      children = type.text;
    } else if (type.placeholder && !component.coupled) {
      children = /*#__PURE__*/_react.default.createElement(Placeholder, null, type.placeholder(mergedProps));
    } // We don't drag when editing so that the user can use text selection.


    const dragProps = {};

    if (mode === 'edit' && !inlineEdit) {
      dragProps.draggable = true;

      dragProps.onDragStart = event => {
        event.stopPropagation();
        event.dataTransfer.setData('text/plain', ''); // for Firefox

        setDragging(id);
      };

      dragProps.onDragEnd = event => {
        event.stopPropagation();
        setDragging(undefined);
        setDropTarget(undefined);
      };

      dragProps.onDragEnter = event => {
        if (droppable) event.stopPropagation();

        if (dragging && dragging !== id) {
          if (droppable) {
            setDropTarget(id);
          } else {
            setDropAt(id);
          }
        }
      };

      dragProps.onDragOver = event => {
        if (droppable) event.stopPropagation();

        if (dragging && dragging !== id && droppable) {
          event.preventDefault();
        }
      };

      dragProps.onDrop = event => {
        if (droppable) event.stopPropagation();
        moveComponent();
      };
    }

    const selectProps = {};

    if (mode === 'edit') {
      selectProps.onClick = event => {
        event.stopPropagation();

        if (selected.component !== id) {
          setSelected(_objectSpread(_objectSpread({}, selected), {}, {
            component: id
          }));
          setInlineEdit(undefined);
        } else if (type.text && !referenceDesign) {
          setInlineEdit(id);
          setInlineEditText(component.text || '');
        }

        if (specialProps.onClick) specialProps.onClick(event);
      }; // This causes problems when FormField checks for
      // focusIndicator === undefined for its children.


      if (mergedProps.focusIndicator === undefined && ((0, _design.getParent)(design, id) || {}).type !== 'grommet.FormField') {
        selectProps.focusIndicator = false;
      }
    }

    if (!type.component) {
      console.error('missing component', component, type);
      return null;
    } // track which components want to initialize themselves


    if (type.initialize) nextRendered[id] = component;
    return /*#__PURE__*/(0, _react.createElement)(type.component, _objectSpread(_objectSpread(_objectSpread(_objectSpread({
      key: key || id
    }, dragProps), {}, {
      style
    }, mergedProps), specialProps), selectProps), children);
  }; // reset referenced to clear out any old ones so it only reflects the
  // latest rendering


  referenced.current = {};
  const screen = design.screens[selected.screen];
  let content;
  if (selected.property) {
    if (selected.property.component) // showing just a property component, no screen
      content = /*#__PURE__*/_react.default.createElement(_grommet.Box, {
        align: "center",
        justify: "center"
      }, renderComponent(selected.property.component));else content = /*#__PURE__*/_react.default.createElement(_grommet.Box, {
      align: "center"
    }, /*#__PURE__*/_react.default.createElement(_grommet.Paragraph, {
      size: "large",
      textAlign: "center",
      color: "placeholder"
    }, selected.property.name, " is currently empty. Add a component to it to to start building it out."));
  } else if (screen !== null && screen !== void 0 && screen.root) content = renderComponent(screen.root);else content = /*#__PURE__*/_react.default.createElement(_grommet.Box, {
    align: "center"
  }, /*#__PURE__*/_react.default.createElement(_grommet.Paragraph, {
    size: "large",
    textAlign: "center",
    color: "placeholder"
  }, "This Screen is currently empty. Add a layout component to it to to start building it out.")); // Remember which components want to be told that they should initialize

  let nextInitialize;
  Object.keys(nextRendered).forEach(id => {
    if (!initialize[id] && !rendered.current[id]) {
      if (!nextInitialize) nextInitialize = _objectSpread({}, initialize);
      nextInitialize[id] = nextRendered[id];
    }
  });
  if (nextInitialize) setInitialize(nextInitialize);
  rendered.current = nextRendered;
  return /*#__PURE__*/_react.default.createElement(_grommet.Grommet, {
    ref: grommetRef,
    id: "designer-canvas",
    theme: theme,
    themeMode: design.themeMode,
    style: {
      height: '100%',
      maxWidth: '100vw'
    }
  }, content);
};

var _default = Canvas;
exports.default = _default;