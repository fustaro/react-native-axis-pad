import {
    GestureEventPayload,
    PanGesture,
    PanGestureHandlerEventPayload,
    State,
} from "react-native-gesture-handler";
import { fireGestureHandler } from "react-native-gesture-handler/jest-utils";
import {
    ControlPositionChange,
    DEFAULT_PAD_RADIUS,
    getExpectedExtremePosition,
    onControlPositionChangeMock,
    onPadPositionChangeMock,
    onTouchEventMock,
    Point,
    renderAxisPad,
    resetMocks,
} from "./AxisPad-test-utils";

function simulateAndAssertNoSnapPad(
    root: any,
    touchEvents: Point[],
    includeInitialSetupEvent: boolean
) {
    const events: Partial<GestureEventPayload & PanGestureHandlerEventPayload>[] = [];

    const firstEvent = touchEvents[0]!;

    const startX = firstEvent.x;
    const startY = firstEvent.y;

    events.push({ state: State.BEGAN, x: startX, y: startY });
    events.push({ state: State.ACTIVE });

    for (let i = 1; i < touchEvents.length - 1; i++) {
        events.push({ x: touchEvents[i]?.x, y: touchEvents[i]?.y });
    }

    const lastEvent = touchEvents[touchEvents.length - 1];
    events.push({ state: State.END, x: lastEvent?.x, y: lastEvent?.y });

    const onControlPositionExpectedCalls: ControlPositionChange[][] = events
        .map((e) => {
            if (e.state === State.BEGAN) {
                return {
                    eventType: "start",
                    x: 0,
                    y: 0,
                };
            }

            if (e.state === State.ACTIVE) {
                return undefined;
            }

            if (e.state === State.END) {
                return {
                    eventType: "end",
                    x: 0,
                    y: 0,
                };
            }

            const position = getExpectedExtremePosition(
                DEFAULT_PAD_RADIUS,
                e.x! - startX,
                e.y! - startY
            );

            return {
                eventType: "pan",
                x: position.x,
                y: position.y,
            };
        })
        .filter((e) => e !== undefined)
        .map((e) => [e!]);

    const onTouchEventExpectedCalls = onControlPositionExpectedCalls.map((e) => [
        {
            eventType: e[0]!.eventType,
            ratio: {
                x: e[0]!.x / DEFAULT_PAD_RADIUS,
                y: e[0]!.y / DEFAULT_PAD_RADIUS,
            },
        },
    ]);

    if (includeInitialSetupEvent) {
        onControlPositionExpectedCalls.unshift([
            {
                eventType: "setup",
                x: 0,
                y: 0,
            },
        ]);
    }

    fireGestureHandler(root, events);

    expect(onControlPositionChangeMock.mock.calls).toEqual(onControlPositionExpectedCalls);
    expect(onTouchEventMock.mock.calls).toEqual(onTouchEventExpectedCalls);

    if (includeInitialSetupEvent) {
        expect(onPadPositionChangeMock).toHaveBeenCalledTimes(1);
        expect(onPadPositionChangeMock).toHaveBeenNthCalledWith(1, { x: 0, y: 0 });
    } else {
        expect(onPadPositionChangeMock).toHaveBeenCalledTimes(0);
    }
}

describe("AxisPad", () => {
    afterEach(() => {
        resetMocks();
    });

    describe("Default minimal props", () => {
        it('Default initialTouchType "no-snap" calls onValue with correct values when control is moved', () => {
            const { root } = renderAxisPad({
                id: "test-pad",
            });

            simulateAndAssertNoSnapPad(
                root,
                [
                    { x: 0, y: 0 },
                    { x: 30, y: -20 },
                    { x: 40, y: -30 },
                    { x: 50, y: 10 },
                ],
                true
            );

            resetMocks();

            let startX = 70,
                startY = 60;

            simulateAndAssertNoSnapPad(
                root,
                [
                    { x: startX, y: startY },
                    { x: -20, y: 20 },
                    { x: 34, y: 27 },
                    { x: 20, y: 60 },
                ],
                false
            );

            resetMocks();

            startX = 20;
            startY = -20;

            simulateAndAssertNoSnapPad(
                root,
                [
                    { x: startX, y: startY },
                    { x: -20, y: 20 },
                    { x: 2000, y: 32 },
                    { x: 34, y: -2300 },
                ],
                false
            );

            resetMocks();

            fireGestureHandler<PanGesture>(root, [
                { state: State.BEGAN, x: startX, y: startY },
                { state: State.ACTIVE },
                { x: 2000, y: 32 },
                { x: 34, y: -2300 },
                { state: State.END, x: 20, y: 60 },
            ]);
        });
    });
});

// describe('AxisPad', () => {
// 	const defaultProps: AxisPadProps = {
// 		id: 'test-pad',
// 	};

// 	it('should render without crashing', () => {
// 		const { getByTestId } = render(<AxisPad {...defaultProps} />);
// 		expect(getByTestId('test-pad')).toBeDefined();
// 	});

// 	it('should call onValue callback on move', () => {
// 		const mockOnValue = jest.fn();
// 		const { getByTestId } = render(<AxisPad {...defaultProps} onValue={mockOnValue} />);
// 		const pad = getByTestId('test-pad');

// 		fireEvent(pad, 'move', { ratio: { x: 0.5, y: 0.5 } });
// 		expect(mockOnValue).toHaveBeenCalledWith({ x: 0.5, y: 0.5 });
// 	});

// 	it('should call onTouchRelease callback on release', () => {
// 		const mockOnTouchRelease = jest.fn();
// 		const { getByTestId } = render(<AxisPad {...defaultProps} onTouchRelease={mockOnTouchRelease} />);
// 		const pad = getByTestId('test-pad');

// 		fireEvent(pad, 'release', { ratio: { x: 0.5, y: 0.5 } });
// 		expect(mockOnTouchRelease).toHaveBeenCalledWith({ x: 0.5, y: 0.5 });
// 	});
// });
