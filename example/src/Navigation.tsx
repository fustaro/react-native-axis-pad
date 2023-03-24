import type { ReactElement } from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export const Drawer = createDrawerNavigator();
export const Stack = createNativeStackNavigator();

export const AppScreen = (props: {
	name: string,
	headerTitle: string,
	screenComponent: React.FC,
}): ReactElement => {
	const headerTitle = props.headerTitle || props.name;

	/** 
	 * It seems we need to nest a stack navigator here for each drawer screen since only stack screens seem to allow orientation configuration.
	 * Might be useful in the future to have stacks anyway.
	 * The header needs to be the drawer screen though in order to enable the header drawer menu button.
	 */

	return (
		<Drawer.Screen
			name = { props.name }
			key = { props.name }
			options ={ {
				headerTitle,
				headerTransparent: true,
			} }>
			{ () =>
				<Stack.Navigator>
					<Stack.Screen
						name = { `${props.name}-Screen` }
						component = { props.screenComponent }
						options = { {
							orientation: "landscape",
							headerShown: false
						} }/>
				</Stack.Navigator>
			}
		</Drawer.Screen>
	)
}
