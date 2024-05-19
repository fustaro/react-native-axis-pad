import type { ReactElement } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export const Drawer = createDrawerNavigator();
export const Stack = createNativeStackNavigator();

interface AppScreenProps {
    name: string;
    headerTitle: string;
    screenComponent: React.FC;
}

export function AppScreen({ name, headerTitle, screenComponent }: AppScreenProps): ReactElement {
    headerTitle = headerTitle || name;

    return (
        <Drawer.Screen
            name={name}
            key={name}
            options={{
                headerTitle,
                headerTransparent: true,
            }}
        >
            {() => (
                <Stack.Navigator>
                    <Stack.Screen
                        name={`${name}-Screen`}
                        component={screenComponent}
                        options={{
                            orientation: "landscape",
                            headerShown: false,
                        }}
                    />
                </Stack.Navigator>
            )}
        </Drawer.Screen>
    );
}
