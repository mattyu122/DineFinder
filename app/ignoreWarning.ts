import { LogBox } from 'react-native';

// Ignore specific log notifications by message
LogBox.ignoreLogs([
    'Warning: DatePicker: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.',
    'Warning: Header: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.',
    'Warning: Star: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.',
    'Warning: TapRating: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.'
]);