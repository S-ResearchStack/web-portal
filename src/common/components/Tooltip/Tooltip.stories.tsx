import React, { useCallback, useMemo, useRef } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import styled from 'styled-components';

import { px } from 'src/styles';
import Tooltip, {
  TooltipControls,
  TooltipPosition,
  TooltipProvider,
  TooltipsList,
} from 'src/common/components/Tooltip/index';

const MovableArea = styled.div`
  width: ${px(500)};
  height: ${px(500)};
  border: 1px solid rgba(0, 0, 0, 0.1); // TODO unknown color
`;

const AllPositions = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow: auto;
  > .all {
    position: relative;
    margin: 100px 0;
    display: grid;
    max-width: 650px;
    grid-gap: 50px;
    grid-template-areas:
      'atr tl t tr atl'
      'lt . . . rt'
      'l . . . r'
      'lb . . . rb'
      'abr bl b br abl';

    button {
      width: ${px(90)};
      height: ${px(90)};
    }
  }
`;

const positions: TooltipPosition[] = [
  'tl',
  't',
  'tr',
  'lt',
  'l',
  'lb',
  'br',
  'b',
  'bl',
  'rb',
  'r',
  'rt',
  'abl',
  'abr',
  'atl',
  'atr',
];

const TooltipDemo = () => {
  const tooltipFirstRef = useRef<TooltipControls>(null);
  const tooltipSecondRef = useRef<TooltipControls>(null);
  const tooltipThirdRef = useRef<TooltipControls>(null);
  const tooltipFourthRef = useRef<TooltipControls>(null);

  const tooltipRes = useMemo(
    () => [tooltipFirstRef, tooltipSecondRef, tooltipThirdRef, tooltipFourthRef],
    []
  );

  const handleMouseEnter = useCallback(() => {
    tooltipRes.forEach((ref) => {
      ref.current?.setArrow(true).show();
    });
  }, [tooltipRes]);

  const handleMouseLeave = useCallback(() => {
    tooltipRes.forEach((ref) => {
      ref.current?.hide();
    });
  }, [tooltipRes]);

  const handleMouseMove = useCallback(
    (evt: React.MouseEvent) => {
      tooltipRes.forEach((ref) => {
        ref.current?.setPoint([evt.pageX, evt.pageY]);
      });
    },
    [tooltipRes]
  );

  return (
    <TooltipProvider>
      <AllPositions>
        <div className="all">
          {positions.map((position: TooltipPosition) => (
            <div key={position} style={{ gridArea: position }}>
              <Tooltip
                trigger="hover"
                static
                arrow
                content="Type in your text here"
                position={position}
              >
                <button type="button">{position.toUpperCase()}</button>
              </Tooltip>
            </div>
          ))}
        </div>
        <div className="all">
          {positions.map((position: TooltipPosition) => (
            <div key={position} style={{ gridArea: position }}>
              <Tooltip show arrow content="Type in your text here" position={position}>
                <button type="button">{position.toUpperCase()}</button>
              </Tooltip>
            </div>
          ))}
        </div>
        <div className="all">
          {positions.map((position: TooltipPosition) => (
            <div key={position} style={{ gridArea: position }}>
              <Tooltip
                arrow
                content="Type in your text here"
                position={position}
                trigger={['hover']}
              >
                <button type="button">{position.toUpperCase()}</button>
              </Tooltip>
            </div>
          ))}
        </div>
        <div>
          <MovableArea
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          />
          <Tooltip ref={tooltipFirstRef} content={<span style={{ color: 'cyan' }}>Hi!</span>} />
          <Tooltip
            ref={tooltipSecondRef}
            position="r"
            content={<span style={{ color: 'magenta' }}>Hi!</span>}
          />
          <Tooltip
            ref={tooltipThirdRef}
            position="l"
            content={<span style={{ color: 'yellow' }}>Hi!</span>}
          />
          <Tooltip ref={tooltipFourthRef} position="b" content="Hi!" />
        </div>
      </AllPositions>
      <TooltipsList />
    </TooltipProvider>
  );
};

export default {
  component: TooltipDemo,
} as ComponentMeta<typeof TooltipDemo>;

const Template: ComponentStory<typeof TooltipDemo> = () => <TooltipDemo />;

export const TooltipAll = Template.bind({});
