import {
  grommet
} from 'grommet';
import React, { useEffect, useState } from 'react';
import { bare } from './design/bare';
import Designer from './Designer';
import { parseUrlParams, setupDesign } from './utils';

const designerTheme = {
  ...grommet,
  global: {
    ...grommet.global,
    colors: { background: { dark: '#282828', light: '#f8f8f8' } },
  },
  // so designer layers are on top of Canvas layers
  layer: {
    ...grommet.layer,
    zIndex: 15,
  },
  tip: {
    content: {
      background: 'background',
    },
  },
};

const setUrl = (design, method = 'push') => {
  const url = design
    ? `${window.location.pathname}?name=${encodeURIComponent(design.name)}`
    : '/';
  if (method === 'replace')
    window.history.replaceState(undefined, undefined, url);
  else window.history.pushState(undefined, undefined, url);
};

const DesignerApp = () => {
  const [design, setDesign] = useState(setupDesign(bare));
  const [needSave, setNeedSave] = useState(0);




  useEffect(() => {
    const timer = setTimeout(() => {
      if (needSave) {
        const params = parseUrlParams(window.location.search);
        if (params.name !== design.name) setUrl(design, 'replace');
        const stored = localStorage.getItem('designs');
        const designs = stored ? JSON.parse(stored) : [];
        const index = designs.indexOf(design.name);
        if (index !== 0) {
          const nextDesigns = [...designs];
          if (index !== -1) nextDesigns.splice(index, 1);
          nextDesigns.unshift(design.name);
          localStorage.setItem('designs', JSON.stringify(nextDesigns));
        }
        setNeedSave(0);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [design, needSave]);


  return (
    <Designer
    design={design}
    chooseDesign={(design) => {
      setDesign(design);
      setUrl(design);
    }}
    updateDesign={(design) => {
      setDesign(design);
      setNeedSave(needSave + 1);
    }}
  />
  );
};

export default DesignerApp;
