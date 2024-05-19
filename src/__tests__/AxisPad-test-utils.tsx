import { render, within } from "@testing-library/react-native";
import { AxisPad, AxisPadProps, AxisPadTouchEventType } from "../AxisPad";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { View } from "react-native";
import React, { FunctionComponentElement } from "react";

export interface Point {
    x: number;
    y: number;
}

export function rootGestureHandlerTestId(axisPadId: string) {
    return `test-root-pan-gesture-handler:${axisPadId}`;
}

export function controlKnobTestId(axisPadId: string) {
    return `test-control-knob-view:${axisPadId}`;
}

/**
 * Not a huge fan of this but it seems impossible to get any kind of measurement to assert properly.
 * The best I can think of is to use the hidden callback props to retrieve the values that are directly used to set the position.
 */
export interface UnitTestAxisPadProps extends AxisPadProps {
    UNIT_TEST_CALLBACKS: {
        onControlPositionChange: (point: Point) => void;
        onPadPositionChange: (point: Point) => void;
    };
}

export const DEFAULT_PAD_RADIUS = 150;
export const DEFAULT_KNOB_RADIUS = 25;

export interface ControlPositionChange {
    eventType: string;
    x: number;
    y: number;
}

export const onTouchEventMock = jest.fn();
export const onControlPositionChangeMock = jest.fn();
export const onPadPositionChangeMock = jest.fn();

export function renderAxisPad(props: Omit<AxisPadProps, "onTouchEvent">): {
    root: FunctionComponentElement<typeof AxisPad>;
    knob: FunctionComponentElement<View>;
} {
    const unitTestProps: UnitTestAxisPadProps = {
        ...props,
        onTouchEvent: onTouchEventMock,
        UNIT_TEST_CALLBACKS: {
            onControlPositionChange: onControlPositionChangeMock,
            onPadPositionChange: onPadPositionChangeMock,
        },
    };

    const { getByTestId } = render(
        <GestureHandlerRootView>
            <AxisPad {...unitTestProps} />
        </GestureHandlerRootView>
    );

    const root = getByTestId(rootGestureHandlerTestId(props.id));
    const knob = within(root).getByTestId(controlKnobTestId(props.id));

    return {
        root,
        knob,
    };
}

export function resetMocks() {
    onTouchEventMock.mockReset();
    onControlPositionChangeMock.mockReset();
    onPadPositionChangeMock.mockReset();
}

export function assertTouchEventCall(
    callNo: number,
    eventType: AxisPadTouchEventType,
    x: number,
    y: number
) {
    expect(onTouchEventMock).toHaveBeenNthCalledWith(callNo, {
        eventType,
        ratio: {
            x: expect.closeTo(x, 12),
            y: expect.closeTo(y, 12),
        },
    });
}

export function assertControlPositionChangeCall(
    callNo: number,
    eventType: AxisPadTouchEventType | "setup",
    x: number,
    y: number
) {
    expect(onControlPositionChangeMock).toHaveBeenNthCalledWith(callNo, {
        eventType,
        x: expect.closeTo(x, 12),
        y: expect.closeTo(y, 12),
    });
}

export function getExpectedExtremePosition(radius: number, x: number, y: number) {
    const length = (x ** 2 + y ** 2) ** 0.5;

    if (length <= radius) {
        return { x, y };
    }

    const angle = Math.atan2(y, x);

    return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
    };
}
