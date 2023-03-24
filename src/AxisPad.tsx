import { ReactElement, useEffect, useRef, useState } from 'react';
import { Animated, Easing, ViewStyle, StyleSheet, View, StatusBar, Dimensions } from 'react-native';
import { GestureEvent, HandlerStateChangeEvent, PanGestureHandler, PanGestureHandlerEventPayload, State as GestureEventState } from 'react-native-gesture-handler';

export type InitialTouchType = 'no-snap' | 'snap-to-value' | 'visual-snap-to-center';

export interface AxisPadProps {
    /**
     * @description Convenience prop which does nothing
     */
    name: string;
    /**
     * @description Whether to reset the control knob to center {0, 0} on release (touch up).
     * If true, control knob will animate back to the center and will fire the onValue callback with {0, 0}.
     * If false, the control knob stays where you leave it and the onValue callback is not fired.
     * In both bases, the onTouchRelease callback is fired with the ratios coresponding to where you touched up.
     */
    resetOnRelease?: boolean;
    /**
     * @description Callback called when there is a change in position.
     * @param ratio {Point} The ratio in x and y coresponding to the position of the control knob in the pad.
     * The center point of the pad is {x: 0, y: 0} and the range for each is -1 <= [x|y] <= 1
     */
    onValue?: (ratio: Point) => void;
    /**
     * @description callback called when the control knob is released (touch up).
     * @param ratio {Point} The ratio in x and y coresponding to the position of the control knob in the pad.
     * The center point of the pad is {x: 0, y: 0} and the range for each is -1 <= [x|y] <= 1
     */
    onTouchRelease?: (ratio: Point) => void;
    padBackgroundStyle?: ViewStyle;
    controlStyle?: ViewStyle;
    stickStyle?: ViewStyle;
    size?: number;
    controlSize?: number;
    disableX?: boolean;
    disableY?: boolean;
    initialX?: number;
    initialY?: number;
    stepSize?: number;
    keepControlCompletleyInPadBounds?: boolean;
    /**
     * @description The type of initial touch down
     * @option "no-snap" - Control knob will remain centered and your initial value will remain as {0, 0}. No callbacks will be called until a move.
     * @option "snap-to-value" - Control knob will snap to center on your initial touch. This position is treated as a value and will fire the onValue callback.
     * @option "visual-snap-to-center" - Entire pad will snap to center on your initial touch. The control knob remains centered in the pad and your initial value remains at {0, 0}. No callbacks will be called until a move.
     * @default "no-snap"
     */
    initialTouchType?: InitialTouchType;
    ignoreTouchDownInPadArea?: boolean;
    gestureResolveMode?: "relative" | "absolute";
}

export interface Point {
    x: number;
    y: number;
}

const defaultPadSize = 300;
const defaultControlSize = 100;
const useNativeDriver = true;

export const AxisPad = (props: React.PropsWithChildren<AxisPadProps>): ReactElement => {
    const [ visualSnapPadToTouchOffset, setVisualSnapPadToTouchOffset ] = useState({x: 0, y: 0});
    const [ startPositionRelativeToPadCenter, setStartPositionRelativeToPadCenter ] = useState({x: 0, y: 0});
    const [ padLayoutData, setPadLayoutData ] = useState({width: 0, height: 0, y: 0, x: 0});
    const [ statusBarOffset, setStatusBarOffset ] = useState(0);
    const [ touchEventHandlerTag, setTouchEventHandlerTag ] = useState(0);
    const [ controlPositionRelativeToPadCenter, setControlPositionRelativeToPadCenter ] = useState({x: 0, y: 0, touchUp: false });

    const padPositionAnimation = useRef(new Animated.ValueXY()).current;
    const controlPositionAnimation = useRef(new Animated.ValueXY()).current;

    const padSize = props.size || defaultPadSize;
    const controlSize = props.controlSize || defaultControlSize;
    const padWidth = props.disableX ? props.padBackgroundStyle?.width ? props.padBackgroundStyle.width : controlSize : padSize;
    const padHeight = props.disableY ? props.padBackgroundStyle?.height ? props.padBackgroundStyle.height : controlSize : padSize;
    const stepSize = props.stepSize || 0;
    const resolveMode: AxisPadProps["gestureResolveMode"] = props.gestureResolveMode || "relative";
    const initialTouchType: InitialTouchType = props.initialTouchType || "no-snap";

    const controlBoundRadius = props.keepControlCompletleyInPadBounds ? padSize/2 - controlSize/2 : padSize/2;

    useEffect(() => {
        const initialX = props.initialX ? props.initialX*controlBoundRadius : 0;
        const initialY = props.initialY ? props.initialY*controlBoundRadius : 0;

        setControlPositionRelativeToPadCenter({
            x: initialX,
            y: initialY,
            touchUp: false
        });
    }, [props.initialX, props.initialY]);

    useEffect(() => {
        props.onValue && props.onValue({
            x: controlPositionRelativeToPadCenter.x / controlBoundRadius,
            y: controlPositionRelativeToPadCenter.y / controlBoundRadius
        });

        Animated.timing(
            controlPositionAnimation,
            {
                toValue: {
                    x: controlPositionRelativeToPadCenter.x,
                    y: controlPositionRelativeToPadCenter.y
                },
                duration: controlPositionRelativeToPadCenter.touchUp ? 350: 0,
                easing: Easing.elastic(4),
                useNativeDriver: useNativeDriver
            }
        ).start();
    }, [ controlPositionRelativeToPadCenter.x, controlPositionRelativeToPadCenter.y ]);

    useEffect(() => {
        setStatusBarOffset(StatusBar.currentHeight ?? 0);
    }, [ StatusBar.currentHeight ]);

    useEffect(() => {
        Animated.timing(
            padPositionAnimation,
            {
                toValue: {
                    x: visualSnapPadToTouchOffset.x,
                    y: visualSnapPadToTouchOffset.y
                },
                duration: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: useNativeDriver
            }
        ).start();
    }, [ visualSnapPadToTouchOffset.x, visualSnapPadToTouchOffset.y ]);

    const manageTouch = (relativePoint: Point, isInitialTouchDown: boolean): boolean => {
        const downPositionRelativeToPadCenter = {
            x: props.disableX ? 0 : relativePoint.x - padLayoutData.width / 2,
            y: props.disableY ? 0 : relativePoint.y - padLayoutData.height / 2
        };

        const newControlPositionRelativeToPadCenter = {
            x: downPositionRelativeToPadCenter.x - startPositionRelativeToPadCenter.x,
            y: downPositionRelativeToPadCenter.y - startPositionRelativeToPadCenter.y
        };

        if(isInitialTouchDown){
            if(initialTouchType === 'no-snap' || initialTouchType === 'visual-snap-to-center'){
                newControlPositionRelativeToPadCenter.x = controlPositionRelativeToPadCenter.x;
                newControlPositionRelativeToPadCenter.y = controlPositionRelativeToPadCenter.y;
            }

            if(!props.resetOnRelease){
                newControlPositionRelativeToPadCenter.x = controlPositionRelativeToPadCenter.x;
                newControlPositionRelativeToPadCenter.y = controlPositionRelativeToPadCenter.y;
            }

            if(props.ignoreTouchDownInPadArea){
                // control knob might be elsewhere, e.g. if we dont have resetOnRelease, so we need to use control position not just pad center
                const touchRelativeToControlCenter = {
                    x: downPositionRelativeToPadCenter.x - controlPositionRelativeToPadCenter.x,
                    y: downPositionRelativeToPadCenter.y - controlPositionRelativeToPadCenter.y
                };
    
                const touchDistanceToControlCenter2 = touchRelativeToControlCenter.x**2 + touchRelativeToControlCenter.y**2;
    
                if(touchDistanceToControlCenter2 > (controlSize/2)**2){
                    return false;
                }
            } else {
                const touchDistanceToPadCenter2 = downPositionRelativeToPadCenter.x**2 + downPositionRelativeToPadCenter.y**2;

                if(touchDistanceToPadCenter2 > (padSize/2)**2){
                   return false;
                }
            }
        }

        const controlPositionRelativeToPadCenter2 = newControlPositionRelativeToPadCenter.x**2 + newControlPositionRelativeToPadCenter.y**2;

        if(controlPositionRelativeToPadCenter2 > controlBoundRadius**2){
            // limit contol position to bounds when outside pad
            const angle = Math.atan2(newControlPositionRelativeToPadCenter.y, newControlPositionRelativeToPadCenter.x);
            newControlPositionRelativeToPadCenter.x = controlBoundRadius * Math.cos(angle);
            newControlPositionRelativeToPadCenter.y = controlBoundRadius * Math.sin(angle);
        }

        if(isInitialTouchDown){
            const startPositionRelativeToPadCenter = { x: 0, y: 0 };
            const visualSnapPadToTouchOffset = { x: 0, y: 0 };

            switch(initialTouchType){
                case 'no-snap':
                    startPositionRelativeToPadCenter.x = downPositionRelativeToPadCenter.x;
                    startPositionRelativeToPadCenter.y = downPositionRelativeToPadCenter.y;
                    break;
                case 'snap-to-value':
                    break;
                case 'visual-snap-to-center':
                    visualSnapPadToTouchOffset.x = downPositionRelativeToPadCenter.x;
                    visualSnapPadToTouchOffset.y = downPositionRelativeToPadCenter.y;
                    downPositionRelativeToPadCenter.x = 0;
                    downPositionRelativeToPadCenter.y = 0;
                    break;
            }

            if(!props.resetOnRelease){            
                const touchRelativeToControlCenter = {
                    x: downPositionRelativeToPadCenter.x - controlPositionRelativeToPadCenter.x,
                    y: downPositionRelativeToPadCenter.y - controlPositionRelativeToPadCenter.y
                };
                startPositionRelativeToPadCenter.x = touchRelativeToControlCenter.x;
                startPositionRelativeToPadCenter.y = touchRelativeToControlCenter.y;
            }

            setStartPositionRelativeToPadCenter(startPositionRelativeToPadCenter);
            setVisualSnapPadToTouchOffset(visualSnapPadToTouchOffset);
        }

        const stepLimiter = (value: number): number => {
            let result = value / controlBoundRadius
            result = stepSize ? Math.round(result / stepSize) * stepSize : result;
            result = Math.min(1, Math.max(-1, result));
            return result * controlBoundRadius;
        }

        setControlPositionRelativeToPadCenter({
            x: props.disableX ? 0 : stepLimiter(newControlPositionRelativeToPadCenter.x),
            y: props.disableY ? 0 : stepLimiter(newControlPositionRelativeToPadCenter.y),
            touchUp: false
        });

        return true;
    }

    const onPanning = (event: GestureEvent<PanGestureHandlerEventPayload>) => {
        const { nativeEvent } = event;

        if(nativeEvent.handlerTag !== touchEventHandlerTag){
            return;
        }

        if(resolveMode === "absolute"){
            manageTouch({
                x: nativeEvent.absoluteX - padLayoutData.x,
                y: nativeEvent.absoluteY - padLayoutData.y + statusBarOffset
            }, false);
        } else {
            manageTouch({
                x: nativeEvent.x,
                y: nativeEvent.y
            }, false);
        }
    }

    const endPanning = () => {
        const lastPoint = { ...controlPositionRelativeToPadCenter }

        setTouchEventHandlerTag(0);
        setVisualSnapPadToTouchOffset({ x: 0, y: 0 });

        if(props.resetOnRelease){
            setControlPositionRelativeToPadCenter({ x: 0, y: 0, touchUp: true });
        }
        
        if(props.onTouchRelease){
            // onValue is called on state change so naturally in next tick,
            // it's possible to receive onValue after onTouchRelease without this
            setImmediate(() => {
                props.onTouchRelease && props.onTouchRelease({
                    x: lastPoint.x / controlBoundRadius,
                    y: lastPoint.y / controlBoundRadius
                });
            });
        }
    }

    const initializePanning = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
        if(touchEventHandlerTag){
            return;
        }

        const { nativeEvent } = event;

        if(nativeEvent.state === GestureEventState.BEGAN){
            let didAcceptTouchEvent = false;

            if(resolveMode === "absolute"){
                didAcceptTouchEvent = manageTouch({
                    x: nativeEvent.absoluteX - padLayoutData.x,
                    y: nativeEvent.absoluteY - padLayoutData.y + statusBarOffset
                }, true);
            } else {
                didAcceptTouchEvent =  manageTouch({
                    x: nativeEvent.x,
                    y: nativeEvent.y
                }, true);
            }

            if(didAcceptTouchEvent){
                setTouchEventHandlerTag(nativeEvent.handlerTag);
            }
        }
    }

    const padViewRef = useRef<View>();

    const getPadLayoutData = () => {
        padViewRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
            setPadLayoutData({
                x: pageX,
                y: pageY,
                width: width,
                height: height
            });
        });
    }

    const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

    // if the actual size of the pad doesn't change then onLayout isn't called, meaning
    // offsets are wrong if screen orientation changes.
    // it would be lovely if the gesture handler relative positions worked properly with multitouch, but for now
    // using absolute coords and page offset seems to work fine. Apart from the statusbar nonsense. oh well.
    useEffect(getPadLayoutData, [ windowWidth, windowHeight ]);

    return (
        <PanGestureHandler
            onGestureEvent = { onPanning }
            onHandlerStateChange = { initializePanning }
            onEnded = { endPanning }
            onCancelled = { endPanning }
            onFailed = { endPanning }>
            <Animated.View
                ref = { padViewRef }
                onLayout = { getPadLayoutData }
                style = { [ styles.padBackgroundStyle, props.padBackgroundStyle, {
                    width: padWidth,
                    height: padHeight,
                    transform: padPositionAnimation.getTranslateTransform() 
                }] }>
                <AxisPadStick
                    stickStyle = { props.stickStyle } 
                    controlPositionRelativeToPadCenter = { controlPositionRelativeToPadCenter }/>
                <Animated.View
                    style = { [ styles.controlStyle, props.controlStyle, {
                        width: controlSize,
                        height: controlSize,
                        transform: controlPositionAnimation.getTranslateTransform()
                    }] }>
                    { props.children }
                </Animated.View>
            </Animated.View>
        </PanGestureHandler>
    ) 
}

interface AxisPadStickProps {
    stickStyle?: ViewStyle;
    controlPositionRelativeToPadCenter: Point;
}

const AxisPadStick = (props: AxisPadStickProps): ReactElement => {
    if(!props.stickStyle){
        return <></>;
    }

    const {
        x: relativeX,
        y: relativeY
    } = props.controlPositionRelativeToPadCenter;

    let stickSize = 40;

    if(props.stickStyle.width){
        if(typeof (props.stickStyle.width) === 'string'){
            stickSize = parseInt(props.stickStyle.width);
        } else {
            stickSize = props.stickStyle.width;
        }
    }

    const controlDistance = (relativeX**2 + relativeY**2)**0.5;
    const stickWidth = controlDistance + stickSize;
    const stickAngleRadians = Math.atan2(relativeY, relativeX);

    const translateX = controlDistance / 2 * Math.cos(stickAngleRadians);
    const translateY = controlDistance / 2 * Math.sin(stickAngleRadians); 

    return (
        <Animated.View style = { [ props.stickStyle, {
            position: 'absolute',
            borderRadius: 10000,
            width: stickWidth,
            height: stickSize,
            transform: [
                { translateX: translateX },
                { translateY: translateY },
                { rotateZ: `${stickAngleRadians}rad` }
            ]
        }] }/>
    )
}

const styles = StyleSheet.create({
    padBackgroundStyle: {
        width: defaultPadSize,
        height: defaultPadSize,
        borderRadius: 10000,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000033'
    },
    controlStyle: {
        width: defaultControlSize,
        height: defaultControlSize,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10000,
        backgroundColor: '#00000066'
    }
});
