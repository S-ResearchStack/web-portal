import React, { useCallback, useState } from 'react';
import { replaceCharacter } from 'src/common/components/Table/utils';
import { TooltipControls, TooltipPosition } from 'src/common/components/Tooltip';

interface UseCellTooltipsReturnValue {
  isShowTooltip: boolean;

  setShowTooltip(show: boolean): void;

  handleMouseEnter(evt: React.MouseEvent<HTMLElement>): void;

  handleMouseLeave(evt: React.MouseEvent<HTMLElement>): void;

  currentPos: TooltipPosition;

  tooltipStyles: React.CSSProperties;
}

export function useCellTooltip(
  tooltipRef: React.RefObject<TooltipControls>
): UseCellTooltipsReturnValue {
  const [isShowTooltip, setShowTooltip] = useState<boolean>(false);
  const [currentPos, setCurrentPos] = useState<TooltipPosition>('abl');
  const [isPositionUpdated, setPositionUpdated] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (tooltipRef.current) {
      const el = tooltipRef.current.getContainer();
      if (el) {
        const elRect = el.getBoundingClientRect();

        // TODO: We have to wait for tooltip element to be created in DOM so that we can calculate position.
        // Ideally we need to use mutation observer instead of setTimeout.
        // Until position is updated we hide tooltip by providing extra styles to user of this hook.
        setTimeout(() => {
          if (tooltipRef.current) {
            const tt = tooltipRef.current.getTooltip();
            if (tt) {
              const ttRect = tt?.getBoundingClientRect();
              let position: TooltipPosition = 'abl';
              if (elRect.bottom + ttRect.height > document.documentElement.offsetHeight) {
                position = replaceCharacter(position, 't', 1) as TooltipPosition;
              }
              if (elRect.left + ttRect.width > document.documentElement.offsetWidth) {
                position = replaceCharacter(position, 'r', 2) as TooltipPosition;
              }
              setCurrentPos(position);
              tooltipRef.current.setPosition(position);

              setPositionUpdated(true);
            }
          }
        }, 100);
        setShowTooltip(el.offsetWidth < el.scrollWidth);
      }
    }
  }, [tooltipRef]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
    setPositionUpdated(false);
  }, [setShowTooltip]);

  return {
    isShowTooltip,
    setShowTooltip,
    handleMouseEnter,
    handleMouseLeave,
    currentPos,
    tooltipStyles: {
      visibility: isPositionUpdated ? undefined : 'hidden',
    },
  };
}
