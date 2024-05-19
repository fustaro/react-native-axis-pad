import { StyleSheet } from "react-native";

export const PageStyles = StyleSheet.create({
    landscapePage: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
    },
});

export const padBackgroundColor = "#00000033";
export const padBorderColor = "#5D3FD366";

export const AxisPadStyles = StyleSheet.create({
    pad: {
        backgroundColor: padBackgroundColor,
        borderColor: padBorderColor,
        borderWidth: 1.5,
    },
    controlKnob: {
        backgroundColor: "#7F00FF44",
        borderColor: padBorderColor,
        borderWidth: 1.5,
    },
    largeStick: {
        width: 40,
        backgroundColor: padBackgroundColor,
        borderColor: "#00000066",
        borderWidth: 1,
    },
    smallStick: {
        width: 20,
        backgroundColor: padBackgroundColor,
        borderColor: "#00000066",
        borderWidth: 1,
    },
});
