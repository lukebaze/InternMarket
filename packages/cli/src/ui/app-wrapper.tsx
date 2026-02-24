/**
 * app-wrapper.tsx — helper to render Ink components from Commander actions
 * Wraps render() with a cleanup-safe promise that resolves on unmount.
 */
import React from "react";
import { render } from "ink";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;

/**
 * Render an Ink component and wait until it signals done via the onDone prop.
 * The component must accept an `onDone: () => void` prop.
 */
export async function renderApp(
  Component: AnyComponent,
  props: Record<string, unknown>
): Promise<void> {
  return new Promise((resolve) => {
    const onDone = () => {
      unmount();
      resolve();
    };
    const { unmount } = render(
      React.createElement(Component, { ...props, onDone })
    );
  });
}
