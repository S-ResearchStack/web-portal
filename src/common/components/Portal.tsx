import React, { FC, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useUnmount from 'react-use/lib/useUnmount';
import _uniqueId from 'lodash/uniqueId';

export interface PortalProps {
  enabled: boolean;
  id?: string;
}

const createUniqueId = (id?: string): string => _uniqueId(id ? `${id}-` : '');

const Portal: FC<React.PropsWithChildren<PortalProps>> = ({
  enabled,
  children,
  id,
}): React.ReactPortal => {
  const rootRef = useRef<HTMLDivElement>(document.createElement('div'));
  const root = rootRef.current;

  useEffect(() => {
    root.id = createUniqueId(id);
    root.setAttribute('data-testid', 'tooltip-portal');
  }, [id, root]);

  const addRoot = useCallback(() => {
    document.body.appendChild(root);
  }, [root]);

  const removeRoot = useCallback(() => {
    document.body.contains(root) && document.body.removeChild(root);
  }, [root]);

  useEffect(() => {
    enabled ? addRoot() : removeRoot();
  }, [enabled, addRoot, removeRoot]);

  useUnmount(() => {
    removeRoot();
  });

  return createPortal(children, rootRef.current);
};

export default Portal;
