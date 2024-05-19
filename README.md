# @fustaro/react-native-axis-pad

Multi-touch axis / game pad

[Expo Snack](https://snack.expo.dev/@fustaro/fustaro-axis-pad-demo)

![Demo Gif](fustaro-react-native-axis-pad-300.gif)

## Installation

```sh
npm install @fustaro/react-native-axis-pad
```

## Usage

```js
import { AxisPad } from '@fustaro/react-native-axis-pad';

<AxisPad
    id={"move"}
    resetOnRelease={true}
    stepSize={0}
    size={250}
    padBackgroundStyle={axisPadStyle}
    controlStyle={axisControlStyle}
    ignoreTouchDownInPadArea={false}
    initialTouchType={"no-snap"}
    stickStyle={styles.directionPadStickStyle}
    onTouchEvent={onMovePadFeedback} />
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
