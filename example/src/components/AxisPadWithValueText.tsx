import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AxisPad, AxisPadProps, AxisPadTouchEvent } from "@fustaro/react-native-axis-pad";
import { padBackgroundColor, padBorderColor } from "../DefaultStyles";

function pointDetailsText(x: number, y: number) {
    return `X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`;
}

export function AxisPadWithValueText(props: Omit<AxisPadProps, "onTouchEvent">) {
    const [active, setActive] = useState(false);
    const [text, setText] = useState(pointDetailsText(0, 0));

    const onTouchEvent = (touch: AxisPadTouchEvent) => {
        setText(pointDetailsText(touch.ratio.x, touch.ratio.y));

        if (touch.eventType === "start") {
            setActive(true);
        } else if (touch.eventType === "end") {
            setActive(false);
        }
    };

    const wrapperStyle = active ? [styles.wrapper, styles.wrapperActive] : styles.wrapper;

    const textWrapperStyle = active
        ? [styles.textWrapper, styles.textWrapperActive]
        : styles.textWrapper;

    return (
        <View style={wrapperStyle}>
            <View style={textWrapperStyle}>
                <Text>{text}</Text>
            </View>
            <AxisPad {...props} onTouchEvent={onTouchEvent} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: padBackgroundColor,
        padding: 4,
        paddingTop: 0,
    },
    wrapperActive: {
        borderColor: padBorderColor,
    },
    textWrapper: {
        marginBottom: 4,
        paddingHorizontal: 12,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        backgroundColor: padBackgroundColor,
    },
    textWrapperActive: {
        backgroundColor: padBorderColor,
    },
});
