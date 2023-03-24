import { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { AxisPad, AxisPadProps, Point } from "../../../src/AxisPad";
import { padBackgroundColor, padBorderColor } from "../DefaultStyles";

const pointDetailsText = (ratio: Point) => {
	const valueX = Math.round(ratio.x*1000)/1000;
	const valueY = Math.round(ratio.y*1000)/1000;
	return `X: ${valueX}, Y: ${valueY}`;
}

export const AxisPadWithValueText = (props: AxisPadProps) => {
	const [ active, setActive ] = useState(false);

	const textRef = useRef<TextInput>(null);

	const onValue = (ratio: Point) => {
		textRef.current?.setNativeProps({ text: pointDetailsText(ratio) });
		!active && setActive(true);
	}

	const onTouchRelease = () => {
		setActive(false);
	}

	const wrapperStyle = active
		? [ styles.wrapper, styles.wrapperActive ]
		: styles.wrapper;

    const textWrapperStyle = active
        ? [ styles.textWrapper, styles.textWrapperActive ]
        : styles.textWrapper;

	return (
		<View style = { wrapperStyle }>
			<View style = { textWrapperStyle }>
				<TextInput ref = { textRef }/>
			</View>
			<AxisPad
				{ ...props }
				onValue = { onValue }
				onTouchRelease = { onTouchRelease }/>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		alignItems: "center",
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: padBackgroundColor,
        padding: 4,
        paddingTop: 0
	},
    wrapperActive: {
        borderColor: padBorderColor
    },
	textWrapper: {
		marginBottom: 4,
		paddingHorizontal: 12,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
		backgroundColor: padBackgroundColor
	},
	textWrapperActive: {
        backgroundColor: padBorderColor
	}
});
