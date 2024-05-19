import { PropsWithChildren, ReactElement, useEffect, useRef, useState } from "react";
import { Animated, Easing, ViewStyle, StyleSheet, View, StatusBar, Dimensions } from "react-native";
import {
    GestureEvent,
    HandlerStateChangeEvent,
    PanGestureHandler,
    PanGestureHandlerEventPayload,
    State as GestureEventState,
} from "react-native-gesture-handler";

export type InitialTouchType = "no-snap" | "snap-to-value" | "visual-snap-to-center";

export type AxisPadTouchEventType = "start" | "pan" | "end";

interface Point {
    x: number;
    y: number;
}

export interface AxisPadTouchEvent {
    /**
     * @description {@link AxisPadTouchEventType} The type of touch event:
     * "start" is the initial touch down
     * "pan" is a move event
     * "end" is the final touch up.
     */
    eventType: AxisPadTouchEventType;
    /**
     * @description The ratio corresponding to the current touch position in the pad.
     * The center point of the pad is {x: 0, y: 0} and the range for each is -1 <= [x|y] <= 1.
     */
    ratio: Point;
}

interface InternalTouchEvent extends Point {
    eventType: AxisPadTouchEventType | "setup";
}

export interface AxisPadProps {
    /**
     * @description id of the top level component, also used to construct various testID's for component test accessors.
     */
    id: string;
    /**
     * @description Whether to reset the control knob to center {0, 0} on release (touch up).
     * If true, control knob will animate back to the center and will fire the onValue callback with {0, 0}.
     * If false, the control knob stays where you leave it and the onValue callback is not fired.
     * In both bases, the onTouchRelease callback is fired with the ratios corresponding to where you touched up.
     * @default true
     */
    resetOnRelease?: boolean;
    /**
     * @description Callback called when there is a touch event.
     * @param touchEvent {@link AxisPadTouchEvent} The ratio in x and y corresponding to the position of the control knob in the pad, and the {@link AxisPadTouchEventType}
     */
    onTouchEvent(touchEvent: AxisPadTouchEvent): void;
    /**
     * @description The style object for the background of the pad.
     * Note: width and height are overridden by "size" as this component only supports numeric pixel sizes currently.
     * @default {}
     */
    padBackgroundStyle?: ViewStyle;
    /**
     * @description The style object for the control knob.
     * Note: width and height are overridden by "controlSize" as this component only supports numeric pixel sizes currently.
     * @default {}
     */
    controlStyle?: ViewStyle;
    /**
     * @description The style object for the stick.
     * @default {}
     */
    stickStyle?: ViewStyle;
    /**
     * @description The size of the pad in pixels.
     * Note: In an X/Y pad ("disableX" = false, "disableY" = false), "size applies to the pad width and height.
     * Note: In an X pad ("disableX" = false, "disableY" = true), "size" applies to the width of the pad, and "controlSize" applied to the height of the pad.
     * Note: In an Y pad ("disableX" = true, "disableY" = false), "size" applies to the height of the pad, and "controlSize" applied to the width of the pad.
     * @default 200
     */
    size?: number;
    /**
     * @description The size of the control knob in pixels.
     * @default 50
     */
    controlSize?: number;
    /**
     * @description Whether to disable the x-axis of the pad.
     * @default false
     */
    disableX?: boolean;
    /**
     * @description Whether to disable the y-axis of the pad.
     * @default false
     */
    disableY?: boolean;
    /**
     * @description The initial position of the control knob along the x-axis, where -1 <= initialX <= 1.
     * Note: A non-zero value is only really applicable when the "initialTouchType" retains the current control position ("no-snap" or "visual-snap-to-center")
     * Note: This value is ignored if "disableX" = false
     * @default 0
     */
    initialX?: number;
    /**
     * @description The initial position of the control knob along the y-axis, where -1 <= initialY <= 1.
     * Note: A non-zero value is only really applicable when the "initialTouchType" retains the current control position ("no-snap" or "visual-snap-to-center")
     * Note: This value is ignored if "disableY" = false
     * @default 0
     */
    initialY?: number;
    /**
     * @description The step size to limit the pad's control to, where -1 <= stepSize <= 1.
     * Note: This also applies to the visual control knob position.
     * @default 0
     */
    stepSize?: number;
    /**
     * @description Whether to keep the control knob completely within the bounds of the pad.
     * When true, the control-knob can be moved as far as the circumference touching the edge of pad.
     * When false, the control-knob can be moved as far as the center point touching the edge of the pad.
     * When false, the user will have a larger area to work with resulting in better accuracy, however there is the possibility that
     * the control-knob can visually overlap surrounding components.
     * @default false
     */
    keepControlCompletelyInPadBounds?: boolean;
    /**
     * @description The type of initial touch down
     * @option "no-snap" - Control knob will remain centered and your initial value will remain as {0, 0}. No callbacks will be called until a move.
     * @option "snap-to-value" - Control knob will snap to center on your initial touch. This position is treated as a value and will fire the onValue callback.
     * @option "visual-snap-to-center" - Entire pad will snap to center on your initial touch. The control knob remains centered in the pad and your initial value remains at {0, 0}. No callbacks will be called until a move.
     * @default "no-snap"
     */
    initialTouchType?: InitialTouchType;
    /**
     * @description By default, touching down anywhere within the whole pad will initialize and allow dragging the control knob.
     * Set this to true to only allow a touchdown on the control knob itself.
     */
    ignoreTouchDownInPadArea?: boolean;
    /**
     * @description Whether to use component-relative or absolute co-ordinates from the native touch event.
     * "relative" SHOULD be preferred, however older versions of react-native-gesture-handler have a bug where
     * the co-ordinates are incorrect when dealing with multiple touches.
     * "absolute" should be considered a temporary workaround, as it has it's own problems - such as dealing with the statusbar height and stuff.
     * I have not tested either of these on iOS.
     * @default "relative"
     */
    gestureResolveMode?: "relative" | "absolute";
}

const defaultPadSize = 300;
const defaultControlSize = 100;
const useNativeDriver = true;

export function AxisPad(props: PropsWithChildren<AxisPadProps>): ReactElement {
    const [visualSnapPadToTouchOffset, setVisualSnapPadToTouchOffset] = useState({ x: 0, y: 0 });
    const [startPositionRelativeToPadCenter, setStartPositionRelativeToPadCenter] = useState({
        x: 0,
        y: 0,
    });
    const [padLayoutData, setPadLayoutData] = useState({ width: 0, height: 0, y: 0, x: 0 });
    const [statusBarOffset, setStatusBarOffset] = useState(0);
    const [touchEventHandlerTag, setTouchEventHandlerTag] = useState(0);
    const [controlPositionRelativeToPadCenter, setControlPositionRelativeToPadCenter] =
        useState<InternalTouchEvent>({ x: 0, y: 0, eventType: "setup" });

    const padPositionAnimation = useRef(new Animated.ValueXY());
    const controlPositionAnimation = useRef(new Animated.ValueXY());

    const padViewRef = useRef<View>(null);

    const padSize = props.size || defaultPadSize;
    const controlSize = props.controlSize || defaultControlSize;
    const padWidth = props.disableX ? controlSize : padSize;
    const padHeight = props.disableY ? controlSize : padSize;
    const stepSize = props.stepSize || 0;
    const resolveMode: AxisPadProps["gestureResolveMode"] = props.gestureResolveMode || "relative";
    const initialTouchType: InitialTouchType = props.initialTouchType || "no-snap";
    const resetOnRelease = props.resetOnRelease ?? true;

    const controlBoundRadius = props.keepControlCompletelyInPadBounds
        ? padSize / 2 - controlSize / 2
        : padSize / 2;

    useEffect(() => {
        const initialX =
            !props.disableX && props.initialX ? props.initialX * controlBoundRadius : 0;
        const initialY =
            !props.disableY && props.initialY ? props.initialY * controlBoundRadius : 0;

        setControlPositionRelativeToPadCenter({
            x: initialX,
            y: initialY,
            eventType: "setup",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.initialX, props.initialY, controlBoundRadius]);

    useEffect(() => {
        if (controlPositionRelativeToPadCenter.eventType !== "setup") {
            props.onTouchEvent?.({
                ratio: {
                    x: controlPositionRelativeToPadCenter.x / controlBoundRadius,
                    y: controlPositionRelativeToPadCenter.y / controlBoundRadius,
                },
                eventType: controlPositionRelativeToPadCenter.eventType,
            });
        }

        const isTouchUp = controlPositionRelativeToPadCenter.eventType === "end";

        Animated.timing(controlPositionAnimation.current, {
            toValue: {
                x: controlPositionRelativeToPadCenter.x,
                y: controlPositionRelativeToPadCenter.y,
            },
            duration: isTouchUp ? 350 : 0,
            easing: Easing.elastic(4),
            useNativeDriver: useNativeDriver,
        }).start();

        const anyProps = props as any;
        anyProps.UNIT_TEST_CALLBACKS?.onControlPositionChange({
            x: controlPositionRelativeToPadCenter.x,
            y: controlPositionRelativeToPadCenter.y,
            eventType: controlPositionRelativeToPadCenter.eventType,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        controlPositionRelativeToPadCenter.x,
        controlPositionRelativeToPadCenter.y,
        controlPositionRelativeToPadCenter.eventType,
        controlBoundRadius,
    ]);

    useEffect(() => {
        setStatusBarOffset(StatusBar.currentHeight ?? 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [StatusBar.currentHeight]);

    useEffect(() => {
        Animated.timing(padPositionAnimation.current, {
            toValue: {
                x: visualSnapPadToTouchOffset.x,
                y: visualSnapPadToTouchOffset.y,
            },
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: useNativeDriver,
        }).start();

        const anyProps = props as any;
        anyProps.UNIT_TEST_CALLBACKS?.onPadPositionChange({
            x: visualSnapPadToTouchOffset.x,
            y: visualSnapPadToTouchOffset.y,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visualSnapPadToTouchOffset.x, visualSnapPadToTouchOffset.y]);

    const manageTouch = (
        nativeEvent: GestureEvent<PanGestureHandlerEventPayload>["nativeEvent"],
        eventType: AxisPadTouchEventType
    ): boolean => {
        let relativePoint: Point;

        if (resolveMode === "absolute") {
            relativePoint = {
                x: nativeEvent.absoluteX - padLayoutData.x,
                y: nativeEvent.absoluteY - padLayoutData.y + statusBarOffset,
            };
        } else {
            relativePoint = {
                x: nativeEvent.x,
                y: nativeEvent.y,
            };
        }

        const downPositionRelativeToPadCenter = {
            x: relativePoint.x - padLayoutData.width / 2,
            y: relativePoint.y - padLayoutData.height / 2,
        };

        const newControlPositionRelativeToPadCenter = {
            x: props.disableX
                ? 0
                : downPositionRelativeToPadCenter.x - startPositionRelativeToPadCenter.x,
            y: props.disableY
                ? 0
                : downPositionRelativeToPadCenter.y - startPositionRelativeToPadCenter.y,
        };

        if (eventType === "start") {
            // in both no-snap and visual-snap-to-center, we need to start with the existing position
            // which may be a non (0, 0) position if resetOnRelease = false
            if (initialTouchType === "no-snap" || initialTouchType === "visual-snap-to-center") {
                newControlPositionRelativeToPadCenter.x = controlPositionRelativeToPadCenter.x;
                newControlPositionRelativeToPadCenter.y = controlPositionRelativeToPadCenter.y;
            }

            // control knob might be elsewhere, if resetOnRelease = false, so we need to use control position not just pad center
            const touchRelativeToControlCenter = {
                x: downPositionRelativeToPadCenter.x - controlPositionRelativeToPadCenter.x,
                y: downPositionRelativeToPadCenter.y - controlPositionRelativeToPadCenter.y,
            };

            // NOTE these ignore touch cases only really apply to XY pads.
            // they should probably take into account X only or Y only pads, but it still seems to work pretty well in those cases.

            const touchDistanceToControlCenter2 =
                touchRelativeToControlCenter.x ** 2 + touchRelativeToControlCenter.y ** 2;
            const touchIsOutsideControlKnob =
                touchDistanceToControlCenter2 > (controlSize / 2) ** 2;

            if (props.ignoreTouchDownInPadArea) {
                if (touchIsOutsideControlKnob) {
                    return false;
                }
            } else {
                const touchDistanceToPadCenter2 =
                    downPositionRelativeToPadCenter.x ** 2 + downPositionRelativeToPadCenter.y ** 2;

                // we are touching outside the pad, but the control knob may be outside the pad, so we should still accept it
                if (touchIsOutsideControlKnob && touchDistanceToPadCenter2 > (padSize / 2) ** 2) {
                    return false;
                }
            }

            const _startPositionRelativeToPadCenter = { x: 0, y: 0 };
            const _visualSnapPadToTouchOffset = { x: 0, y: 0 };

            switch (initialTouchType) {
                case "no-snap":
                    _startPositionRelativeToPadCenter.x = touchRelativeToControlCenter.x;
                    _startPositionRelativeToPadCenter.y = touchRelativeToControlCenter.y;
                    break;
                case "snap-to-value":
                    break;
                case "visual-snap-to-center":
                    _visualSnapPadToTouchOffset.x = touchRelativeToControlCenter.x;
                    _visualSnapPadToTouchOffset.y = touchRelativeToControlCenter.y;
                    break;
            }

            setStartPositionRelativeToPadCenter(_startPositionRelativeToPadCenter);
            setVisualSnapPadToTouchOffset(_visualSnapPadToTouchOffset);
        }

        const controlPositionRelativeToPadCenter2 =
            newControlPositionRelativeToPadCenter.x ** 2 +
            newControlPositionRelativeToPadCenter.y ** 2;

        if (controlPositionRelativeToPadCenter2 > controlBoundRadius ** 2) {
            // limit control position to bounds when outside pad
            const angle = Math.atan2(
                newControlPositionRelativeToPadCenter.y,
                newControlPositionRelativeToPadCenter.x
            );
            newControlPositionRelativeToPadCenter.x = controlBoundRadius * Math.cos(angle);
            newControlPositionRelativeToPadCenter.y = controlBoundRadius * Math.sin(angle);
        }

        const stepLimiter = (position: number): number => {
            let ratio = position / controlBoundRadius;
            ratio = stepSize ? Math.round(ratio / stepSize) * stepSize : ratio;
            ratio = Math.min(1, Math.max(-1, ratio));
            return ratio * controlBoundRadius;
        };

        setControlPositionRelativeToPadCenter({
            x: props.disableX ? 0 : stepLimiter(newControlPositionRelativeToPadCenter.x),
            y: props.disableY ? 0 : stepLimiter(newControlPositionRelativeToPadCenter.y),
            eventType: eventType,
        });

        return true;
    };

    const onPanning = (event: GestureEvent<PanGestureHandlerEventPayload>) => {
        const { nativeEvent } = event;

        if (nativeEvent.handlerTag !== touchEventHandlerTag) {
            return;
        }

        manageTouch(nativeEvent, "pan");
    };

    const onHandlerStateChange = (
        event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>
    ) => {
        const { nativeEvent } = event;

        if (nativeEvent.state === GestureEventState.BEGAN) {
            if (touchEventHandlerTag) {
                return;
            }

            const didAcceptTouchEvent = manageTouch(nativeEvent, "start");

            if (didAcceptTouchEvent) {
                setTouchEventHandlerTag(nativeEvent.handlerTag);
            }
        } else if (
            nativeEvent.state === GestureEventState.CANCELLED ||
            nativeEvent.state === GestureEventState.END ||
            nativeEvent.state === GestureEventState.FAILED
        ) {
            if (nativeEvent.handlerTag !== touchEventHandlerTag) {
                return;
            }
            if (resetOnRelease) {
                setControlPositionRelativeToPadCenter({ x: 0, y: 0, eventType: "end" });
            } else {
                manageTouch(nativeEvent, "end");
            }

            setTouchEventHandlerTag(0);
            setVisualSnapPadToTouchOffset({ x: 0, y: 0 });
        }
    };

    const getPadLayoutData = () => {
        padViewRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
            setPadLayoutData({
                x: pageX,
                y: pageY,
                width: width,
                height: height,
            });
        });
    };

    const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

    // if the actual size of the pad doesn't change then onLayout isn't called, meaning
    // offsets are wrong if screen orientation changes.
    // it would be lovely if the gesture handler relative positions worked properly with multi-touch, but for now
    // using absolute coords and page offset seems to work fine. Apart from the statusbar nonsense. oh well.
    useEffect(getPadLayoutData, [windowWidth, windowHeight]);

    return (
        <PanGestureHandler
            id={props.id}
            testID={`test-root-pan-gesture-handler:${props.id}`}
            onGestureEvent={onPanning}
            onHandlerStateChange={onHandlerStateChange}
        >
            <Animated.View
                ref={padViewRef}
                onLayout={getPadLayoutData}
                style={[
                    getPadBackgroundStyle(props, padWidth, padHeight),
                    {
                        transform: padPositionAnimation.current.getTranslateTransform(),
                    },
                ]}
            >
                <AxisPadStick
                    testID={`test-pad-background-view:${props.id}`}
                    stickStyle={props.stickStyle}
                    controlPositionRelativeToPadCenter={controlPositionRelativeToPadCenter}
                />
                <Animated.View
                    testID={`test-control-knob-view:${props.id}`}
                    style={[
                        getControlStyle(props, controlSize),
                        {
                            transform: controlPositionAnimation.current.getTranslateTransform(),
                        },
                    ]}
                >
                    {props.children}
                </Animated.View>
            </Animated.View>
        </PanGestureHandler>
    );
}

function getPadBackgroundStyle(props: AxisPadProps, padWidth: number, padHeight: number) {
    return {
        ...styles.padBackgroundStyle,
        ...props.padBackgroundStyle,
        width: padWidth,
        height: padHeight,
    };
}

function getControlStyle(props: AxisPadProps, size: number) {
    return {
        ...styles.controlStyle,
        ...props.controlStyle,
        width: size,
        height: size,
    };
}

interface AxisPadStickProps {
    stickStyle?: ViewStyle;
    controlPositionRelativeToPadCenter: Point;
}

function AxisPadStick(props: AxisPadStickProps & { testID: string }): ReactElement {
    if (!props.stickStyle) {
        return <></>;
    }

    const { x: relativeX, y: relativeY } = props.controlPositionRelativeToPadCenter;

    let stickSize = 40;

    if (props.stickStyle.width) {
        if (typeof props.stickStyle.width === "string") {
            stickSize = parseInt(props.stickStyle.width, 10);
        } else {
            stickSize = props.stickStyle.width as number;
        }
    }

    const controlDistance = (relativeX ** 2 + relativeY ** 2) ** 0.5;
    const stickWidth = controlDistance + stickSize;
    const stickAngleRadians = Math.atan2(relativeY, relativeX);

    const translateX = (controlDistance / 2) * Math.cos(stickAngleRadians);
    const translateY = (controlDistance / 2) * Math.sin(stickAngleRadians);

    return (
        <Animated.View
            style={[
                styles.stickStyle,
                props.stickStyle,
                {
                    width: stickWidth,
                    height: stickSize,
                    transform: [
                        { translateX: translateX },
                        { translateY: translateY },
                        { rotateZ: `${stickAngleRadians}rad` },
                    ],
                },
            ]}
            testID={props.testID}
        />
    );
}

const styles = StyleSheet.create({
    padBackgroundStyle: {
        borderRadius: 10000,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#00000033",
    },
    controlStyle: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10000,
        backgroundColor: "#00000066",
    },
    stickStyle: {
        position: "absolute",
        borderRadius: 10000,
    },
});
