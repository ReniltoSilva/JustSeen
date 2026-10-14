import Svg, { Path } from "react-native-svg";

/* The website's own icons (client/src/components/icons.jsx), so both apps look the same */
const Icon = ({ size = 16, color = "#fff", fill = "none", strokeWidth = 2, children }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);

/* Star with a plus: rate and review it */
export const StarPlusIcon = (props) => (
  <Icon {...props}>
    <Path d="M11 17.6 6.2 20.1l.9-5.4-3.9-3.8 5.4-.8L11 5.2l2.4 4.9" />
    <Path d="M18 14v6" />
    <Path d="M15 17h6" />
  </Icon>
);

/* Pencil: edit what I wrote */
export const PencilIcon = (props) => (
  <Icon {...props}>
    <Path d="M12 20h9" />
    <Path d="M16.38 3.62a2.12 2.12 0 0 1 3 3L7.38 18.63 3 20l1.37-4.38Z" />
  </Icon>
);

export const ShareIcon = (props) => (
  <Icon {...props}>
    <Path d="M12 3v12" />
    <Path d="m7 8 5-5 5 5" />
    <Path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </Icon>
);

export const BookmarkIcon = ({ filled = false, ...props }) => (
  <Icon {...props} fill={filled ? props.color ?? "#fff" : "none"}>
    <Path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Icon>
);

export const CloseIcon = (props) => (
  <Icon {...props}>
    <Path d="M18 6 6 18" />
    <Path d="m6 6 12 12" />
  </Icon>
);
