import "react";
import { useState } from "react";
import { StyleSheet, View, Button, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AxisPadWithValueText } from "./components/AxisPadWithValueText";
import { AxisPadStyles } from "./DefaultStyles";

export default function App() {
    const [page, setPage] = useState<"2-pads" | "more-pads">("2-pads");

    return (
        <GestureHandlerRootView style={styles.pageContainer}>
            <View style={styles.navContainer}>
                <Button title="2 Pads" onPress={() => setPage("2-pads")} />
                <Button title="More Pads" onPress={() => setPage("more-pads")} />
            </View>
            {page === "2-pads" ? <MainScreen /> : <AnotherScreen />}
        </GestureHandlerRootView>
    );
}

function MainScreen() {
    return (
        <View style={styles.padContainer}>
            <AxisPadWithValueText
                id={"main-pad1"}
                size={250}
                padBackgroundStyle={AxisPadStyles.pad}
                controlStyle={AxisPadStyles.controlKnob}
                ignoreTouchDownInPadArea={false}
                initialTouchType={"no-snap"}
                stickStyle={AxisPadStyles.largeStick}
            />
            <AxisPadWithValueText
                id={"main-pad2"}
                size={250}
                padBackgroundStyle={AxisPadStyles.pad}
                controlStyle={AxisPadStyles.controlKnob}
                ignoreTouchDownInPadArea={false}
                initialTouchType={"no-snap"}
                stickStyle={AxisPadStyles.largeStick}
            />
        </View>
    );
}

function AnotherScreen() {
    return (
        <View style={styles.padContainer}>
            <AxisPadWithValueText
                id={"another-pad1"}
                resetOnRelease={true}
                stepSize={0}
                size={250}
                padBackgroundStyle={AxisPadStyles.pad}
                controlStyle={AxisPadStyles.controlKnob}
                ignoreTouchDownInPadArea={false}
                initialTouchType={"visual-snap-to-center"}
                stickStyle={AxisPadStyles.largeStick}
            />
            <View>
                <View style={{ flexDirection: "row" }}>
                    <AxisPadWithValueText
                        id={"another-pad2-1-1"}
                        resetOnRelease={false}
                        stepSize={0}
                        size={150}
                        controlSize={60}
                        padBackgroundStyle={AxisPadStyles.pad}
                        controlStyle={AxisPadStyles.controlKnob}
                        ignoreTouchDownInPadArea={false}
                        initialTouchType={"no-snap"}
                        stickStyle={AxisPadStyles.smallStick}
                    />
                    <AxisPadWithValueText
                        id={"another-pad2-1-2"}
                        resetOnRelease={true}
                        stepSize={0}
                        size={150}
                        controlSize={60}
                        padBackgroundStyle={{ ...AxisPadStyles.pad, marginHorizontal: 5 }}
                        controlStyle={AxisPadStyles.controlKnob}
                        keepControlCompletelyInPadBounds={true}
                        ignoreTouchDownInPadArea={false}
                        initialTouchType={"no-snap"}
                        disableX={true}
                        stickStyle={AxisPadStyles.smallStick}
                    />
                </View>
                <AxisPadWithValueText
                    id={"another-pad2-2-1"}
                    resetOnRelease={true}
                    stepSize={0}
                    size={220}
                    controlSize={60}
                    padBackgroundStyle={{ ...AxisPadStyles.pad, marginVertical: 5 }}
                    controlStyle={AxisPadStyles.controlKnob}
                    ignoreTouchDownInPadArea={false}
                    keepControlCompletelyInPadBounds={true}
                    initialTouchType={"no-snap"}
                    disableY={true}
                    stickStyle={AxisPadStyles.smallStick}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pageContainer: {
        paddingTop: StatusBar.currentHeight || 0,
        flex: 1,
    },
    navContainer: {
        flexDirection: "row",
        padding: 20,
        justifyContent: "space-evenly",
    },
    padContainer: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly",
    },
});
