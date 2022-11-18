import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import styled, { useTheme } from 'styled-components';
import _isEqual from 'lodash/isEqual';
import _tail from 'lodash/tail';
import { useUpdateEffect } from 'react-use';
import useEvent from 'react-use/lib/useEvent';

import { useLayoutContentRef } from 'src/modules/main-layout/LayoutContentCtx';
import ZoomOutIcon from 'src/assets/icons/zoom_out.svg';
import IconButton from 'src/common/components/IconButton';
import { px, animation, colors } from 'src/styles';
import browser from 'src/common/utils/browser';
import {
  getFocusWidth,
  getFocusHeight,
  StyledSvg,
  initBrushX,
  initBrushY,
  updateContext,
  isResetButtonShown,
  MARGIN_FOCUS,
  TooltipProps,
} from '../common-helpers';
import ZoomControls from './ZoomControls';

export interface AreaDataItem {
  x: number;
  y0: number;
  y1: number;
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
    stroke: ${colors.black};
    fill: transparent;
  }

  .focus {
    fill: none;

    .zoom {
      pointer-events: none;
    }
  }
`;

type ZoomMode = 'pan' | 'zoomIn';

type Props = {
  svgRef: React.RefObject<SVGSVGElement>;
  width: number;
  height: number;
  showZoomControls: boolean;
  childrenBefore?: React.ReactNode[];
  childrenAfter?: React.ReactNode[];
  x: d3.ScaleLinear<number, number, never>;
  xContext: d3.ScaleLinear<number, number, never>;
  y: d3.ScaleLinear<number, number, never>;
  yContext: d3.ScaleLinear<number, number, never>;
  transformK: number;
  setChartTooltipDisabled?: (value: boolean) => void;
  updateXDomain: (newDomain: number[], enteredDotId?: string, tooltipProps?: TooltipProps) => void;
  updateYDomain: (newDomain: number[]) => void;
};

const MAX_ZOOM_INDEX = 8;
const MAX_ZOOM_TIME_DIFF = 50;
const DOMAIN_THRESHOLD = 0.0000000000001;

const Zoom: React.FC<Props> = ({
  svgRef,
  width,
  height,
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
  const zoomRectRef = useRef<SVGRectElement>(null);
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

  const layoutContentRef = useLayoutContentRef();
  const lastZoomEventTime = useRef(0);

  const zoomed = useCallback(
    (event: d3.D3ZoomEvent<SVGGElement, unknown>) => {
      if (event.transform.k === 1 && event.transform.x === 0 && event.transform.y === 0) {
        setPrevZoomIdentity([d3.zoomIdentity]);
      }

      const newX = event.transform.rescaleX(xContext);
      const newY = event.transform.rescaleY(yContext);

      const xMin = xContext.domain()[0];
      const xMax = xContext.domain()[1];
      const yMin = yContext.domain()[0];
      const yMax = yContext.domain()[1];

      const minXModified =
        newX.domain()[0] - (newX.domain()[1] > xMax ? newX.domain()[1] - xMax : 0);
      const useMinX = Math.abs(minXModified - xMin) < DOMAIN_THRESHOLD || minXModified < xMin;
      const newXMin = useMinX ? xMin : minXModified;

      const maxXModified =
        newX.domain()[1] + (newX.domain()[0] < xMin ? xMin - newX.domain()[0] : 0);
      const useMaxX = Math.abs(maxXModified - xMax) < DOMAIN_THRESHOLD || maxXModified > xMax;
      const newXMax = useMaxX ? xMax : maxXModified;

      const minYModified =
        newY.domain()[0] - (newY.domain()[1] > yMax ? newY.domain()[1] - yMax : 0);
      const useMinY = Math.abs(minYModified - yMin) < DOMAIN_THRESHOLD || minYModified < yMin;
      const newYMin = useMinY ? yMin : newY.domain()[0];

      const maxYModified =
        newY.domain()[1] + (newY.domain()[0] < yMin ? yMin - newY.domain()[0] : 0);
      const useMaxY = Math.abs(maxYModified - yMax) < DOMAIN_THRESHOLD || maxYModified > yMax;
      const newYMax = useMaxY ? yMax : maxYModified;

      const newXDomain = [newXMin, newXMax];
      const newYDomain = [newYMin, newYMax];

      updateXDomain(newXDomain);
      updateYDomain(newYDomain);

      lastZoomEventTime.current = Date.now();
    },
    [updateXDomain, updateYDomain, xContext, yContext]
  );

  const zoomBehavior = useMemo(
    () =>
      d3
        .zoom<SVGGElement, unknown>()
        .scaleExtent([1, 8])
        .translateExtent([
          [MARGIN_FOCUS.left, MARGIN_FOCUS.top],
          [MARGIN_FOCUS.left + getFocusWidth(width), MARGIN_FOCUS.top + getFocusHeight(height)],
        ])
        .extent([
          [MARGIN_FOCUS.left, MARGIN_FOCUS.top],
          [MARGIN_FOCUS.left + getFocusWidth(width), MARGIN_FOCUS.top + getFocusHeight(height)],
        ])
        .on('zoom', zoomed),
    [height, width, zoomed]
  );

  // fix: [Safari] zoom and page scroll executed at the same time
  useEvent(
    'mousewheel',
    (evt) => {
      if (Date.now() - lastZoomEventTime.current <= MAX_ZOOM_TIME_DIFF) {
        evt.preventDefault();
        evt.stopPropagation();
      }
    },
    layoutContentRef.current
  );

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
        d3.select(svgRef.current).select('.focus').select('.zoom').style('pointer-events', 'all');

        return;
      }

      d3.select(svgRef.current).select('.focus').style('cursor', 'grab');
      d3.select(svgRef.current).select('.focus').select('.zoom').style('pointer-events', 'none');
    },
    [setChartTooltipDisabled, svgRef, zoomMode]
  );

  const zoomOut = useCallback(() => {
    const newPrevZoomIdentity = _tail(prevZoomIdentity);

    setPrevZoomIdentity(newPrevZoomIdentity);
    changeZoomMode('pan');
    d3.select(svgRef.current)
      .select<SVGGElement>('.focus')
      .call(zoomBehavior.transform, newPrevZoomIdentity[0]);
  }, [changeZoomMode, prevZoomIdentity, svgRef, zoomBehavior.transform]);

  const onMouseDown = useCallback(
    (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      if (zoomMode !== 'zoomIn' || event.button !== 0) {
        return;
      }

      const fWidth = getFocusWidth(width);
      const fHeight = getFocusHeight(height);
      const zoomRect = d3.select(svgRef.current).append('rect').attr('class', 'zoomRect');
      const origin = d3.pointer(event, d3.select(svgRef.current).node());
      origin[1] = browser.isFirefox ? origin[1] + window.innerHeight : origin[1];
      origin[0] = Math.max(MARGIN_FOCUS.left, Math.min(fWidth + MARGIN_FOCUS.left, origin[0]));
      origin[1] = Math.max(MARGIN_FOCUS.top, Math.min(fHeight + MARGIN_FOCUS.top, origin[1]));

      d3.select('body').classed('noselect', true);

      d3.select(window)
        .on('mousemove.zoomRect', (moveEvent: MouseEvent) => {
          const m = d3.pointer(moveEvent, d3.select(svgRef.current).node());
          m[1] = browser.isFirefox ? m[1] + window.innerHeight : m[1];
          m[0] = Math.max(MARGIN_FOCUS.left, Math.min(fWidth + MARGIN_FOCUS.left, m[0]));
          m[1] = Math.max(MARGIN_FOCUS.top, Math.min(fHeight + MARGIN_FOCUS.top, m[1]));
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
          m[1] = browser.isFirefox ? m[1] + window.innerHeight : m[1];
          m[0] = Math.max(MARGIN_FOCUS.left, Math.min(fWidth + MARGIN_FOCUS.left, m[0]));
          m[1] = Math.max(MARGIN_FOCUS.top, Math.min(fHeight + MARGIN_FOCUS.top, m[1]));

          if (m[0] !== origin[0] && m[1] !== origin[1]) {
            const xD = x.domain();
            const xCD = xContext.domain();
            const yD = y.domain().reverse();
            const yCD = yContext.domain().reverse();

            const kX = (xCD[1] - xCD[0]) / (xD[1] - xD[0]);
            const kY = (yCD[1] - yCD[0]) / (yD[1] - yD[0]);

            const newBrushX = [
              origin[0] / kX + xContext(xD[0]) - MARGIN_FOCUS.left,
              m[0] / kX + xContext(xD[0]) - MARGIN_FOCUS.left,
            ];
            const newBrushY = [
              origin[1] / kY + yContext(yD[0]) - MARGIN_FOCUS.top,
              m[1] / kY + yContext(yD[0]) - MARGIN_FOCUS.top,
            ];

            let kXNew = (x.range()[1] - x.range()[0]) / Math.abs(newBrushX[1] - newBrushX[0]);
            let kYNew = (y.range()[0] - y.range()[1]) / Math.abs(newBrushY[1] - newBrushY[0]);

            if (kXNew > MAX_ZOOM_INDEX) kXNew = MAX_ZOOM_INDEX;
            if (kYNew > MAX_ZOOM_INDEX) kYNew = MAX_ZOOM_INDEX;

            const scale = Math.min(kXNew, kYNew);
            const translate = [
              -Math.min(newBrushX[0], newBrushX[1]),
              -Math.min(newBrushY[0], newBrushY[1]),
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
    },
    [
      changeZoomMode,
      height,
      prevZoomIdentity,
      svgRef,
      width,
      x,
      xContext,
      y,
      yContext,
      zoomBehavior.transform,
      zoomMode,
    ]
  );

  useEffect(() => {
    d3.select(svgRef.current).select<SVGGElement>('.focus').call(zoomBehavior);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y]);

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
        color="textSecondaryGray"
        $size="s"
        $visible={
          isResetButtonShown(lastXRelativeSelection, lastYRelativeSelection) && showZoomControls
        }
      />
      <SvgContainer
        ref={svgRef}
        focusWidth={getFocusWidth(width)}
        viewBox={`0, 0, ${width}, ${height}`}
        $contextVisible={showZoomControls}
      >
        {childrenBefore}
        <g key="focus" className="focus">
          <rect
            ref={zoomRectRef}
            fill="transparent"
            transform={`translate(${MARGIN_FOCUS.left}, ${MARGIN_FOCUS.top})`}
            width={getFocusWidth(width)}
            height={getFocusHeight(height)}
          />
          <rect
            className="zoom"
            transform={`translate(${MARGIN_FOCUS.left}, ${MARGIN_FOCUS.top})`}
            width={getFocusWidth(width)}
            height={getFocusHeight(height)}
            onMouseDownCapture={onMouseDown}
          />
          {childrenAfter}
        </g>
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
          <clipPath transform={`translate(${MARGIN_FOCUS.left}, ${MARGIN_FOCUS.top})`} id="clip">
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
