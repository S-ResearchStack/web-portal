import React, { useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import styled, { useTheme } from 'styled-components';
import _isEqual from 'lodash/isEqual';
import _tail from 'lodash/tail';
import { useUpdateEffect } from 'react-use';

import ZoomOutIcon from 'src/assets/icons/zoom_out.svg';
import IconButton from 'src/common/components/IconButton';
import { px, animation, colors } from 'src/styles';
import { ZoomControls } from 'src/modules/charts/common-components';
import {
  getFocusWidth,
  getFocusHeight,
  StyledSvg,
  initBrushX,
  initBrushY,
  updateContext,
  isResetButtonShown,
  appendZoom,
} from '../common-helpers';

export interface AreaDataItem {
  x: number;
  y0: number;
  y1: number;
}

interface MarginFocus {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const gradientPoints = [
  { offset: '0%' },
  { offset: '41%' },
  { offset: '41%', isColored: true },
  { offset: '50%', isColored: true },
  { offset: '59%', isColored: true },
  { offset: '59%' },
  { offset: '100%' },
];

const ChartContainer = styled.div`
  position: relative;
`;

const ResetButton = styled(IconButton)<{ $visible: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${px(24)};
  height: ${px(24)};
  position: absolute;
  right: ${px(4)};
  top: ${px(4)};
  border-radius: ${px(4)};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'all' : 'none')};
  transition: opacity 0.3s ${animation.defaultTiming};
  cursor: ${({ $visible }) => ($visible ? 'pointer' : 'default')};
`;

const SvgContainer = styled(StyledSvg)`
  .zoomRect {
    stroke: ${colors.updBlack};
    fill: transparent;
  }
`;

type XType = d3.ScaleLinear<number, number, never>;

type ZoomMode = 'pan' | 'zoomIn';

type Props = {
  svgRef: React.RefObject<SVGSVGElement>;
  width: number;
  height: number;
  marginFocus: MarginFocus;
  showZoomControls: boolean;
  childrenBefore?: React.ReactNode[];
  childrenAfter?: React.ReactNode[];
  x: XType;
  xContext: XType;
  y: d3.ScaleLinear<number, number, never>;
  yContext: d3.ScaleLinear<number, number, never>;
  transformK: number;
  setChartTooltipDisabled?: (value: boolean) => void;
  updateXDomain: (newDomain: number[]) => void;
  updateYDomain: (newDomain: number[]) => void;
};

const MAX_ZOOM_INDEX = 8;

const Zoom: React.FC<Props> = ({
  svgRef,
  width,
  height,
  marginFocus,
  showZoomControls,
  childrenBefore,
  childrenAfter,
  x,
  xContext,
  y,
  yContext,
  transformK,
  updateXDomain,
  updateYDomain,
  setChartTooltipDisabled,
}) => {
  const theme = useTheme();
  const [lastXRelativeSelection, setLastXRelativeSelection] = useState([0, 1]);
  const [lastYRelativeSelection, setLastYRelativeSelection] = useState([0, 1]);
  const [zoomMode, setZoomMode] = useState<ZoomMode>('pan');
  const [prevZoomIdentity, setPrevZoomIdentity] = useState<d3.ZoomTransform[]>([d3.zoomIdentity]);

  const minXSelectionWidth = useMemo(() => getFocusWidth(width) / MAX_ZOOM_INDEX, [width]);

  const minYSelectionWidth = useMemo(() => getFocusHeight(height) / MAX_ZOOM_INDEX, [height]);

  const updateXRelativeSelection = useCallback(
    (newS: number[]) => {
      const xRange = x.range();

      const newLastXRelativeSelection = [
        (newS[0] - xRange[0]) / (xRange[1] - xRange[0]),
        (newS[1] - xRange[0]) / (xRange[1] - xRange[0]),
      ];

      if (!_isEqual(newLastXRelativeSelection, lastXRelativeSelection)) {
        setLastXRelativeSelection(newLastXRelativeSelection);
      }
    },
    [lastXRelativeSelection, x]
  );

  const moveBrushX = (newS: number[], previousSelection?: boolean) => {
    d3.select(svgRef.current)
      .select('.context')
      .select<SVGGElement>('.brushX')
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      .call(brushX.move, newS);

    /* case, when moveBrushX called from updateContext with moveLastSelection=true */
    if (previousSelection) {
      return;
    }

    updateXRelativeSelection(newS);
  };

  const brushedX = (event: d3.D3BrushEvent<unknown>) => {
    const xRange = xContext.range();
    const s = event.selection as number[];

    if (!s) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      moveBrushX(xRange);
      return;
    }

    /* if trying to zoom more than x16 */
    if (s[1] - s[0] < minXSelectionWidth || !s) {
      const newRightPoint = s[0] + minXSelectionWidth;
      const isOutOfBrushBorder = newRightPoint > xRange[1];
      const newS = isOutOfBrushBorder
        ? [xRange[1] - minXSelectionWidth, xRange[1]]
        : [s[0], s[0] + minXSelectionWidth];

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      moveBrushX(newS);
      return;
    }

    /* moving slider */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newDomain = s.map(xContext.invert as any, xContext) as number[];
    updateXDomain?.(newDomain);
    updateXRelativeSelection(s);
  };

  const updateYRelativeSelection = useCallback(
    (newS: number[]) => {
      const yRange = y.range().reverse();

      const newLastYRelativeSelection = [
        (newS[0] - yRange[0]) / (yRange[1] - yRange[0]),
        (newS[1] - yRange[0]) / (yRange[1] - yRange[0]),
      ];

      if (!_isEqual(newLastYRelativeSelection, lastYRelativeSelection)) {
        setLastYRelativeSelection(newLastYRelativeSelection);
      }
    },
    [lastYRelativeSelection, y]
  );

  const brushedY = (event: d3.D3BrushEvent<unknown>) => {
    const yRange = yContext.range();

    if (!event.selection) {
      const newS = yRange.reverse();

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      moveBrushY(newS);

      return;
    }

    const s = event.selection.reverse() as number[];

    /* if trying to zoom more than x16 */
    if (s[0] - s[1] < minYSelectionWidth || !event.selection) {
      const newBottomPoint = s[1] + minYSelectionWidth;
      const isOutOfBrushBorder = newBottomPoint > yRange[0];
      const newS = isOutOfBrushBorder
        ? [yRange[0] - minYSelectionWidth, yRange[0]]
        : [s[1], s[1] + minYSelectionWidth];

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      moveBrushY(newS);
      return;
    }

    /* moving slider */
    updateYDomain?.(s.map(yContext.invert, yContext));
    updateYRelativeSelection(s.reverse());
  };

  const brushX = initBrushX(getFocusHeight(height), getFocusWidth(width), brushedX);
  const brushY = initBrushY(getFocusWidth(width), height, brushedY);

  const moveBrushY = useCallback(
    (newS: number[], previousSelection?: boolean) => {
      d3.select(svgRef.current)
        .select('.context')
        .select<SVGGElement>('.brushY')
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        .call(brushY.move, newS);

      /* case, when moveBrushY called from updateContext with moveLastSelection=true */
      if (previousSelection) {
        return;
      }

      updateYRelativeSelection(newS);
    },
    [brushY.move, svgRef, updateYRelativeSelection]
  );

  const zoomed = (event: d3.D3ZoomEvent<SVGGElement, unknown>) => {
    const newX = event.transform.rescaleX(xContext);
    const newY = event.transform.rescaleY(yContext);

    updateXDomain(newX.domain());
    updateYDomain(newY.domain());
  };

  const zoomBehavior = d3
    .zoom<SVGGElement, unknown>()
    .scaleExtent([1, 8])
    .translateExtent([
      [marginFocus.left, marginFocus.top],
      [width - marginFocus.right, height - marginFocus.top],
    ])
    .extent([
      [marginFocus.left, marginFocus.top],
      [width - marginFocus.right, height - marginFocus.top],
    ])
    .on('zoom', zoomed);

  const handleResetSelection = () => {
    moveBrushX(xContext.range());
    moveBrushY(yContext.range().reverse());
  };

  const changeZoomMode = useCallback(
    (newZoomMode: ZoomMode) => {
      const newMode = newZoomMode === zoomMode ? 'pan' : newZoomMode;

      setZoomMode(newMode);
      setChartTooltipDisabled?.(newMode === 'zoomIn');

      if (newMode === 'zoomIn') {
        d3.select(svgRef.current).select('.focus').style('cursor', 'crosshair');

        return;
      }

      d3.select(svgRef.current).select('.focus').style('cursor', 'grab');
    },
    [setChartTooltipDisabled, svgRef, zoomMode]
  );

  const zoomOut = () => {
    const newPrevZoomIdentity = _tail(prevZoomIdentity);

    setPrevZoomIdentity(newPrevZoomIdentity);
    changeZoomMode('pan');
    d3.select(svgRef.current)
      .select<SVGGElement>('.focus')
      .call(zoomBehavior.transform, newPrevZoomIdentity[0]);
  };

  const onMouseDown = (event: MouseEvent) => {
    if (zoomMode !== 'zoomIn' || event.button !== 0) {
      return;
    }

    const fWidth = getFocusWidth(width);
    const fHeight = getFocusHeight(height);
    const zoomRect = d3.select(svgRef.current).append('rect').attr('class', 'zoomRect');
    const origin = d3.pointer(event, d3.select(svgRef.current).node());
    origin[0] = Math.max(0, Math.min(fWidth, origin[0]));
    origin[1] = Math.max(0, Math.min(fHeight, origin[1]));

    d3.select('body').classed('noselect', true);

    d3.select(window)
      .on('mousemove.zoomRect', (moveEvent: MouseEvent) => {
        const m = d3.pointer(moveEvent, d3.select(svgRef.current).node());

        m[0] = Math.max(0, Math.min(fWidth, m[0]));
        m[1] = Math.max(0, Math.min(fHeight, m[1]));
        zoomRect
          .attr('x', Math.min(origin[0], m[0]))
          .attr('y', Math.min(origin[1], m[1]))
          .attr('width', Math.abs(m[0] - origin[0]))
          .attr('height', Math.abs(m[1] - origin[1]));
      })
      .on('mouseup.zoomRect', (upEvent: MouseEvent) => {
        d3.select(window).on('mousemove.zoomRect', null).on('mouseup.zoomRect', null);
        d3.select('body').classed('noselect', false);

        const m = d3.pointer(upEvent, d3.select(svgRef.current).node());
        m[0] = Math.max(0, Math.min(fWidth, m[0]));
        m[1] = Math.max(0, Math.min(fHeight, m[1]));

        if (m[0] !== origin[0] && m[1] !== origin[1]) {
          const xD = x.domain();
          const xCD = xContext.domain();
          const yD = y.domain().reverse();
          const yCD = yContext.domain().reverse();

          const kX = (xCD[1] - xCD[0]) / (xD[1] - xD[0]);
          const kY = (yCD[1] - yCD[0]) / (yD[1] - yD[0]);

          const newBrushX = [origin[0] / kX + xContext(xD[0]), m[0] / kX + xContext(xD[0])];
          const newBrushY = [origin[1] / kY + yContext(yD[0]), m[1] / kY + yContext(yD[0])];

          let kXNew = (x.range()[1] - x.range()[0]) / (newBrushX[1] - newBrushX[0]);
          let kYNew = (y.range()[0] - y.range()[1]) / (newBrushY[1] - newBrushY[0]);

          if (kXNew > MAX_ZOOM_INDEX) kXNew = MAX_ZOOM_INDEX;
          if (kYNew > MAX_ZOOM_INDEX) kYNew = MAX_ZOOM_INDEX;

          const scale = Math.min(kXNew, kYNew);
          const translate = [
            xContext.range()[0] - newBrushX[0],
            yContext.range()[1] - newBrushY[0],
          ];
          const zoomIdentity = d3.zoomIdentity.scale(scale).translate(translate[0], translate[1]);

          d3.select(svgRef.current)
            .select<SVGGElement>('.focus')
            .call(zoomBehavior.transform, zoomIdentity);

          setPrevZoomIdentity([zoomIdentity].concat(prevZoomIdentity));
          changeZoomMode('pan');
        }

        zoomRect.remove();
      });

    event.stopPropagation();
  };

  useEffect(() => {
    appendZoom(svgRef, getFocusWidth(width), getFocusHeight(height), zoomBehavior, onMouseDown);
  });

  const updateZoom = (moveLastSelection?: boolean) => {
    updateContext(
      svgRef,
      x.range(),
      y.range().reverse(),
      lastXRelativeSelection,
      lastYRelativeSelection,
      brushX,
      brushY,
      moveBrushX,
      moveBrushY,
      moveLastSelection
    );
  };

  useEffect(() => {
    updateZoom();
    d3.select(svgRef.current).select('.focus').style('cursor', 'grab');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useUpdateEffect(() => {
    updateZoom(true);
  }, [width, height]);

  return (
    <ChartContainer>
      <ResetButton
        onClick={handleResetSelection}
        icon={ZoomOutIcon}
        color="updTextSecondaryGray"
        $size="s"
        $visible={
          isResetButtonShown(lastXRelativeSelection, lastYRelativeSelection) && showZoomControls
        }
      />
      <SvgContainer
        ref={svgRef}
        focusWidth={getFocusWidth(width)}
        viewBox={`0, 0, ${width}, ${height}`}
        $contextVisible={!!showZoomControls}
      >
        {childrenBefore}
        <g key="focus" className="focus" />
        {childrenAfter}
        <defs key="defs">
          <linearGradient id="horizontalGradient" x1="0" x2="0" y1="0" y2="1">
            {gradientPoints.map((point, index) => (
              <stop
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                offset={point.offset}
                stopColor={point.isColored ? theme.colors.primary : 'transparent'}
              />
            ))}
          </linearGradient>
          <linearGradient id="verticalGradient">
            {gradientPoints.map((point, index) => (
              <stop
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                offset={point.offset}
                stopColor={point.isColored ? theme.colors.primary : 'transparent'}
              />
            ))}
          </linearGradient>
          <clipPath transform={`translate(${marginFocus.left}, ${marginFocus.top})`} id="clip">
            <rect width={getFocusWidth(width)} height={getFocusHeight(height)} />
          </clipPath>
        </defs>
      </SvgContainer>
      <ZoomControls
        zoomInActive={zoomMode === 'zoomIn'}
        zoomInDisabled={transformK >= MAX_ZOOM_INDEX}
        zoomOutActive={false}
        zoomOutDisabled={prevZoomIdentity.length === 1}
        zoomIn={() => changeZoomMode('zoomIn')}
        zoomOut={zoomOut}
      />
    </ChartContainer>
  );
};

export default Zoom;
