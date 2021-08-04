import React, { useState, useRef } from 'react';
import { useReducedMotion, useDidUpdate } from '@mantine/hooks';
import { DefaultProps, useMantineTheme } from '../../theme';
import { getTransitionStyles } from './get-transition-styles/get-transition-styles';
import { MantineTransition } from './Transition';

export interface TransitionProps extends Omit<DefaultProps, 'className'> {
  /** Predefined transition name or transition styles */
  transition: MantineTransition;

  /** Transition duration in ms */
  duration?: number;

  /** Transition timing function, defaults to theme.transitionTimingFunction */
  timingFunction?: string;

  /** When true, component will be mounted */
  mounted: boolean;

  /** Render function with transition styles argument */
  children(styles: React.CSSProperties): React.ReactElement<any, any>;

  /** Calls when exit transition ends */
  onExited?: () => void;

  /** Calls when exit transition starts */
  onExit?: () => void;

  /** Calls when enter transition starts */
  onEnter?: () => void;

  /** Calls when enter transition ends */
  onEntered?: () => void;
}

type TransitionStatus = 'entered' | 'exited' | 'entering' | 'exiting';

export function Transition({
  transition,
  duration = 250,
  mounted,
  children,
  themeOverride,
  timingFunction,
  onExit,
  onEntered,
  onEnter,
  onExited,
}: TransitionProps) {
  const theme = useMantineTheme(themeOverride);
  const reduceMotion = useReducedMotion();
  const transitionDuration = reduceMotion ? 0 : duration;
  const [status, setStatus] = useState<TransitionStatus>(mounted ? 'entered' : 'exited');
  const timeoutRef = useRef<number>(-1);

  const handleStateChange = (shouldMount: boolean) => {
    setStatus(shouldMount ? 'entering' : 'exiting');
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setStatus(shouldMount ? 'entered' : 'exited');
    }, duration);
  };

  useDidUpdate(() => {
    handleStateChange(mounted);
  }, [mounted]);

  return status === 'exited'
    ? null
    : children(
        getTransitionStyles({
          transition,
          duration: transitionDuration,
          state: status,
          timingFunction: timingFunction || theme.transitionTimingFunction,
        })
      );
}
