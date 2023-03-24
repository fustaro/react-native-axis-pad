import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useMemo } from 'react';
import { AppScreen, Drawer } from './Navigation';
import { AxisPadWithValueText } from './components/AxisPadWithValueText';
import { AxisPadStyles, PageStyles } from './DefaultStyles';

export default function App() {
	const mainScreen = useMemo(() => AppScreen({
		name: "Test",
		headerTitle: '2 dials',
		screenComponent: MainScreen
	}), []);

	const anotherScreen = useMemo(() => AppScreen({
		name: "Test 2",
		headerTitle: 'many dials',
		screenComponent: AnotherScreen
	}), []);

	return (
		<NavigationContainer>
			<Drawer.Navigator
				initialRouteName = "Test">
				{ [ mainScreen, anotherScreen ] }
			</Drawer.Navigator>
		</NavigationContainer>
	);
}

const MainScreen = () => {
	return (
		<View style = { PageStyles.landscapePage }>
			<AxisPadWithValueText
				name = { "pad1" }
				resetOnRelease = { true }
				stepSize = { 0 }
				size = { 250 }
				padBackgroundStyle = { AxisPadStyles.pad }
				controlStyle = { AxisPadStyles.controlKnob }
				ignoreTouchDownInPadArea = { false }
				initialTouchType = { "no-snap" }
				stickStyle = { AxisPadStyles.largeStick }
			/>
			<AxisPadWithValueText
				name = { "pad2" }
				resetOnRelease = { true }
				stepSize = { 0 }
				size = { 250 }
				padBackgroundStyle = { AxisPadStyles.pad }
				controlStyle = { AxisPadStyles.controlKnob }
				ignoreTouchDownInPadArea = { false }
				initialTouchType = { "no-snap" }
				stickStyle = { AxisPadStyles.largeStick }
			/>
		</View>
	);
}

const AnotherScreen = () => {
	return (
		<View style = { PageStyles.landscapePage }>
			<AxisPadWithValueText
				name = { "pad1" }
				resetOnRelease = { true }
				stepSize = { 0 }
				size = { 250 }
				padBackgroundStyle = { AxisPadStyles.pad }
				controlStyle = { AxisPadStyles.controlKnob }
				ignoreTouchDownInPadArea = { false }
				initialTouchType = { "visual-snap-to-center" }
				stickStyle = { AxisPadStyles.largeStick }
			/>
			<View>
				<View style = { { flexDirection: "row" } }>
					<AxisPadWithValueText
						name = { "pad2-1-1" }
						resetOnRelease = { false }
						stepSize = { 0 }
						size = { 150 }
						controlSize = { 60 }
						padBackgroundStyle = { AxisPadStyles.pad }
						controlStyle = { AxisPadStyles.controlKnob }
						ignoreTouchDownInPadArea = { false }
						initialTouchType = { "no-snap" }
						stickStyle = { AxisPadStyles.smallStick }
					/>
					<AxisPadWithValueText
						name = { "pad2-1-2" }
						resetOnRelease = { true }
						stepSize = { 0 }
						size = { 150 }
						controlSize = { 60 }
						padBackgroundStyle = { { ...AxisPadStyles.pad, marginHorizontal: 5 } }
						controlStyle = { AxisPadStyles.controlKnob }
						keepControlCompletleyInPadBounds = { true }
						ignoreTouchDownInPadArea = { false }
						initialTouchType = { "no-snap" }
						disableX = { true }
						stickStyle = { AxisPadStyles.smallStick }
					/>
				</View>
				<AxisPadWithValueText
						name = { "pad2-2-1" }
						resetOnRelease = { true }
						stepSize = { 0 }
						size = { 220 }
						controlSize = { 60 }
						padBackgroundStyle = { { ...AxisPadStyles.pad, marginVertical: 5 } }
						controlStyle = { AxisPadStyles.controlKnob }
						ignoreTouchDownInPadArea = { false }
						keepControlCompletleyInPadBounds = { true }
						initialTouchType = { "no-snap" }
						disableY = { true }
						stickStyle = { AxisPadStyles.smallStick }
					/>
			</View>
		</View>
	);
}
