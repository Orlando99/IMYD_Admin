import {
  cyan700,
  grey100, grey200, grey300, grey400, grey500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';

export const IMYDTheme = {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: '#9ccd21',
    primary2Color: cyan700,
    primary3Color: grey400,
    accent1Color: grey500,
    accent2Color: grey200,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: grey100,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: grey100,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  },
  drawer: {
    position: 'relative',
    top: 90,
    width: 290
  },
  editButton: {
    minWidth: 20
  }
};