import { PanGesture, State } from "react-native-gesture-handler";
import { fireGestureHandler } from "react-native-gesture-handler/jest-utils";
import {
    DEFAULT_KNOB_RADIUS,
    DEFAULT_PAD_RADIUS,
    getExpectedExtremePosition,
    onControlPositionChangeMock,
    onPadPositionChangeMock,
    onTouchEventMock,
    renderAxisPad,
    resetMocks,
} from "./AxisPad-test-utils";

describe("AxisPad - Touch Event Boundaries", () => {
    afterEach(() => {
        resetMocks();
    });

    describe("XY AxisPad (default disableX = false, default disableY = false)", () => {
        describe("default ignoreTouchDownInPadArea = false", () => {
            it("touch event is not accepted outside pad bounds", () => {
                const { root } = renderAxisPad({
                    id: "test-pad",
                });

                // TEST 1 - outside X boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: DEFAULT_PAD_RADIUS + 1, y: 0 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 2 - outside Y boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: 0, y: -DEFAULT_PAD_RADIUS - 1 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 3 - close diagonal proximity to boundary
                const start = getExpectedExtremePosition(DEFAULT_PAD_RADIUS + 1, 1000, 1000);

                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: start.x, y: start.y },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);
            });

            it("touch event is accepted inside pad bounds", () => {
                const { root } = renderAxisPad({
                    id: "test-pad",
                });

                // TEST 1 - outside X boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: DEFAULT_PAD_RADIUS - 1, y: 0 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(5);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);

                // clear mocks and ensure next event is handled appropriately
                onControlPositionChangeMock.mockReset();
                onPadPositionChangeMock.mockReset();
                onTouchEventMock.mockReset();

                // TEST 2 - outside Y boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: 0, y: -DEFAULT_PAD_RADIUS + 1 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(4);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(0);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);

                // clear mocks and ensure next event is handled appropriately
                onControlPositionChangeMock.mockReset();
                onPadPositionChangeMock.mockReset();
                onTouchEventMock.mockReset();

                // TEST 3 - close diagonal proximity to boundary
                const start = getExpectedExtremePosition(DEFAULT_PAD_RADIUS - 1, 1000, 1000);

                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: start.x, y: start.y },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(4);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(0);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);
            });
        });
        describe("ignoreTouchDownInPadArea = true", () => {
            it("touch event is not accepted outside pad bounds", () => {
                const { root } = renderAxisPad({
                    id: "test-pad",
                    ignoreTouchDownInPadArea: true,
                });

                // TEST 1 - outside X boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: DEFAULT_PAD_RADIUS + 1, y: 0 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 2 - outside Y boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: 0, y: -DEFAULT_PAD_RADIUS - 1 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 3 - close diagonal proximity to boundary
                const start = getExpectedExtremePosition(DEFAULT_PAD_RADIUS + 1, 1000, 1000);

                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: start.x, y: start.y },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);
            });

            it("touch event is not accepted inside pad bounds", () => {
                const { root } = renderAxisPad({
                    id: "test-pad",
                    ignoreTouchDownInPadArea: true,
                });

                // TEST 1 - outside X boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: DEFAULT_PAD_RADIUS - 1, y: 0 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 2 - outside Y boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: 0, y: -DEFAULT_PAD_RADIUS + 1 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 3 - close diagonal proximity to boundary
                const start = getExpectedExtremePosition(DEFAULT_PAD_RADIUS - 1, 1000, 1000);

                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: start.x, y: start.y },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);
            });

            it("touch event is accepted inside knob bounds", () => {
                const { root } = renderAxisPad({
                    id: "test-pad",
                    ignoreTouchDownInPadArea: true,
                });

                // TEST 1 - outside X boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: DEFAULT_KNOB_RADIUS - 1, y: 0 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(5);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);

                // clear mocks and ensure next event is handled appropriately
                onControlPositionChangeMock.mockReset();
                onPadPositionChangeMock.mockReset();
                onTouchEventMock.mockReset();

                // TEST 2 - outside Y boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: 0, y: -DEFAULT_KNOB_RADIUS + 1 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(4);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(0);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);

                // clear mocks and ensure next event is handled appropriately
                onControlPositionChangeMock.mockReset();
                onPadPositionChangeMock.mockReset();
                onTouchEventMock.mockReset();

                // TEST 3 - close diagonal proximity to boundary
                const start = getExpectedExtremePosition(DEFAULT_KNOB_RADIUS - 1, 1000, 1000);

                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: start.x, y: start.y },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(4);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(0);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);
            });
        });
    });

    describe("X AxisPad (default disableX = false, disableY = true)", () => {
        describe("default ignoreTouchDownInPadArea = false", () => {
            it("touch event is not accepted outside pad bounds", () => {
                const { root } = renderAxisPad({
                    id: "test-pad",
                    disableY: true,
                });

                // TEST 1 - outside X boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: DEFAULT_PAD_RADIUS + 1, y: 0 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 2 - outside Y boundary
                // X pad is height of knob as Y is disabled
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: 0, y: -DEFAULT_PAD_RADIUS - 1 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 3 - close diagonal proximity to knob boundary
                const start = getExpectedExtremePosition(DEFAULT_PAD_RADIUS + 1, 1000, 1000);

                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: start.x, y: start.y },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);
            });

            it("touch event is accepted inside pad bounds", () => {
                const { root } = renderAxisPad({
                    id: "test-pad",
                });

                // TEST 1 - outside X boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: DEFAULT_PAD_RADIUS - 1, y: 0 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(5);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);

                // clear mocks and ensure next event is handled appropriately
                onControlPositionChangeMock.mockReset();
                onPadPositionChangeMock.mockReset();
                onTouchEventMock.mockReset();

                // TEST 2 - outside Y boundary
                // X pad is height of knob as Y is disabled
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: 0, y: -DEFAULT_KNOB_RADIUS + 1 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(4);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(0);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);

                // clear mocks and ensure next event is handled appropriately
                onControlPositionChangeMock.mockReset();
                onPadPositionChangeMock.mockReset();
                onTouchEventMock.mockReset();

                // TEST 3 - close diagonal proximity to boundary
                const start = getExpectedExtremePosition(DEFAULT_PAD_RADIUS - 1, 1000, 1000);

                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: start.x, y: start.y },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(4);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(0);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);
            });
        });
        describe("ignoreTouchDownInPadArea = true", () => {
            it("touch event is not accepted outside pad bounds", () => {
                const { root } = renderAxisPad({
                    id: "test-pad",
                    ignoreTouchDownInPadArea: true,
                });

                // TEST 1 - outside X boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: DEFAULT_PAD_RADIUS + 1, y: 0 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 2 - outside Y boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: 0, y: -DEFAULT_PAD_RADIUS - 1 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 3 - close diagonal proximity to boundary
                const start = getExpectedExtremePosition(DEFAULT_PAD_RADIUS + 1, 1000, 1000);

                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: start.x, y: start.y },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);
            });

            it("touch event is not accepted inside pad bounds", () => {
                const { root } = renderAxisPad({
                    id: "test-pad",
                    ignoreTouchDownInPadArea: true,
                });

                // TEST 1 - outside X boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: DEFAULT_PAD_RADIUS - 1, y: 0 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 2 - outside Y boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: 0, y: -DEFAULT_PAD_RADIUS + 1 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);

                // TEST 3 - close diagonal proximity to boundary
                const start = getExpectedExtremePosition(DEFAULT_PAD_RADIUS - 1, 1000, 1000);

                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: start.x, y: start.y },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // always called once during initialization
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(1);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // no touch event was fired back to listener
                expect(onTouchEventMock).toHaveBeenCalledTimes(0);
            });

            it("touch event is accepted inside knob bounds", () => {
                const { root } = renderAxisPad({
                    id: "test-pad",
                    ignoreTouchDownInPadArea: true,
                });

                // TEST 1 - outside X boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: DEFAULT_KNOB_RADIUS - 1, y: 0 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(5);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);

                // clear mocks and ensure next event is handled appropriately
                onControlPositionChangeMock.mockReset();
                onPadPositionChangeMock.mockReset();
                onTouchEventMock.mockReset();

                // TEST 2 - outside Y boundary
                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: 0, y: -DEFAULT_KNOB_RADIUS + 1 },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(4);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(0);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);

                // clear mocks and ensure next event is handled appropriately
                onControlPositionChangeMock.mockReset();
                onPadPositionChangeMock.mockReset();
                onTouchEventMock.mockReset();

                // TEST 3 - close diagonal proximity to boundary
                const start = getExpectedExtremePosition(DEFAULT_KNOB_RADIUS - 1, 1000, 1000);

                fireGestureHandler<PanGesture>(root, [
                    { state: State.BEGAN, x: start.x, y: start.y },
                    { state: State.ACTIVE },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { state: State.END, x: 50, y: 10 },
                ]);

                // calls asserted more agressively later
                expect(onControlPositionChangeMock).toHaveBeenCalledTimes(4);
                // always called once during initialization
                expect(onPadPositionChangeMock).toHaveBeenCalledTimes(0);
                // calls asserted more agressively later
                expect(onTouchEventMock).toHaveBeenCalledTimes(4);
            });
        });
    });
});
